import axios from "axios";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../AuthContext.jsx";

export default function LoginForm() {
    const [login, setLogin] = useState({ username: '', password: '' })
    const navigate = useNavigate()
    const { setAuthStatus } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async e => {
        e.preventDefault()
        setErrorMessage('')
        try {

            axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { username: login.username, password: login.password }, { withCredentials: true })
                .then(response => {
                    console.log('ok')
                    setAuthStatus("authenticated");
                    navigate('/create')
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

    return (
        <form onSubmit={handleSubmit} className={"fc g0-5"}>
            <h2 className="text-2xl font-bold">Se connecter</h2>
            {errorMessage && <div className="text-red-600 font-bold">{errorMessage}</div>}
            <input
                type={"text"}
                placeholder="Nom d'utilisateur"
                value={login.username}
                onChange={e => setLogin({...login, username: e.target.value})}
                required
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={login.password}
                onChange={e => setLogin({...login, password: e.target.value})}
                required
            />
            <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md shadow-lg transition duration-300 ease-in-out"
            >
                Se connecter
            </button>
        </form>
    )
}