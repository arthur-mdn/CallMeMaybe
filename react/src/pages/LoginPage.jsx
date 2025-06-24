import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import {useAuth} from "../../AuthContext.jsx";

export default function LoginPage() {
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
        <form
            onSubmit={handleSubmit}
            style={{ maxWidth: 300, margin: '4rem auto', textAlign: 'center' }}
        >
            <h2>Admin Login</h2>
            {errorMessage && <div style={{color: "red", fontWeight: "bold"}}>{errorMessage}</div>}
            <input
                placeholder="Username"
                value={login.username}
                onChange={e => setLogin({ ...login, username: e.target.value })}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={login.password}
                onChange={e => setLogin({ ...login, password: e.target.value })}
                required
            />
            <button type="submit" style={{ marginTop: '1rem' }}>
                Se connecter
            </button>
        </form>
    )
}