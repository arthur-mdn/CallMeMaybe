import express from 'express'
import Call from '../models/Call.js'
import {verifyToken} from "../authMiddleware.js";
import { v4 as uuidv4 } from 'uuid' 

import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

import { transcribeAudio } from '../services/whisperService.js';

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
            callId: Math.random().toString(36).substring(2, 15),
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
        const calls = await Call.find({});
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

router.put('/:callId/audio', verifyToken, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier audio fourni' })
        }

        const call = await Call.findOne({ callId: req.params.callId })
        if (!call) {
            return res.status(404).json({ 
                error: 'Appel non trouvé',
                savedAudioPath: req.file.filename
            })
        }

        // Save audio path and set transcript status to waiting
        call.audioPath = req.file.filename
        call.transcript = {
            status: 'waiting',
            txtContent: '',
            error: ''
        }
        await call.save()

        // Do transcription in background
        transcribeAudio(req.file.path)
            .then(async (transcriptText) => {
                const updatedCall = await Call.findOneAndUpdate(
                    { callId: req.params.callId },
                    { 
                        transcript: {
                            status: 'success',
                            txtContent: transcriptText || '',
                            error: ''
                        }
                    },
                    { new: true }
                );
                
                console.log('Transcription saved for call:', req.params.callId);
            })
            .catch(async (error) => {
                const updatedCall = await Call.findOneAndUpdate(
                    { callId: req.params.callId },
                    { 
                        transcript: {
                            status: 'error',
                            txtContent: '',
                            error: error.message
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
})

export default router