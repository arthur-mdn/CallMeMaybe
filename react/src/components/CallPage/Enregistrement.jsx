export default function Enregistrement({ callDetails }) {

    if (!callDetails) {
        return <p className="text-gray-600 italic">Aucun enregistrement d'appel disponible.</p>;
    }

    return (
        <div className={"box fc g0-5"}>
            <h2 className="text-2xl font-bold">Enregistrement</h2>
            <p>{callDetails.audioPath ? callDetails.audioPath : 'Non enregistré'}</p>
        </div>
    );
}