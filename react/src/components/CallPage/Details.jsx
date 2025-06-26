import { useState, useRef, useEffect } from "react";
import Share from "./Share.jsx";
import FeatherIcon from "feather-icons-react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

export default function Details({ callDetails }) {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const shareRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(e) {
            if (isShareOpen && shareRef.current && !shareRef.current.contains(e.target)) {
                setIsShareOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isShareOpen]);

    const handleDelete = async (callId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet appel ?")) {
            try {
                axios.delete(`${import.meta.env.VITE_API_URL}/api/calls/${callId}`, {
                    withCredentials: true
                }).then(() => {
                    navigate('/');
                })
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'appel :', error);
                alert('Une erreur est survenue lors de la suppression de l\'appel.');
            }
        }
    }

    return (
        <div className="box w100">
            {callDetails ? (
                <div className={"fc g1"}>
                    <div className="fr g1">
                        <div className="icon">
                            {(callDetails && callDetails.transcript && callDetails.transcript.info && callDetails.transcript.info.icon) ? callDetails.transcript.info.icon : "🏔"}
                        </div>
                        <div className="fc">
                            <h2 className="text-2xl font-bold">{(callDetails && callDetails.transcript && callDetails.transcript.info && callDetails.transcript.info.title) ? callDetails.transcript.info.title : `#${callDetails.callId}`}</h2>
                            <p>{new Date(callDetails.startedAt).toLocaleString()} {callDetails.endedAt && ( `à ${new Date(callDetails.endedAt).toLocaleString()}`)}</p>
                        </div>
                        <div className="mla fr g0-5">
                            {(callDetails && !callDetails.endedAt) ? (
                                <button
                                    className="special-button"
                                    onClick={() => setIsShareOpen(prev => !prev)}
                                >
                                    <FeatherIcon icon="share-2"/>
                                </button>
                                ) : (<></>) }

                                <button
                                    className="special-button"
                                    onClick={() => handleDelete(callDetails.callId)}
                                >
                                    <FeatherIcon icon="trash"/>
                                </button>

                        </div>
                    </div>
                    {(callDetails && callDetails.transcript && callDetails.transcript.info && callDetails.transcript.info.description) ? (<p>{callDetails.transcript.info.description}</p>) : (<></>)}
                </div>
            ) : (
                <p className="text-gray-600 italic">Aucun détail disponible.</p>
            )}

            {isShareOpen && (
                <div ref={shareRef} className={"modale"}>
                    <Share />
                </div>
            )}
        </div>
    );
}