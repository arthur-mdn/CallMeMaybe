import { Link } from 'react-router-dom'
import {useAuth} from "../../AuthContext.jsx";
import {useEffect} from "react";

export default function HomePage() {
    const { authStatus } = useAuth();

    useEffect(() => {
        console.log(`${authStatus}`);
    }, [authStatus]);
    if (authStatus === "loading") {
        return <p>Chargement...</p>
    }
    else if (authStatus === "authenticated") {
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
            </div>
        )
    }
    else {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h1>Bienvenue</h1>
                <div style={{ margin: '1rem' }}>
                    <Link to="/login">
                        <button style={{ padding: '1rem 2rem' }}>Admin Login</button>
                    </Link>
                </div>
                <div style={{ margin: '1rem' }}>
                    <Link to="/join">
                        <button style={{ padding: '1rem 2rem' }}>Rejoindre un appel</button>
                    </Link>
                </div>
            </div>
        )
    }


}