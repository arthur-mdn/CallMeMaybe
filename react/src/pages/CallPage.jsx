import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import socket from '../socket'

export default function CallPage() {
    const { callId } = useParams()
    const localAudioRef = useRef()
    const remoteAudioRef = useRef()
    const peerConnection = useRef(null)
    const pendingCandidates = useRef([])
    const [localStream, setLocalStream] = useState(null)
    const [participants, setParticipants] = useState([])

    const cleanup = () => {
        if (peerConnection.current) {
            peerConnection.current.close()
            peerConnection.current = null
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }

        socket.disconnect()
    }

    const handleHangUp = () => {
        socket.emit('hangup', { callId })
        cleanup()
        window.location.href = '/'
    }

    useEffect(() => {

        const start = async () => {

            // 1. Capturer le micro
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            setLocalStream(stream)
            localAudioRef.current.srcObject = stream

            // 2. Créer la connexion WebRTC
            peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            })

            // Logs
            peerConnection.current.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', peerConnection.current.iceConnectionState)
            }

            socket.on('signal', ({ data }) => {
                console.log('Reçu signal :', data.type)
            })

            socket.on('participants-update', (list) => {
                console.log('Participants connectés :', list)
                setParticipants(list)
            })

            // 3. Ajouter le micro local
            stream.getTracks().forEach(track => {
                peerConnection.current.addTrack(track, stream)
            })

            // 4. Gérer les candidats ICE
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('signal', {
                        callId,
                        data: { type: 'candidate', candidate: event.candidate }
                    })
                }
            }

            // 5. Quand on reçoit de l'audio distant
            peerConnection.current.ontrack = (event) => {
                remoteAudioRef.current.srcObject = event.streams[0]
            }

            // 6. Reçoit un autre utilisateur
            socket.on('user-joined', async ({ initiator }) => {
                if (initiator) {
                    const offer = await peerConnection.current.createOffer()
                    await peerConnection.current.setLocalDescription(offer)
                    socket.emit('signal', {
                        callId,
                        data: { type: 'offer', offer }
                    })
                }
            })

            // 7. Gère les signaux reçus (offer/answer/candidate)
            socket.on('signal', async ({ data }) => {
                if (data.type === 'offer') {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer))
                    for (const candidate of pendingCandidates.current) {
                        try {
                            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
                        } catch (e) {
                            console.error('Erreur ICE (candidat en attente) :', e)
                        }
                    }
                    pendingCandidates.current = []
                    const answer = await peerConnection.current.createAnswer()
                    await peerConnection.current.setLocalDescription(answer)
                    socket.emit('signal', {
                        callId,
                        data: { type: 'answer', answer }
                    })
                } else if (data.type === 'answer') {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer))
                } else if (data.type === 'candidate') {
                    const pc = peerConnection.current
                    const candidate = data.candidate

                    if (pc.remoteDescription && pc.remoteDescription.type) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate))
                        } catch (err) {
                            console.error('Erreur ICE :', err)
                        }
                    } else {
                        pendingCandidates.current.push(candidate)
                    }
                }
            })

            socket.on('hangup', () => {
                alert('L’autre participant a quitté l’appel.')
                cleanup()
                window.location.href = '/'
            });

            socket.emit('join-call', { callId })
        }

        start()

        return () => {
            socket.disconnect()
            if (peerConnection.current) {
                peerConnection.current.close()
            }
        }
    }, [callId])

    return (
        <div>
            <h2>Appel en cours : {callId}</h2>
            <h3>Participants connectés : {participants.length}</h3>
            <ul>
                {participants.map(id => (
                    <li key={id}>{id}</li>
                ))}
            </ul>
            <audio ref={localAudioRef} autoPlay muted/>
            <audio ref={remoteAudioRef} autoPlay/>

            <button onClick={handleHangUp}>Raccrocher</button>
        </div>
    )
}