import Call from '../models/Call.js'

export default function initSocket(io) {
    io.on('connection', socket => {

        async function broadcastParticipants(callId) {
            const call = await Call.findOne({ callId })
            console.log('call-details');
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
            if (call.participants.length === 2) {
                io.to(callId).emit('ready')
            }
            broadcastParticipants(callId)
        })

        socket.on('get-call-details', async ({ callId }) => {
            const call = await Call.findOne({ callId })
            socket.emit('call-details', { call })
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