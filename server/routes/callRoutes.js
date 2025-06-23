import express from 'express'
import Call from '../models/Call.js'

const router = express.Router()

// 🔹 Créer un appel (utilisé par l'admin quand il génère un lien)
router.post('/', async (req, res) => {
    try {
        const { callId, participants } = req.body
        const call = new Call({ callId, participants })
        await call.save()
        res.status(201).json(call)
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la création de l\'appel' })
    }
})

// 🔹 Obtenir tous les appels (ex: historique)
router.get('/', async (req, res) => {
    try {
        const calls = await Call.find().sort({ startedAt: -1 })
        res.status(200).json(calls)
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des appels' })
    }
})

// 🔹 Mettre fin à un appel + stocker transcription
router.put('/:callId/end', async (req, res) => {
    try {
        const { transcript, audioPath } = req.body
        const call = await Call.findOneAndUpdate(
            { callId: req.params.callId },
            {
                endedAt: new Date(),
                transcript,
                audioPath
            },
            { new: true }
        )
        if (!call) return res.status(404).json({ error: 'Appel non trouvé' })
        res.status(200).json(call)
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'appel' })
    }
})

export default router