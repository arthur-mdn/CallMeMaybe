import {useEffect} from "react";
import axios from "axios";
import PrimaryLoader from "../PrimaryLoader.jsx";

export default function Fiche({ callDetails, setCallDetails }) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!callDetails) {
        return <div className={"box jc-fs mw500"}>
            <h2 className="text-2xl font-bold">Fiche client</h2>
            <div className={"fc ai-c g1 h100 jc-c"}>
                <p className="text-gray-600 italic">Aucune fiche disponible.</p>
            </div>
        </div>
    }

    useEffect(() => {
        if (callDetails && !callDetails.fiche || callDetails.fiche.length === 0) {
            const checkTranscription = setInterval(async () => {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/calls/${callDetails.callId}`, {
                        withCredentials: true
                    });
                    if (res.data.fiche && res.data.fiche.length > 0) {
                        clearInterval(checkTranscription);
                        setCallDetails(res.data);
                    }
                } catch (error) {
                    console.error('Error checking fiches :', error);
                }
            }, 2000);
        }

    }, [callDetails]);

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
            <>
                <h2 className="text-2xl font-bold">Fiche client</h2>
                <div className={"fc ai-c g1 h100 jc-c"}>
                    <PrimaryLoader/>
                    <p className="text-gray-600 italic">La fiche client est en cours de génération...</p>
                </div>
            </>
        )}
    </div>
    );
}