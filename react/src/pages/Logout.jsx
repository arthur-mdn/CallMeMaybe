import {useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../AuthContext.jsx";


function Logout() {
    const {setAuthStatus} = useAuth();
    const navigate = useNavigate();

    const logout = async () => {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {}, {withCredentials: true})
            .then(() => {
                setAuthStatus('unauthenticated');
                navigate("/login");
            })
            .catch(error => {
                console.error('Erreur de déconnexion:', error);
            });
    };

    useEffect(() => {
        logout();
    }, []);

}

export default Logout;
