export default function Retranscription({ callDetails }) {
    if (!callDetails) {
        return <p className="text-gray-600 italic">Aucune retranscription d'appel disponible.</p>;
    }

    const renderTranscript = () => {
        if (!callDetails.audioPath) return "La retranscription sera disponible une fois l'appel terminé";
        if (!callDetails.transcript) return "La retranscription sera disponible une fois l'appel terminé";

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
        <div className="box fc g0-5">
            <h2 className="text-2xl font-bold">Retranscription</h2>
            <p>{renderTranscript()}</p>
        </div>
    );
}