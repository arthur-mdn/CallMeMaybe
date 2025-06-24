import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client'
import Peer from 'peerjs';

export default function PeerPage() {
    const socket = io(import.meta.env.VITE_API_URL)

    useEffect(() => {
        socket.emit('join-call', { callId })

        socket.on('user-joined', (peerId) => {
            console.log('Nouvel utilisateur:', peerId)
            // gérer la connexion WebRTC ici
        })

        socket.on('signal', ({ from, data }) => {
            // transmettre au peer WebRTC
        })
    }, [])

    return <>
    coucou
    </>
}