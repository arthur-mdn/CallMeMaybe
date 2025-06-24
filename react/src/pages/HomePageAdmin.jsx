import {Link, useNavigate} from 'react-router-dom'
import {useEffect, useState} from "react";
import axios from "axios";

export default function HomePageAdmin() {
    const [calls, setCalls] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getCalls = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/calls/`, { withCredentials: true });
                if (response.status === 200) {
                    setCalls(response.data);
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l’appel:', error);
            }
        };
        getCalls();
    }, [navigate]);


    return (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>Bienvenue dans l'application de visioconférence</h1>
            <div style={{ margin: '1rem' }}>
                <Link to="/create">
                    <button style={{ padding: '1rem 2rem' }}>Créer un appel</button>
                </Link>
            </div>
            <div style={{ margin: '1rem' }}>
                <Link to="/join">
                    <button style={{ padding: '1rem 2rem' }}>Rejoindre un appel</button>
                </Link>
            </div>

            <div>
                <h2>Liste des appels</h2>
                {calls.length > 0 ? (
                    <ul>
                        {calls.map(call => (
                            <li key={call.callId} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                                <p>{call.callId}</p>
                                <p>{new Date(call.startedAt).toLocaleString()}</p>

                                <Link to={`/room/${call.callId}`}>Voir</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun appels.</p>
                )}
            </div>
        </div>
    )
}