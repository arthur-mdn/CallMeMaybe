import jwt from 'jsonwebtoken'
import config from './config.js'

export function verifyToken(req, res, next) {
    const token = req.cookies[config.cookieSessionName];
    if (!token) {
        return res.status(403).send('Un token est requis pour l\'authentification');
    }
    try {
        req.user = jwt.verify(token, config.secretKey);
    } catch (err) {
        return res.status(401).send('Token invalide');
    }
    return next();
}