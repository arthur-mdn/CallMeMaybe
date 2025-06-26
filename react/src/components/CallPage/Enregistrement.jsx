export default function Enregistrement({ callDetails }) {

    if (!callDetails) {
        return <p className="text-gray-600 italic">Aucun enregistrement d'appel disponible.</p>;
    }

    return (
        <div className={"box"}>
            <p><strong>Audio:</strong> {callDetails.audioPath ? callDetails.audioPath : 'Non enregistré'}</p>
        </div>
    );
}