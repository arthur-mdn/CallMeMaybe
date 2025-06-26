export default function Fiche({ callDetails }) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!callDetails) {
        return <p className="text-gray-600 italic">Aucune fiche d'appel disponible.</p>;
    }

    return (
        <div className={"box jc-fs mw500"}>
            {callDetails.fiche && callDetails.fiche.length > 0 ? (
                <div className={"fc g0-5"}>
                    <h2 className="text-2xl font-bold">Fiche client</h2>
                    {callDetails.fiche.map((fiche, index) => (
                        <div key={index} className="border p-4 rounded-md mb-2">
                            {
                                isIOS ? (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/${fiche.pdfPath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{display: 'inline-block', marginTop: '1rem'}}
                                    >
                                        📄 Voir le PDF
                                    </a>
                                ) : (
                                    <embed
                                        src={`${import.meta.env.VITE_API_URL}/${fiche.pdfPath}`}
                                        title={fiche.pdfPath}
                                        type="application/pdf"
                                        style={{width: "100%", height: "800px", backgroundColor: "lightslategrey", borderRadius: "0.5rem"}}
                                    />
                                )
                            }

                            {/*<p><strong>PDF:</strong> {fiche.pdfPath || 'Non disponible'}</p>*/}
                            <p><strong>Créé le:</strong> {new Date(fiche.createdAt).toLocaleString()}</p>
                            {/*<p><strong>Métadonnées:</strong> {JSON.stringify(fiche.metadata)}</p>*/}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 italic">Aucune fiche disponible.</p>
            )}
        </div>
    );
}