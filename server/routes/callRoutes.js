import express from 'express'
import Call from '../models/Call.js'
import {verifyToken} from "../authMiddleware.js";
import { v4 as uuidv4 } from 'uuid' 

import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import { transcribeAudio } from '../services/whisperService.js';
import mockTranscript from '../services/mockTranscriptService.js';
import { generateMetadata } from '../services/aiMetadataService.js';
import { generateFichePDF } from '../services/pdfGenerationService.js';
import { extractCandidateInfo } from '../services/ficheExtractionService.js';
import config from '../config.js'

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../records'))
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now()
        const uuid = uuidv4()
        cb(null, `${req.params.callId}-${timestamp}-${uuid}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm']
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'))
        }
    }
})


const router = express.Router()

router.post('/', verifyToken, async (req, res) => {
    try {
        const call = new Call({
            callId: Math.random().toString(36).substring(2, 9),
            startedAt: new Date(),
        });
        await call.save()

        res.status(201).json(call)
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la création de l\'appel' })
    }
})

router.get('/', verifyToken, async (req, res) => {
    try {
        const calls = await Call.find({}).sort({ startedAt: -1 });
        res.status(200).json(calls)
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des appels' })
    }
})

router.get('/:callId', async (req, res) => {
    try {
        const call = await Call.findOne({ callId: req.params.callId })
        if (!call) return res.status(404).json({ error: 'Appel non trouvé' })
        res.json(call)
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' })
    }
})

router.delete('/:callId', verifyToken, async (req, res) => {
    try {
        const call = await Call.findOneAndDelete({ callId: req.params.callId })
        if (!call) return res.status(404).json({ error: 'Appel non trouvé' })

        res.status(200).json({ message: 'Appel supprimé avec succès' })
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'appel' })
    }
});

router.put('/:callId/audio', verifyToken, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier audio fourni' })
        }

        const inputPath = req.file.path;
        const outputFilename = req.file.filename.replace(/\.(webm|ogg|wav)$/, '.mp3');
        const outputPath = path.join('records', outputFilename);

        try {
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .toFormat('mp3')
                    .audioCodec('libmp3lame')
                    .on('error', err => {
                        reject(new Error(`Erreur FFmpeg: ${err.message}`));
                    })
                    .on('end', resolve)
                    .save(outputPath);
            });

        } catch (error) {
            console.error("Erreur générale:", error.message);

            await fs.unlink(inputPath).catch(() => {});
            await fs.unlink(outputPath).catch(() => {});

            return res.status(500).json({
                error: "Une erreur est survenue lors de la conversion de l’audio.",
                details: error.message
            });
        }


        const call = await Call.findOne({ callId: req.params.callId })
        if (!call) {
            return res.status(404).json({ 
                error: 'Appel non trouvé',
                savedAudioPath: outputFilename
            })
        }

        call.audioPath = outputFilename;
        call.endedAt = new Date();
        call.transcript = {
            status: 'waiting',
            txtContent: '',
            error: '',
            info: {} 
        }
        await call.save()

        // Choose transcription method based on config
        const transcriptionPromise = config.transcription.useMock ? mockTranscript() : transcribeAudio(req.file.path);

        // Do transcription in background
        transcriptionPromise
            .then(async (transcriptText) => {
                let aiData = {};
                let fichePdfPath = null;

                // Si useAI est true, générer les métadonnées
               if (call.useAI) {
                    aiData = await generateMetadata(transcriptText) || {}
               }

                const candidateInfo = await extractCandidateInfo(transcriptText);
                if (candidateInfo) {
                    fichePdfPath = await generateFichePDF(candidateInfo, req.params.callId, transcriptText);
                }

                const newFiche = fichePdfPath
                    ? {
                        pdfPath: fichePdfPath,
                        metadata: candidateInfo,
                        createdAt: new Date()
                    }
                    : null;

                const updateOps = {
                    $set: {
                        transcript: {
                            status: 'success',
                            txtContent: transcriptText || '',
                            error: '',
                            info: aiData
                        }
                    }
                };

                if (newFiche) {
                    updateOps.$push = { fiche: newFiche };
                }

                await Call.findOneAndUpdate(
                    { callId: req.params.callId },
                    updateOps,
                    { new: true }
                );
                
                console.log('Transcription and PDF saved for call:', req.params.callId);
            })
            .catch(async (error) => {
                await Call.findOneAndUpdate(
                    { callId: req.params.callId },
                    { 
                        transcript: {
                            status: 'error',
                            txtContent: '',
                            error: error.message,
                            info: {}
                        }
                    },
                    { new: true }
                );
                
                console.error('Transcription error:', error);
            }); 

        res.status(200).json({ message: 'Audio enregistré avec succès', call})
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'audio',savedAudioPath: req.file?.filename})
    }
});

router.post('/:callId/chat', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message invalide' });
        }

        const call = await Call.findOne({ callId: req.params.callId });
        if (!call || !call.fiche || call.fiche.length === 0) {
            return res.status(404).json({ error: 'Aucune fiche trouvée pour cet appel.' });
        }

        const lastFiche = call.fiche[call.fiche.length - 1];
        const currentMetadata = lastFiche.metadata || {};
        const transcriptionText = call.transcript?.txtContent || '';
        const chatHistory = (call.chat || []).map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
        }));

        call.chat = call.chat || [];
        call.chat.push({ role: "user", content: message, date: new Date() });

        const systemPrompt = `Tu es un assistant IA pour Riviera Connection. Tu dois répondre uniquement via l'appel de fonction JSON fourni, sans ajouter d'explication ni de texte. Si la modification est un succès, tu dois impérativement inclure un champ \`updatedMetadata\` représentant les métadonnées finales après modification. Même si un seul champ a changé. Voici les métadonnées actuelles :
${JSON.stringify(currentMetadata)}
`;

        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...chatHistory,
                { role: "user", content: message }
            ],
            tools: [{
                type: "function",
                function: {
                    name: "update_metadata",
                    description: "Répond avec un statut, un message, et éventuellement les métadonnées modifiées",
                    parameters: {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["success", "error"] },
                            message: { type: "string" },
                            updatedMetadata: { type: "object" }
                        },
                        required: ["status", "message"]
                    }
                }
            }],
            tool_choice: { type: "function", function: { name: "update_metadata" } }
        });

        const toolCall = aiResponse.choices[0].message.tool_calls?.[0];
        if (!toolCall || !toolCall.function?.arguments) {
            throw new Error("L'IA n'a pas retourné de réponse exploitable.");
        }

        const parsed = JSON.parse(toolCall.function.arguments);
        console.log(parsed)

        call.chat.push({
            role: "ai",
            content: parsed.message,
            date: new Date()
        });

        if (parsed.status === 'success' && parsed.updatedMetadata) {
            const newPdfPath = await generateFichePDF(parsed.updatedMetadata, req.params.callId, transcriptionText);
            call.fiche.push({
                pdfPath: newPdfPath,
                metadata: parsed.updatedMetadata,
                createdAt: new Date()
            });
        }

        await call.save();
        res.json(call);
    } catch (err) {
        console.error('Erreur dans /chat :', err);

        try {
            const call = await Call.findOne({ callId: req.params.callId });
            if (call) {
                call.chat = call.chat || [];
                call.chat.push({
                    role: "ai",
                    content: "Une erreur interne est survenue lors du traitement.",
                    error: err.message,
                    date: new Date()
                });
                await call.save();
                return res.status(200).json(call);
            }
        } catch (saveErr) {
            console.error("Erreur lors de la sauvegarde du message d'erreur :", saveErr);
        }

        res.status(500).json({ error: "Erreur serveur.", detail: err.message });
    }
});

router.post('/:callId/chat-transcript', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message invalide' });
        }

        const call = await Call.findOne({ callId: req.params.callId });
        if (!call || !call.transcript || !call.transcript.txtContent) {
            return res.status(404).json({ error: 'Aucune retranscription trouvée.' });
        }

        const transcript = call.transcript.txtContent;

        const history = (call.chatRetranscription || []).map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
        }));

        call.chatRetranscription = call.chatRetranscription || [];
        call.chatRetranscription.push({
            role: "user",
            content: message,
            date: new Date()
        });

        const systemPrompt = `Tu es un assistant IA qui répond à des questions basées sur cette retranscription d’appel :

"""${transcript}"""

Réponds toujours de manière concise, claire et fidèle à ce qui est dit.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: message }
            ],
            temperature: 0.2
        });

        const reply = response.choices[0].message.content;

        call.chatRetranscription.push({
            role: "ai",
            content: reply,
            date: new Date()
        });

        await call.save();
        res.json(call);
    } catch (err) {
        console.error('Erreur dans /chat-transcript :', err);
        res.status(500).json({ error: "Erreur serveur." });
    }
});

export default router