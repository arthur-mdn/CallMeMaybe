import config from './config.js'
import db from './db.js'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import initSocket from './socket/initSocket.js'
import callRoutes from './routes/callRoutes.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

// Connexion MongoDB
db.once('open', function () {

    const PORT = config.port || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Initialiser la socket
initSocket(io)

// Routes API
app.use('/api/calls', callRoutes)

server.listen(process.env.PORT || 5001, () => {
    console.log('Serveur en ligne')
})