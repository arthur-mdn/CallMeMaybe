import {Link, useNavigate} from 'react-router-dom'
import {useEffect, useState} from "react";
import axios from "axios";
import CallList from "../components/HomePageAdmin/CallList.jsx";

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
        <>
            <CallList calls={calls} />
            <div>
                Bonjour
            </div>
        </>
    )
}