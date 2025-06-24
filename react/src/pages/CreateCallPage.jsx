import {useEffect, useState} from 'react'
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function CreateCallPage() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const createCall = async () => {
            try {
                axios.post(`${import.meta.env.VITE_API_URL}/api/calls`, {}, { withCredentials: true })
                    .then(response => {
                        console.log('ok', response)
                        if (response.data.callId) {
                            navigate(`/room/${response.data.callId}`, { state: { isCreator: true } });
                        } else {
                            setErrorMessage('Erreur lors de la création de l\'appel');
                        }
                    })
                    .catch(error => {
                        if (error.response) {
                            setErrorMessage(error.response.data.message || 'Erreur de connexion');
                        } else {
                            setErrorMessage('Erreur de connexion');
                        }
                    });

            } catch {
                setErrorMessage('Identifiants invalides')
            }

        }
        createCall()
    }, [])

    if (errorMessage) {
        return <p style={{color: "red", fontWeight: "bold"}}>{errorMessage}</p>
    }
    return <p>Création de l’appel…</p>
}