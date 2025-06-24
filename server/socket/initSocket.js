export default function initSocket(io) {
    // Notre map callId → Set<socketId>
    const rooms = {}

    io.on('connection', socket => {
        console.log('Nouvelle connexion :', socket.id)

        // ----------------------------------------------------------------------
        // Quand un client rejoint une room
        socket.on('join-call', ({ callId }) => {
            console.log(`L'utilisateur ${socket.id} rejoint la salle ${callId}`)

            // 1) Ajout dans notre objet rooms
            if (!rooms[callId]) {
                rooms[callId] = new Set()
            }
            rooms[callId].add(socket.id)

            // 2) On fait rejoindre Socket.IO pour l’acheminement WebRTC
            socket.join(callId)

            socket.to(callId).emit('user-joined', { userId: socket.id })

            // 3) Broadcast de la liste mise à jour
            broadcastParticipants(callId)
        })

        socket.on('signal', ({ callId, data }) => {
            // renvoie à tous les autres participants de la même room
            socket.to(callId).emit('signal', { data })
        })

        // ----------------------------------------------------------------------
        // Quand un client raccroche volontairement
        socket.on('hangup', ({ callId }) => {
            console.log(`L'utilisateur ${socket.id} quitte la salle ${callId} (hangup)`)

            // 1) On notifie l’autre bout
            socket.to(callId).emit('hangup')

            // 2) On retire du Set et de la room
            rooms[callId]?.delete(socket.id)
            socket.leave(callId)

            // 3) Si la room est vide, on peut la supprimer
            if (rooms[callId]?.size === 0) {
                delete rooms[callId]
            }

            // 4) Broadcast de la nouvelle liste
            broadcastParticipants(callId)
        })

        // ----------------------------------------------------------------------
        // Quand un client perd la connexion (fermeture onglet, network down…)
        socket.on('disconnecting', () => {
            // Pour chaque room où il était inscrit
            socket.rooms.forEach(room => {
                if (room === socket.id) return   // ignore sa room socket.io par défaut
                console.log(`L'utilisateur ${socket.id} se déconnecte de ${room}`)

                // 1) On retire de notre Set
                rooms[room]?.delete(socket.id)
                // 2) On broadcast la MAJ
                broadcastParticipants(room)
                // 3) Si vide, on supprime
                if (rooms[room]?.size === 0) {
                    delete rooms[room]
                }
            })
        })

        // ----------------------------------------------------------------------
        // Helper pour émettre la MAJ aux clients de la room
        function broadcastParticipants(callId) {
            const list = rooms[callId] ? Array.from(rooms[callId]) : []
            console.log(`Participants dans ${callId} →`, list)
            io.to(callId).emit('participants-update', list)
        }
    })
}