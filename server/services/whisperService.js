import OpenAI from 'openai'
import fs from 'fs'
import config from '../config.js'
import { File } from 'node:buffer';

if (!globalThis.File) {
    globalThis.File = File;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function transcribeAudio(audioPath) {
    try {
        if (config.transcription.useMock) {
            throw new Error('Transcription skipped - mock mode enabled');
        }

        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        console.log('Starting transcription for:', audioPath);
        
        // Detailed prompt for casting interview context
        const prompt = `La transcription suivante est un entretien de casting professionnel entre une directrice de casting et un(e) candidat(e). 
        L'entretien portera probablement sur:
        - L'identité et les coordonnées du candidat
        - Son expérience professionnelle
        - Ses compétences techniques et personnelles
        - Sa disponibilité et ses prétentions salariales
        - Sa motivation pour le poste
        
        La conversation inclura des questions-réponses formelles, avec une attention particulière aux détails comme les noms propres, 
        les dates, les montants et les termes techniques du métier. Le langage sera professionnel avec possibilité de moments plus informels.`;

        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1",
            language: "fr",
            prompt: prompt,
            temperature: 0.2  // Lower temperature for more focused output
        });
        
        console.log('Transcription completed:', response);
        return response.text;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
}