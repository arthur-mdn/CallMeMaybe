export default function initSocket(io) {
    const rooms = {}

    io.on('connection', socket => {
        socket.on('join-call', ({ callId }) => {
            if (!rooms[callId]) rooms[callId] = new Set()
            rooms[callId].add(socket.id)
            socket.join(callId)

            // Si on est deux, on est « ready »
            if (rooms[callId].size === 2) {
                io.to(callId).emit('ready')
            }
        })

        socket.on('offer', ({ callId, offer }) => {
            socket.to(callId).emit('offer', { offer })
        })

        socket.on('answer', ({ callId, answer }) => {
            socket.to(callId).emit('answer', { answer })
        })

        socket.on('candidate', ({ callId, candidate }) => {
            socket.to(callId).emit('candidate', { candidate })
        })

        socket.on('hangup', ({ callId }) => {
            socket.to(callId).emit('hangup')
            rooms[callId]?.delete(socket.id)
            socket.leave(callId)
            if (rooms[callId]?.size === 0) delete rooms[callId]
        })

        socket.on('disconnecting', () => {
            socket.rooms.forEach(r => {
                if (r === socket.id) return
                rooms[r]?.delete(socket.id)
                socket.to(r).emit('hangup')
                if (rooms[r]?.size === 0) delete rooms[r]
            })
        })
    })
}