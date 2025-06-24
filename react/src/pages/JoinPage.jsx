import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function JoinPage() {
    const [callId, setCallId] = useState('')
    const navigate = useNavigate()

    const handleJoin = e => {
        e.preventDefault()
        if (callId.trim()) {
            navigate(`/room/${callId.trim()}`, { state: { isCreator: false } })
        }
    }

    return (
        <form onSubmit={handleJoin} style={{ textAlign: 'center' }}>
            <h2>Rejoindre un appel</h2>
            <input
                placeholder="Entrez l’ID de la room"
                value={callId}
                onChange={e => setCallId(e.target.value)}
                required
            />
            <button type="submit" style={{ marginTop: '1rem' }}>
                Rejoindre
            </button>
        </form>
    )
}