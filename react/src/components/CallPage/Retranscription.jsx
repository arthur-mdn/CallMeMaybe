export default function Retranscription({ callDetails }) {
    if (!callDetails) {
        return <p className="text-gray-600 italic">Aucune retranscription d'appel disponible.</p>;
    }
    return (
        <div className={"box"}>
            <p><strong>Transcription:</strong> {
                !callDetails.audioPath ? 'Aucune transcription' :
                    !callDetails.transcript ? 'Aucune transcription' :
                        callDetails.transcript.status === 'waiting' ? '⌛ En attente...' :
                            callDetails.transcript.status === 'started' ? '🔄 En cours...' :
                                callDetails.transcript.status === 'success' ?
                                    callDetails.transcript.txtContent || 'Aucune transcription' :
                                    callDetails.transcript.status === 'error' ?
                                        `❌ Erreur: ${callDetails.transcript.error}` :
                                        'État inconnu'
            }</p>
        </div>
    )
}