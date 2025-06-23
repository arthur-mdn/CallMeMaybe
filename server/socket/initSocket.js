export default function initSocket(io) {
    io.on('connection', socket => {
        console.log('Nouvelle connexion :', socket.id)

        socket.on('join-call', ({ callId }) => {
            socket.join(callId)

            updateParticipants(io, callId)
        })

        socket.on('disconnecting', () => {
            socket.rooms.forEach((room) => {
                if (room !== socket.id) {
                    io.to(room).emit('participants-update', Array.from(io.sockets.adapter.rooms.get(room) || new Set()).filter(id => id !== socket.id))
                }
            })
        })

        socket.on('hangup', ({ callId }) => {
            socket.to(callId).emit('hangup')
            socket.leave(callId)
            updateParticipants(io, callId)
        })
    })

    function updateParticipants(io, callId) {
        console.log(`Mise à jour des participants pour la salle ${callId}`)
        const socketsInRoom = io.sockets.adapter.rooms.get(callId) || new Set()
        const participants = Array.from(socketsInRoom)
        io.to(callId).emit('participants-update', participants)
    }
}