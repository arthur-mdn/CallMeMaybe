import config from './config.js'
import db from './db.js'
import express from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import initSocket from './socket/initSocket.js'
import callRoutes from './routes/callRoutes.js'
import authRoutes from "./routes/authRoutes.js";

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})
app.use(bodyParser.json());

app.use(cors((req, callback) => {
    const allowedOrigins = [config.clientUrl];
    let corsOptions;

    if (allowedOrigins.includes(req.header('Origin'))) {
        corsOptions = { origin: true, credentials: true};
    } else {
        corsOptions = { origin: false };
    }

    callback(null, corsOptions);
}));

app.use(cookieParser({
    sameSite: 'none',
    secure: true
}));

app.use(express.json())

app.use(express.static('fiche'));
app.use(express.static('records'));

// Connexion MongoDB
db.once('open', function () {

    const PORT = config.port || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Initialiser la socket
initSocket(io)

// Routes API
app.use('/api/auth', authRoutes)
app.use('/api/calls', callRoutes)

server.listen(process.env.PORT || 5001, () => {
    console.log('Serveur en ligne')
})