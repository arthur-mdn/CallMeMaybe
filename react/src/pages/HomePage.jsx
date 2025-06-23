import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

export default function HomePage() {
    const navigate = useNavigate()

    const createCallRoom = () => {
        const callId = uuidv4()
        navigate(`/${callId}`, { state: { isCreator: true } })
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <h1>Créer une salle d'appel</h1>
            <button onClick={createCallRoom}>Démarrer un appel</button>
        </div>
    )
}