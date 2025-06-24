import express from 'express'
import jwt from 'jsonwebtoken'
import config from '../config.js'

const router = express.Router()

router.get('/validate-session', (req, res) => {
    const token = req.cookies[config.cookieSessionName];
    if (!token) {
        return res.json({isAuthenticated: false});
    }
    try {
        const decoded = jwt.verify(token, config.secretKey);
        return res.json({ isAuthenticated: true, user: decoded });
    } catch (error) {
        return res.json({ isAuthenticated: false });
    }
});

router.post('/login', (req, res) => {
    const { username, password } = req.body
    try {
        if (
            username === config.admin.username &&
            password === config.admin.password
        ) {
            const token = jwt.sign({ username: username }, config.secretKey, { expiresIn: '365d' });
            res.cookie(config.cookieSessionName, token, { httpOnly: true,  maxAge: 365 * 24 * 60 * 60 * 1000 });
            res.json({ message: 'Authentification réussie', username: username });
        }
        else {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
    }
    catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie(config.cookieSessionName);
    res.json({ message: 'Déconnexion réussie' });
});

export default router