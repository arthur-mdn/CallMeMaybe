import { useRef, useState, useEffect, useCallback } from 'react'
import {Link, useParams} from 'react-router-dom'
import socket from '../socket'
import {useAuth} from "../../AuthContext.jsx";
import axios from "axios";
import Share from "../components/CallPage/Share.jsx";
import Details from "../components/CallPage/Details.jsx";
import Retranscription from "../components/CallPage/Retranscription.jsx";
import Fiche from "../components/CallPage/Fiche.jsx";
import Enregistrement from "../components/CallPage/Enregistrement.jsx";
import FeatherIcon from "feather-icons-react";
import CallWidget from "../components/CallPage/CallWidget.jsx";

export default function CallPage() {
    const { callId } = useParams()
    const {authStatus} = useAuth();
    const [callDetails, setCallDetails] = useState(null)
    const isCreator = authStatus === 'authenticated'
    const [localStream, setLocalStream] = useState(null)
    const peerConnections = useRef({})
    const [remoteStreams, setRemoteStreams] = useState([])

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

    const cleanup = () => {
        socket.off('offer')
        socket.off('answer')
        socket.off('candidate')

        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
        }

        Object.values(peerConnections.current).forEach(pc => pc.close())
        peerConnections.current = {}
        remoteStreams.forEach(r =>
            r.stream.getTracks().forEach(t => t.stop())
        );
        setRemoteStreams([])

        if (localStream) {
            localStream.getTracks().forEach(t => t.stop())
        }
        socket.disconnect()
        setJoined(false)
    }

    const handleHangUp = () => {
        if (isCreator) {
            socket.emit('end-call', { callId })
        } else {
            socket.emit('leave-call', { callId })
            setCallDetails(prev => ({
                ...prev,
                endedAt: new Date().toISOString()
            }));
        }
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
                setCallDetails( response.data.call );

                // set interval to check if transcription is ready
                const checkTranscription = setInterval(async () => {
                    try {
                        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/calls/${callId}`, {
                            withCredentials: true
                        });
                        if (res.data.transcript.status === 'success') {
                            clearInterval(checkTranscription);
                            setCallDetails(prev => ({
                                ...prev,
                                transcript: res.data.transcript
                            }));
                        } else if (res.data.transcript.status === 'error') {
                            clearInterval(checkTranscription);
                            setCallDetails(prev => ({
                                ...prev,
                                transcript: res.data.transcript.error
                            }));
                        }
                    } catch (error) {
                        console.error('Error checking transcription status:', error);
                    }
                }, 2000);
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

    const createPeer = (socketId, initiator, iceServers, localStream) => {
        const pc = new RTCPeerConnection({ iceServers })
        peerConnections.current[socketId] = pc

        localStream.getTracks().forEach(track =>
            pc.addTrack(track, localStream)
        )

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                socket.emit('candidate', { callId, to: socketId, candidate })
            }
        }

        pc.ontrack = ({ streams: [remoteStream] }) => {
            setRemoteStreams(prev =>
                prev.find(r => r.socketId === socketId)
                    ? prev
                    : [...prev, { socketId, stream: remoteStream }]
            )
            setupCombinedRecording(localStream, remoteStream)
        }

        // si c’est l’initiateur, on crée et envoie l’offre
        if (initiator) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() =>
                    socket.emit('offer', { callId, to: socketId, offer: pc.localDescription })
                )
        }
    }

    const joinCall = useCallback(async () => {
        setJoined(true)

        socket.connect()

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1
            },
            video: false
        })
        setLocalStream(stream)

        // fetch TURN credentials
        const response = await fetch(
            "https://fulldroper.metered.live/api/v1/turn/credentials?apiKey=20b057434f2dba67cce42dbf43a66658ba5d"
        )
        const servers = await response.json()

        // PeerConnection avec STUN + TURN
        const iceServers = [
            { urls: "stun:stun.l.google.com:19302" },
            ...servers
        ]

        socket.on('participants', ({ participants }) => {
            participants.forEach(id =>
                createPeer(id, true, iceServers, stream)
            )
        })

        socket.on('new-participant', ({ socketId: id }) => {
            if (id !== socket.id) {
                createPeer(id, false, iceServers, stream)
            }
        })

        socket.on('offer', async ({ from, offer }) => {
            if (!peerConnections.current[from]) {
                createPeer(from, false, iceServers, stream)
            }
            const pc = peerConnections.current[from]
            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socket.emit('answer', { callId, to: from, answer: pc.localDescription })
        })

        socket.on('answer', async ({ from, answer }) => {
            const pc = peerConnections.current[from];
            if (!pc) return;
            const validStates = ['have-local-offer', 'have-remote-offer'];
            if (validStates.includes(pc.signalingState)) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (err) {
                    console.warn("Erreur setRemoteDescription :", err);
                }
            }
        });

        socket.on('call-details', ({ call }) => {
            console.log('Détails de l’appel:', call)
            setCallDetails(call)
        });

        socket.on('candidate', async ({ from, candidate }) => {
            const pc = peerConnections.current[from]
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
        })

        socket.on('call-ended', () => {
            alert("Le créateur a terminé l’appel.");
            setCallDetails(prev => ({
                ...prev,
                endedAt: new Date().toISOString()
            }))
            cleanup()
        })

        socket.on('participant-left', ({ socketId }) => {
            const pc = peerConnections.current[socketId];
            if (pc) {
                pc.close();
                delete peerConnections.current[socketId];
            }

            setRemoteStreams(prev =>
                prev
                    .filter(r => {
                        if (r.socketId === socketId) {
                            r.stream.getTracks().forEach(t => t.stop());
                            return false;
                        }
                        return true;
                    })
            );
        });

        socket.emit('join-call', { callId })
    }, [callId, isCreator])

    return (
        <>
            {isCreator && (
                <>
                    <div className={"fr jc-sb mb-8 ai-c"}>
                        <Link to={'/'} className={"text-blue-600 hover:underline fr ai-c g0-5"}>
                            <FeatherIcon icon={"arrow-left"} size={16} className="inline mr-1"/>
                            Retour à la page d'accueil
                        </Link>
                        <div className="call-id">
                            {callDetails ? (
                                `#${callDetails.callId}`
                            ) : (
                                `#`
                            )}
                        </div>
                    </div>
                    <div className={"fc g1 h100 mh90"}>
                        <Details callDetails={callDetails}/>
                        {(callDetails && !callDetails.endedAt) && (
                            <div className={"fr g1 mta"}>
                                <CallWidget
                                    isCreator={isCreator}
                                    joined={joined}
                                    callDetails={callDetails}
                                    onJoin={joinCall}
                                    onHangUp={handleHangUp}
                                    localStream={localStream}
                                    remoteStreams={remoteStreams}
                                />
                                <Retranscription callDetails={callDetails}/>
                            </div>
                        )}
                        {(callDetails && callDetails.endedAt) && (
                            <div className={"fr g1"}>
                                <Fiche callDetails={callDetails}/>
                                <div className={"fc g1 "}>
                                    <Enregistrement callDetails={callDetails}/>
                                    <Retranscription callDetails={callDetails}/>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
            {!isCreator && (
                <CallWidget
                    isCreator={isCreator}
                    joined={joined}
                    callDetails={callDetails}
                    onJoin={joinCall}
                    onHangUp={handleHangUp}
                    localStream={localStream}
                    remoteStreams={remoteStreams}
                />
            )}

            {/*{(!joined && (callDetails && !callDetails.endedAt)) && (*/}
            {/*    <div className="mt-8 pt-8 border-t border-gray-200">*/}
            {/*        <h2 className="text-2xl font-bold text-gray-800 mb-4">{isCreator ? 'Démarrer l’appel' : 'Rejoindre l’appel'}</h2>*/}
            {/*        <button*/}
            {/*            onClick={joinCall}*/}
            {/*            className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"*/}
            {/*        >*/}
            {/*            {isCreator ? 'Démarrer' : 'Rejoindre'}*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*)}*/}
            {/*{(!joined && (!isCreator && callDetails && callDetails.endedAt)) && (*/}
            {/*    <div>*/}
            {/*        L'appel est terminé. Vous ne pouvez pas rejoindre un appel terminé.*/}
            {/*    </div>*/}
            {/*)}*/}

            {/*{joined && (*/}
            {/*    <div className="mt-8 pt-8 border-t border-gray-200">*/}
            {/*        <div className="flex flex-col space-y-4 mb-4">*/}
            {/*            <audio ref={localAudioRef} autoPlay muted controls style={{display:'none'}}/>*/}
            {/*            {remoteStreams.map(r => (*/}
            {/*                <audio*/}
            {/*                    key={r.socketId}*/}
            {/*                    autoPlay*/}
            {/*                    controls*/}
            {/*                    ref={el => el && (el.srcObject = r.stream)}*/}
            {/*                    className="w-full rounded-md shadow-sm"*/}
            {/*                />*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*        <button onClick={handleHangUp} className="mt-4 px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150">*/}
            {/*        {isCreator ? 'Terminer l’appel' : 'Quitter l’appel'}*/}
            {/*    </button>*/}
            {/*    </div>*/}
            {/*)}*/}
        </>
    )
}
