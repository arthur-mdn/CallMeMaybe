import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function extractCandidateInfo(transcriptionText) {
    try {
        const prompt = `Analyser cette transcription d'entretien de casting et extraire les informations structurées suivantes au format JSON, Pas de formatage Makrdown ! :

        {
            "identite": {
                "nom": "",
                "prenom": "", 
                "age": ""
            },
            "contact": {
                "telephone": "",
                "email": ""
            },
            "experience": {
                "postes": ["poste 1", "poste 2"],
                "durees": ["durée 1", "durée 2"]
            },
            "competences": {
                "techniques": ["compétence 1", "compétence 2"],
                "soft_skills": ["skill 1", "skill 2"]
            },
            "disponibilite": {
                "date": "",
                "contraintes": ""
            },
            "pretentions": {
                "salaire": "",
                "conditions": ""
            },
            "motivation": ""
        }

        Si une information n'est pas mentionnée, laisser le champ vide.

        Transcription:
        ${transcriptionText}`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Vous êtes un assistant spécialisé dans l'extraction d'informations candidat pour Riviera Connection. Répondez uniquement en JSON valide."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error extracting candidate info:', error);
        return null;
    }
}