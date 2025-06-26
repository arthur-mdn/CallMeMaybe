import {useEffect, useState} from "react";
import axios from "axios";
import CallList from "../components/HomePageAdmin/CallList.jsx";

export default function HomePage() {
    const [calls, setCalls] = useState([]);

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
    }, []);

    return (
        <div className={"fr g1 h100"}>
            <CallList calls={calls} />
            <div className={"box fr"} style={{alignSelf:'flex-start', overflow:'hidden', justifyContent:'space-between'}}>
                <div>
                    <h2 className="text-2xl font-bold">Bonjour !</h2>
                    <p>
                        Bienvenue sur ton tableau de bord. Tu peux y retrouver toutes tes anciennes conversations et en démarrer une nouvelle !
                    </p>
                </div>
                <img src="/ia-bot.png" alt="IA Bot" style={{width:"5rem", alignSelf:"end", marginBottom: "-3.5rem", marginRight: '-0.5rem', scale:'-1 1'}}/>
            </div>
        </div>
    )
}