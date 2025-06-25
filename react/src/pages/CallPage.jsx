import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import socket from '../socket'
import {useAuth} from "../../AuthContext.jsx";
import axios from "axios";
import QRCode from 'react-qr-code';

export default function CallPage() {
    const { callId } = useParams()
    const {authStatus} = useAuth();
    const [callDetails, setCallDetails] = useState(null)
    const isCreator = authStatus === 'authenticated'
    const [localStream, setLocalStream] = useState(null)
    const localAudioRef = useRef()
    const remoteAudioRef = useRef()
    const pcRef = useRef()

    const mediaRecorderRef = useRef(null)
    const recordedChunksRef = useRef([])

    const [joined, setJoined] = useState(false)

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/calls/${callId}`, {
            withCredentials: true
        })
            .then(({ data }) => setCallDetails(data))
            .catch(() => setCallDetails(null))
    }, [callId])

    useEffect(() => {
        console.log(`🔗 Appel ID: ${callId} - Créateur: ${isCreator}, authStatus: ${authStatus}`);
    }, [isCreator, authStatus]);

    // Nettoyage
    const cleanup = () => {
        socket.off('offer')
        socket.off('answer')
        socket.off('candidate')
        socket.off('hangup')

        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
        }

        pcRef.current?.close()
        pcRef.current = null
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop())
        }
        socket.disconnect()
        setJoined(false)
    }

    // Hang up
    const hangUp = () => {
        socket.emit('hangup', { callId })
        cleanup()
    }

    const setupCombinedRecording = (local, remote) => {
        const audioCtx = new AudioContext()
        const destination = audioCtx.createMediaStreamDestination()

        // Source locale
        if (local.getAudioTracks().length) {
            const srcLocal = audioCtx.createMediaStreamSource(local)
            srcLocal.connect(destination)
        }
        // Source distante
        if (remote.getAudioTracks().length) {
            const srcRemote = audioCtx.createMediaStreamSource(remote)
            srcRemote.connect(destination)
        }

        recordedChunksRef.current = []
        const options = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 32000
        }
        const recorder = new MediaRecorder(destination.stream, options)
        mediaRecorderRef.current = recorder

        recorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data)
        }

        recorder.onstop = async () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
            
        // Create FormData and send to server
        const formData = new FormData();
        formData.append('audio', blob, `call-${callId}.webm`);
        
            try {
                const response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/calls/${callId}/audio`,
                    formData,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                console.log('Audio uploaded successfully');
                console.log('Server response:', response.data);
                setCallDetails(prev => ({
                    ...prev,
                    audioPath: response.data.call.audioPath || prev.audioPath
                }));
            } catch (error) {
                console.error('Failed to upload audio:', error.response?.data || error.message);
            }
        
            // If you still want to offer download to user (optional)
            // const url = URL.createObjectURL(blob)
            // const a = document.createElement('a')
            // a.style.display = 'none'
            // a.href = url
            // a.download = `appel_audio_${Date.now()}.webm`
            // document.body.appendChild(a)
            // a.click()
            // URL.revokeObjectURL(url)
            // document.body.removeChild(a)
        }

        recorder.start()
    }

    // Initialisation de l’appel (après clic)
    const joinCall = useCallback(async () => {
        setJoined(true)

        // 1) ouverture du socket
        socket.connect()

        // 2) getUserMedia
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1
            },
            video: false
        })
        setLocalStream(stream)
        localAudioRef.current.srcObject = stream

        // 2) fetch TURN credentials
        const response = await fetch(
            "https://fulldroper.metered.live/api/v1/turn/credentials?apiKey=20b057434f2dba67cce42dbf43a66658ba5d"
        )
        const servers = await response.json()

        // 3) PeerConnection avec STUN + TURN
        const iceServers = [
            { urls: "stun:stun.l.google.com:19302" },
            ...servers
        ]
        const pc = new RTCPeerConnection({ iceServers })
        pcRef.current = pc

        // 4) piste locale → peer
        stream.getTracks().forEach(track => pc.addTrack(track, stream))

        // 5) candidates → socket
        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socket.emit('candidate', { callId, candidate })
            }
        }

        pc.oniceconnectionstatechange = () =>
            console.log('🔥 ICE connection state:', pc.iceConnectionState)

        pc.onconnectionstatechange = () =>
            console.log('🔗 Peer connection state:', pc.connectionState)

        // 6) réception du flux → audio
        pc.ontrack = async ({streams: [remoteStream]}) => {
            remoteAudioRef.current.srcObject = remoteStream
            await remoteAudioRef.current.play().catch(() => {
            })

            // Dès que le remoteStream arrive, on démarre l’enregistrement
            setupCombinedRecording(stream, remoteStream)
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

        socket.on('call-details', ({ call }) => {
            console.log('Détails de l’appel:', call)
            setCallDetails(call)
        });

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
    }, [callId, isCreator])

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4 text-gray-900">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Appel {callId}</h2>
            {isCreator && (
                <>
                    <button
                        id={"share_link_button"}
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            alert('Lien copié dans le presse-papiers !')
                        }}
                        className="mb-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Partager
                    </button>
                    <textarea
                        readOnly
                        value={window.location.href}
                        className="w-full h-10 mb-4 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 resize-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="p-4 bg-white inline-block">
                        <QRCode value={window.location.href} size={128} bgcolor="#ffffff" fgColor="#000000" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Détails</h3>
                    {callDetails ? (
                        <div className="space-y-2 text-gray-700">
                            <p><strong>ID de l’appel:</strong> {callDetails.callId}</p>
                            <p><strong>Créé le:</strong> {new Date(callDetails.startedAt).toLocaleString()}</p>
                            <p><strong>Participants:</strong> {callDetails.participants.join(', ')}</p>
                            {callDetails.endedAt && (
                                <p><strong>Terminé le:</strong> {new Date(callDetails.endedAt).toLocaleString()}</p>
                            )}
                            <p>
                                <strong>Audio:</strong> {callDetails.audioPath ? callDetails.audioPath : 'Non enregistré'}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-600 italic">Aucun détail disponible.</p>
                    )}
                </>
            )}

            {!joined && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{isCreator ? 'Démarrer l’appel' : 'Rejoindre l’appel'}</h2>
                    <button
                        onClick={joinCall}
                        className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        {isCreator ? 'Démarrer' : 'Rejoindre'}
                    </button>
                </div>
            )}
            {joined && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col space-y-4 mb-4">
                        <audio ref={localAudioRef} autoPlay muted controls className="w-full rounded-md shadow-sm"/>
                        <audio ref={remoteAudioRef} autoPlay controls className="w-full rounded-md shadow-sm"/>
                    </div>
                    <button
                        onClick={hangUp}
                        className="mt-4 px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Raccrocher
                    </button>
                </div>
            )}
        </div>
    )
}