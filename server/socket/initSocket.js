import Call from '../models/Call.js'

export default function initSocket(io) {
    io.on('connection', socket => {

        async function broadcastParticipants(callId) {
            const call = await Call.findOne({ callId })
            io.to(callId).emit('call-details', {call})
        }

        socket.on('join-call', async ({ callId }) => {
            const call = await Call.findOne({ callId })
            if (!call) {
                socket.emit('error', { message: 'Room introuvable' })
                return
            }

            if (!call.participants.includes(socket.id)) {
                call.participants.push(socket.id)
                await call.save()
            }

            socket.join(callId)

            const others = call.participants.filter(id => id !== socket.id)
            socket.emit('participants', { participants: others })

            // je préviens les autres de mon arrivée
            socket.to(callId).emit('new-participant', { socketId: socket.id })

            broadcastParticipants(callId)
        })

        socket.on('get-call-details', async ({ callId }) => {
            const call = await Call.findOne({ callId })
            socket.emit('call-details', { call })
        })

        socket.on('offer', ({ callId, to, offer }) => {
            io.to(to).emit('offer', { from: socket.id, offer })
        })
        socket.on('answer', ({ callId, to, answer }) => {
            io.to(to).emit('answer', { from: socket.id, answer })
        })
        socket.on('candidate', ({ callId, to, candidate }) => {
            io.to(to).emit('candidate', { from: socket.id, candidate })
        })

        socket.on('hangup', async ({ callId }) => {
            socket.to(callId).emit('hangup')

            await Call.findOneAndUpdate(
                { callId },
                {
                    $pull: { participants: socket.id },
                    $set: { endedAt: new Date() }
                }
            )

            socket.leave(callId)
            broadcastParticipants(callId)
        })

        socket.on('disconnecting', async () => {
            for (const room of socket.rooms) {
                if (room === socket.id) continue

                await Call.findOneAndUpdate(
                    { callId: room },
                    {
                        $pull: { participants: socket.id },
                        $set: { endedAt: new Date() }
                    }
                )

                socket.to(room).emit('hangup')
                broadcastParticipants(room)
            }
        })
    })
}