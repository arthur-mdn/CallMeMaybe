// server/services/whisperService.js
import OpenAI from 'openai'
import fs from 'fs'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function transcribeAudio(audioPath) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured')
        }
        console.log('Starting transcription for:', audioPath);
        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1",
            language: "fr"
        });
        
        console.log('Transcription completed:', response);
        return response.text;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
}