import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinPage() {
    const [callId, setCallId] = useState('');
    const navigate = useNavigate();

    const handleJoin = e => {
        e.preventDefault();
        if (callId.trim()) {
            navigate(`/room/${callId.trim()}`, { state: { isCreator: false } });
        }
       };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center font-inter">
            <div className="p-8 rounded-xl shadow-xl max-w-sm w-full text-center bg-white">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                    Rejoindre un appel
                </h2>
                <form onSubmit={handleJoin} className="flex flex-col items-center">
                    <input
                        type="text"
                        placeholder="Entrez l’ID de la room"
                        value={callId}
                        onChange={e => setCallId(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg mb-6 text-gray-800 placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full shadow-lg transition duration-300 ease-in-out"
                    >
                        Rejoindre
                    </button>
                </form>
            </div>
        </div>
    );
}
