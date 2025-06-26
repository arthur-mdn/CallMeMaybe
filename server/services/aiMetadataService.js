import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateMetadata(transcriptionText) {
    try {
        const prompt = `En tant qu'assistant spécialisé dans l'analyse d'entretiens de casting pour Riviera Connection,
        analyser la transcription suivante et générer un titre accrocheur, une icône émoji appropriée,
        et une brève description. La transcription concerne un entretien entre une directrice de casting et un(e) candidat(e).

        Répondre uniquement en JSON. Pas de formatage Makrdown ! Avec le format suivant:
        {
            "title": "Ex: Casting Chef de cuisinier Junior - Candidat Prometteur",
            "icon": "IMPORTANT: Pour le champ "icon", utilisez UNIQUEMENT UN SEUL émoji, pas de texte additionnel",
            "description": "Ex: Entretien positif avec candidate expérimentée de 28 ans, 3 ans d'expérience en restauration. Disponible sous 2 mois."
        }

        Critères importants à repérer:
        - Type de poste recherché
        - Niveau d'expérience
        - Points forts du candidat
        - Disponibilité
        - Impression générale

        Transcription:
        ${transcriptionText}`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Vous êtes un assistant spécialisé dans l'analyse d'entretiens de casting pour une agence de recrutement. Votre rôle est d'extraire les informations clés et de les présenter de manière concise et professionnelle. Répondez uniquement en JSON valide."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        const metadata = JSON.parse(response.choices[0].message.content);
        return {
            ...metadata,
            generatedAt: new Date()
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {}; 
    }
}