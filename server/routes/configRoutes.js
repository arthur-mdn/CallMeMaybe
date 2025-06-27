import express from 'express';
import Config from '../models/Config.js';
import { verifyToken } from '../authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    const all = await Config.find({});
    res.json(all);
});

router.get('/:key', verifyToken, async (req, res) => {
    const item = await Config.findOne({ key: req.params.key });
    if (!item) return res.status(404).json({ error: 'Clé non trouvée' });
    res.json(item);
});

router.put('/:key', verifyToken, async (req, res) => {
    const updated = await Config.findOneAndUpdate(
        { key: req.params.key },
        { value: req.body.value },
        { upsert: true, new: true }
    );
    res.json(updated);
});

export default router;