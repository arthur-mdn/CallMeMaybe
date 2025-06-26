import Share from "./Share.jsx";

export default function Details({callDetails}) {
    return (
        <div className={"box"}>
            {callDetails ? (
                <div className="space-y-2 text-gray-700">
                    <p><strong>ID de l’appel:</strong> {callDetails.callId}</p>
                    {callDetails.transcript?.info && (
                        <div>
                            <p><strong>Titre:</strong> {callDetails.transcript.info.title}</p>
                            <p><strong>Icône:</strong> {callDetails.transcript.info.icon}</p>
                            <p><strong>Description:</strong> {callDetails.transcript.info.description}</p>
                        </div>
                    )}
                    <p><strong>Créé le:</strong> {new Date(callDetails.startedAt).toLocaleString()}</p>
                    <p><strong>Participants:</strong> {callDetails.participants.join(', ')}</p>
                    {callDetails.endedAt && (
                        <p><strong>Terminé le:</strong> {new Date(callDetails.endedAt).toLocaleString()}</p>
                    )}
                </div>
            ) : (
                <p className="text-gray-600 italic">Aucun détail disponible.</p>
            )}

            <Share />

        </div>
    )
}