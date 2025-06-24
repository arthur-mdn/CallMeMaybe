import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import socket from '../socket'

export default function CallPage() {
    const { callId } = useParams()
    const isCreator = useLocation().state?.isCreator
    const navigate = useNavigate()
    const [localStream, setLocalStream] = useState(null)
    const localAudioRef = useRef()
    const remoteAudioRef = useRef()
    const pcRef = useRef()
    const [joined, setJoined] = useState(false)

    // Nettoyage
    const cleanup = () => {
        pcRef.current?.close()
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop())
        }
        socket.disconnect()
    }

    // Hang up
    const hangUp = () => {
        socket.emit('hangup', { callId })
        cleanup()
        navigate('/')
    }

    // Initialisation de l’appel (après clic)
    const joinCall = useCallback(async () => {
        setJoined(true)

        // 1) ouverture du socket
        socket.connect()

        // 2) getUserMedia
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setLocalStream(stream)
        localAudioRef.current.srcObject = stream

        // 3) création du peer
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })
        pcRef.current = pc

        // 4) piste locale → peer
        stream.getTracks().forEach(track => pc.addTrack(track, stream))

        // 5) candidates → socket
        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socket.emit('candidate', { callId, candidate })
            }
        }

        // 6) réception du flux → audio
        pc.ontrack = ({ streams: [remoteStream] }) => {
            remoteAudioRef.current.srcObject = remoteStream
            remoteAudioRef.current.play().catch(()=>{})
        }

        // 7) gestion signalling
        socket.on('offer', async ({ offer }) => {
            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit('answer', { callId, answer })
        })

        socket.on('answer', async ({ answer }) => {
            await pc.setRemoteDescription(new RTCSessionDescription(answer))
        })

        socket.on('candidate', async ({ candidate }) => {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch(e) { console.warn(e) }
        })

        socket.on('hangup', () => {
            alert("L’autre participant a quitté l’appel.")
            hangUp()
        })

        // 8) rejoindre (émission « prête »)
        socket.emit('join-call', { callId })

        // 9) si créateur : envoyer l’offre dès que signaling ready
        if (isCreator) {
            socket.once('ready', async () => {
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                socket.emit('offer', { callId, offer })
            })
        }
    }, [callId, isCreator, navigate])

    // UI
    if (!joined) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>{isCreator ? 'Démarrer l’appel' : 'Rejoindre l’appel'}</h2>
                <button onClick={joinCall} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                    {isCreator ? 'Démarrer' : 'Rejoindre'}
                </button>
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>En cours : {callId}</h2>
            <div>
                <audio ref={localAudioRef} autoPlay muted controls />
                <audio ref={remoteAudioRef} autoPlay controls />
            </div>
            <button onClick={hangUp} style={{ marginTop: '1rem', background: 'crimson', color: 'white', padding: '0.5rem 1rem' }}>
                Raccrocher
            </button>
        </div>
    )
}