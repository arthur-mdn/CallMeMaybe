import {Link} from "react-router-dom";

export default function CallList({ calls }) {
    return (
        <div className="call-list">
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
                                  className="px-5 py-2 bg-black text-white font-semibold rounded-md hover:bg-purple-700 transition duration-300 ease-in-out">Voir</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600 text-lg italic">Aucun appels.</p>
            )}

            <Link to="/create">
                <button
                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out text-xl">Créer
                    un appel
                </button>
            </Link>
        </div>
    );
}