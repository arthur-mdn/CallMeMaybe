export default function Retranscription({ callDetails }) {
    if (!callDetails) {
        return <p className="text-gray-600 italic">Aucune retranscription d'appel disponible.</p>;
    }

    const renderTranscript = () => {
        if (!callDetails.audioPath) return 'Aucune transcription';
        if (!callDetails.transcript) return 'Aucune transcription';

        switch (callDetails.transcript.status) {
            case 'waiting':
                return '⌛ En attente...';
            case 'started':
                return '🔄 En cours...';
            case 'success':
                return callDetails.transcript.txtContent || 'Aucune transcription';
            case 'error':
                return `❌ Erreur: ${callDetails.transcript.error}`;
            default:
                return 'État inconnu';
        }
    };

    return (
        <div className="box">
            <p><strong>Transcription:</strong> {renderTranscript()}</p>
        </div>
    );
}