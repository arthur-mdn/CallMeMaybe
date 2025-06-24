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
            className="max-w-sm mx-auto mt-16 p-6 bg-white rounded-lg shadow-md text-center"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Login</h2>
            {errorMessage && <div className="text-red-600 font-bold mb-4">{errorMessage}</div>}
            <input
                placeholder="Username"
                value={login.username}
                onChange={e => setLogin({...login, username: e.target.value})}
                required
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <input
                type="password"
                placeholder="Password"
                value={login.password}
                onChange={e => setLogin({...login, password: e.target.value})}
                required
                className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
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