import {useEffect, useRef, useState} from "react";
import Share from "./Share.jsx";
import FeatherIcon from "feather-icons-react";

export default function Retranscription({ callDetails }) {
    const [isRetranscriptionOpen, setIsRetranscriptionOpen] = useState(false);
    const retranscriptionRef = useRef();

    useEffect(() => {
        function handleClickOutside(e) {
            if (isRetranscriptionOpen && retranscriptionRef.current && !retranscriptionRef.current.contains(e.target)) {
                setIsRetranscriptionOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isRetranscriptionOpen]);

    if (!callDetails) {
        return <p className="text-gray-600 italic">Aucune retranscription d'appel disponible.</p>;
    }

    const renderTranscript = () => {
        if (!callDetails.endedAt) return <div className={"fc ai-c g1 h100 jc-c"}><p className="text-gray-600 italic">La retranscription sera disponible une fois l'appel terminé.</p></div>;
        if (!callDetails.audioPath) return <div className={"fc ai-c g1 h100 jc-c"}><p className="text-gray-600 italic">Aucune retranscription d'appel disponible.</p></div>;
        if (!callDetails.transcript) return <div className={"fc ai-c g1 h100 jc-c"}><p className="text-gray-600 italic">La retranscription sera disponible une fois l'appel terminé.</p></div>;

        switch (callDetails.transcript.status) {
            case 'waiting':
                return <div className={"fc ai-c g1 h100 jc-c"}>
                    <div className="wave-loader">
                        <svg id="wave" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 38.05">
                            <title>Audio Wave</title>
                            <path id="Line_1" data-name="Line 1" d="M0.91,15L0.78,15A1,1,0,0,0,0,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H0.91Z"/>
                            <path id="Line_2" data-name="Line 2" d="M6.91,9L6.78,9A1,1,0,0,0,6,10V28a1,1,0,1,0,2,0s0,0,0,0V10A1,1,0,0,0,7,9H6.91Z"/>
                            <path id="Line_3" data-name="Line 3" d="M12.91,0L12.78,0A1,1,0,0,0,12,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H12.91Z"/>
                            <path id="Line_4" data-name="Line 4" d="M18.91,10l-0.12,0A1,1,0,0,0,18,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H18.91Z"/>
                            <path id="Line_5" data-name="Line 5" d="M24.91,15l-0.12,0A1,1,0,0,0,24,16v6a1,1,0,0,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H24.91Z"/>
                            <path id="Line_6" data-name="Line 6" d="M30.91,10l-0.12,0A1,1,0,0,0,30,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H30.91Z"/>
                            <path id="Line_7" data-name="Line 7" d="M36.91,0L36.78,0A1,1,0,0,0,36,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H36.91Z"/>
                            <path id="Line_8" data-name="Line 8" d="M42.91,9L42.78,9A1,1,0,0,0,42,10V28a1,1,0,1,0,2,0s0,0,0,0V10a1,1,0,0,0-1-1H42.91Z"/>
                            <path id="Line_9" data-name="Line 9" d="M48.91,15l-0.12,0A1,1,0,0,0,48,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H48.91Z"/>
                        </svg>
                    </div>
                    <p className="text-gray-600 italic text-center">La restranscription est en cours de traitement...</p>
                </div>;
            case 'started':
                return <div className={"fc ai-c g1 h100 jc-c"}>
                    <div className="wave-loader">
                        <svg id="wave" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 38.05">
                            <title>Audio Wave</title>
                            <path id="Line_1" data-name="Line 1" d="M0.91,15L0.78,15A1,1,0,0,0,0,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H0.91Z"/>
                            <path id="Line_2" data-name="Line 2" d="M6.91,9L6.78,9A1,1,0,0,0,6,10V28a1,1,0,1,0,2,0s0,0,0,0V10A1,1,0,0,0,7,9H6.91Z"/>
                            <path id="Line_3" data-name="Line 3" d="M12.91,0L12.78,0A1,1,0,0,0,12,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H12.91Z"/>
                            <path id="Line_4" data-name="Line 4" d="M18.91,10l-0.12,0A1,1,0,0,0,18,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H18.91Z"/>
                            <path id="Line_5" data-name="Line 5" d="M24.91,15l-0.12,0A1,1,0,0,0,24,16v6a1,1,0,0,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H24.91Z"/>
                            <path id="Line_6" data-name="Line 6" d="M30.91,10l-0.12,0A1,1,0,0,0,30,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H30.91Z"/>
                            <path id="Line_7" data-name="Line 7" d="M36.91,0L36.78,0A1,1,0,0,0,36,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H36.91Z"/>
                            <path id="Line_8" data-name="Line 8" d="M42.91,9L42.78,9A1,1,0,0,0,42,10V28a1,1,0,1,0,2,0s0,0,0,0V10a1,1,0,0,0-1-1H42.91Z"/>
                            <path id="Line_9" data-name="Line 9" d="M48.91,15l-0.12,0A1,1,0,0,0,48,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H48.91Z"/>
                        </svg>
                    </div>
                    <p className="text-gray-600 italic text-center">La restranscription est en cours de traitement...</p>
                </div>;
            case 'success':
                return <>
                    <button
                        className="maximize-button"
                        onClick={() => setIsRetranscriptionOpen(prev => !prev)}
                    >
                        <FeatherIcon icon="maximize-2" />
                    </button>
                    <p style={{maxHeight:'100%', overflow:'hidden'}}>{callDetails.transcript.txtContent || 'Aucune transcription'}</p>
                </>;
            case 'error':
                return <p>❌ Erreur: {callDetails.transcript.error}</p>;
            default:
                return <p>État inconnu</p>;
        }
    };

    return (
        <div className={`box fc g0-5 jc-fs ${callDetails.endedAt ? "mh300" : ""}`} style={{position:"relative", maxHeight:'70vh'}}>
            <h2 className="text-2xl font-bold">Retranscription</h2>
            {renderTranscript()}
            {isRetranscriptionOpen && (
                <div ref={retranscriptionRef} className={"modale full"}>
                    <div className={"box"} style={{position:'relative', maxHeight:'90vh'}}>
                        <h2 className="text-2xl font-bold">Retranscription</h2>
                        <button
                            className="maximize-button"
                            onClick={() => setIsRetranscriptionOpen(false)}
                        >
                            <FeatherIcon icon="minimize-2" />
                        </button>

                        <div style={{overflowY:'scroll'}}>
                            <p>{callDetails.transcript.txtContent || 'Aucune transcription'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}