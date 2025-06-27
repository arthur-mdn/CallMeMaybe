export default function Enregistrement({ callDetails }) {

    if (!callDetails && !callDetails.audioPath) {
        return <div className={"box fc g0-5"}>
            <h2 className="text-2xl font-bold">Enregistrement</h2>
            <p className="text-gray-600 italic">Aucun enregistrement d'appel disponible.</p>
        </div>
    }

    return (
        <div className={"box fc g0-5"}>
            <h2 className="text-2xl font-bold">Enregistrement</h2>
            <audio controls className="w-full">
                <source src={`${import.meta.env.VITE_API_URL}/${callDetails.audioPath}`} type="audio/mpeg"/>
                Votre navigateur ne supporte pas la balise audio.
            </audio>
        </div>
    );
}