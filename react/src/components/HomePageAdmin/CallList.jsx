import {Link} from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import ReactTimeAgo from 'react-timeago';
import frStrings from 'react-timeago/lib/language-strings/fr';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

export default function CallList({ calls }) {
    const formatter = buildFormatter(frStrings);
    return (
        <div className="box call-list g1">
            <h2 className="text-2xl font-bold">Historique des appels</h2>
            {calls.length > 0 ? (
                <ul>
                    {calls.map(call => (
                        <Link to={`/room/${call.callId}`} className="item" key={call.callId}>
                            <div className={"icon"}>
                                {call.transcript.info.icon ? call.transcript.info.icon : "🏔"}
                            </div>
                            <div className={"w100"}>
                                <ReactTimeAgo
                                    date={new Date(call.startedAt)}
                                    formatter={formatter}
                                    className="text-sm text-gray-500 time"
                                />
                                <h3 className="font-medium text-gray-700 mb-2 sm:mb-0"><strong>{call.transcript.info.title || "Appel #" + call.callId}</strong>
                                </h3>
                                <p className={"description"}>
                                    {call.transcript.info.description || "Aucune description fournie."}
                                </p>
                            </div>
                        </Link>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600 text-lg italic">Aucun appels.</p>
            )}

            <Link to="/create">
                <button
                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out text-xl">
                    <FeatherIcon icon={"phone"} size={20} className="mr-2" />
                    Nouvel appel
                </button>
            </Link>
        </div>
    );
}