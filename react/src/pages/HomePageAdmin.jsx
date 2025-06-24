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
        <div className="text-center mt-16 p-4">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Bienvenue dans l'application de
                visioconférence</h1>
            <div className="mb-4">
                <Link to="/create">
                    <button
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out text-xl">Créer
                        un appel
                    </button>
                </Link>
            </div>
            <div className="mb-8">
                <Link to="/join">
                    <button
                        className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out text-xl">Rejoindre
                        un appel
                    </button>
                </Link>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Liste des appels</h2>
                {calls.length > 0 ? (
                    <ul className="space-y-4">
                        {calls.map(call => (
                            <li key={call.callId}
                                className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md">
                                <p className="font-medium text-gray-700 mb-2 sm:mb-0"><strong>ID:</strong> {call.callId}
                                </p>
                                <p className="text-gray-600 mb-2 sm:mb-0"><strong>Créé
                                    le:</strong> {new Date(call.startedAt).toLocaleString()}</p>
                                <Link to={`/room/${call.callId}`}
                                      class="px-5 py-2 bg-black text-white font-semibold rounded-md hover:bg-purple-700 transition duration-300 ease-in-out">Voir</Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 text-lg italic">Aucun appels.</p>
                )}
            </div>
        </div>
    )
}