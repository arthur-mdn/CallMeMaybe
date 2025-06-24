import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import socket from '../socket'

export default function CallPage() {
    const { callId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const isCreator = location.state?.isCreator || false
    const [hasJoined, setHasJoined] = useState(false)
    const [participants, setParticipants] = useState([])
    const [localStream, setLocalStream] = useState(null)

    const localAudioRef = useRef(null)
    const remoteAudioRef = useRef(null)
    const peerConnection = useRef(null)
    const pendingCandidates = useRef([])

    // Nettoyage WebRTC + Socket
    const cleanup = useCallback(() => {
        if (peerConnection.current) {
            peerConnection.current.close()
            peerConnection.current = null
        }
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop())
        }
        socket.disconnect()
    }, [localStream])

    // Raccrocher
    const handleHangUp = () => {
        socket.emit('hangup', { callId })
        cleanup()
        navigate('/')
    }

    // Création et envoi d'une offer
    const createAndSendOffer = useCallback(async () => {
        const offer = await peerConnection.current.createOffer()
        await peerConnection.current.setLocalDescription(offer)
        socket.emit('signal', { callId, data: { type: 'offer', offer } })
    }, [callId])

    // Gestion des signaux reçus
    const handleSignal = useCallback(async data => {
        if (!peerConnection.current) return

        if (data.type === 'offer') {
            await peerConnection.current.setRemoteDescription(data.offer)
            // Appliquer les candidats en attente
            for (const cand of pendingCandidates.current) {
                await peerConnection.current.addIceCandidate(cand).catch(() => {})
            }
            pendingCandidates.current = []

            const answer = await peerConnection.current.createAnswer()
            await peerConnection.current.setLocalDescription(answer)
            socket.emit('signal', { callId, data: { type: 'answer', answer } })

        } else if (data.type === 'answer') {
            await peerConnection.current.setRemoteDescription(data.answer)

        } else if (data.type === 'candidate') {
            const cand = new RTCIceCandidate(data.candidate)
            if (peerConnection.current.remoteDescription) {
                await peerConnection.current.addIceCandidate(cand).catch(() => {})
            } else {
                pendingCandidates.current.push(cand)
            }
        }
    }, [callId])

    // Logique de join, dans le clic utilisateur
    const handleJoin = useCallback(async () => {
        setHasJoined(true)

        // 1) Listen BEFORE join-call
        socket.off()
        socket.on('participants-update', participantsList => {
            console.log('Participants mis à jour :', participantsList)
            setParticipants(Array.isArray(participantsList)
                ? participantsList
                : participantsList.participants
            )
        })
        socket.on('signal', ({ data }) => handleSignal(data))

        socket.on('hangup', () => {
            alert("L’autre participant a quitté l’appel.")
            cleanup()
            navigate('/')
        })

        // 2) Rejoindre la room (émission immédiate de participants-update)
        socket.emit('join-call', { callId })

        // 3) getUserMedia (autorisé par le clic)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setLocalStream(stream)
        localAudioRef.current.srcObject = stream

        // 4) Précharger un MediaStream vide et forcer volume/muted DANS LE CLIC
        const remoteEl = remoteAudioRef.current
        remoteEl.srcObject = new MediaStream()
        remoteEl.muted = false
        remoteEl.volume = 1
        await remoteEl.play().catch(() => {})

        // 5) Créer la RTCPeerConnection
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })
        socket.on('user-joined', ({ userId }) => {
            console.log('Un autre user vient de rejoindre:', userId)
            if (isCreator) {
                createAndSendOffer()
            }
        })
        peerConnection.current.oniceconnectionstatechange = () =>
            console.log('ICE state:', peerConnection.current.iceConnectionState)
        peerConnection.current.onconnectionstatechange = () =>
            console.log('PC state:', peerConnection.current.connectionState)

        // 6) Ajout des pistes locales
        stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream)
        })

        // 7) ICE → Socket
        peerConnection.current.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socket.emit('signal', { callId, data: { type: 'candidate', candidate } })
            }
        }

        // 8) Réception du flux distant
        peerConnection.current.ontrack = ({ streams: [remoteStream] }) => {
            console.log('Flux distant reçu', remoteStream)
            const el = remoteAudioRef.current
            el.srcObject = remoteStream
            el.muted = false
            el.volume = 1
            // relancer play si nécessaire
            el.play().catch(() => {})
        }
    }, [callId, handleSignal, createAndSendOffer, cleanup, navigate])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup()
        }
    }, [])

    // UI avant / après join
    if (!hasJoined) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>{isCreator ? 'Démarrer l’appel ?' : 'Rejoindre l’appel ?'}</h2>
                <button
                    onClick={handleJoin}
                    style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
                >
                    {isCreator ? 'Démarrer' : 'Rejoindre'}
                </button>
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Appel en cours : {callId}</h2>
            <h3>Participants ({participants?.length ?? 0})</h3>
            <ul>
                {(participants || []).map(id => (
                    <li key={id}>{id}</li>
                ))}
            </ul>

            <div style={{ marginTop: '1rem' }}>
                <audio ref={localAudioRef} autoPlay muted controls />
                <audio ref={remoteAudioRef} autoPlay controls />
            </div>

            <div style={{ marginTop: '1rem' }}>
                <button onClick={() => remoteAudioRef.current?.play()}>
                    Forcer lecture audio
                </button>
                <button
                    onClick={handleHangUp}
                    style={{ marginLeft: '1rem', background: 'crimson', color: 'white' }}
                >
                    Raccrocher
                </button>
            </div>
        </div>
    )
}