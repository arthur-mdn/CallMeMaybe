import {useEffect, useRef, useState} from "react";
import axios from "axios";
import PrimaryLoader from "../PrimaryLoader.jsx";
import FeatherIcon from "feather-icons-react";

export default function Fiche({ callDetails, setCallDetails }) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const [isFicheOpen, setIsFicheOpen] = useState(false);
    const ficheRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [message, setMessage] = useState('');
    const allChats = callDetails?.chat || [];
    const [tempChat, setTempChat] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const fiches = callDetails.fiche || [];
    const latestFiche = fiches[fiches.length - 1];
    const chatRef = useRef();
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [allChats.length, tempChat]);

    useEffect(() => {
        if (fiches.length > 0) {
            setCurrentIndex(fiches.length - 1);
        }
    }, [fiches.length]);

    useEffect(() => {
        if (isFicheOpen && chatRef.current) {
            setTimeout(() => {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }, 1);
        }
    }, [isFicheOpen]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (isFicheOpen && ficheRef.current && !ficheRef.current.contains(e.target)) {
                setIsFicheOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isFicheOpen]);

    if (!callDetails) {
        return <div className={"box jc-fs mw500"}>
            <h2 className="text-2xl font-bold">Fiche client</h2>
            <div className={"fc ai-c g1 h100 jc-c"}>
                <p className="text-gray-600 italic">Aucune fiche disponible.</p>
            </div>
        </div>
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newTemp = {
            role: 'user',
            content: message,
            date: new Date().toISOString()
        };
        setTempChat(newTemp);
        setIsLoading(true);

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/calls/${callDetails.callId}/chat`,
                { message },
                { withCredentials: true }
            );

            setCallDetails(res.data);
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
        } finally {
            setTempChat(null);
            setMessage('');
            setIsLoading(false);
        }
    };

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
        <div className={"box jc-fs mw500"} style={{position: 'relative'}}>
            {latestFiche ? (
                <>
                    <button
                        className="maximize-button"
                        onClick={() => setIsFicheOpen(prev => !prev)}
                    >
                        <FeatherIcon icon="maximize-2"/>
                    </button>
                    <div className="fc g0-5">
                        <h2 className="text-2xl font-bold">Fiche client</h2>
                        <div>
                            {isIOS ? (
                                <a
                                    href={`${import.meta.env.VITE_API_URL}/${latestFiche.pdfPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{display: 'inline-block', marginTop: '1rem'}}
                                >
                                    📄 Voir le PDF
                                </a>
                            ) : (
                                <embed
                                    src={`${import.meta.env.VITE_API_URL}/${latestFiche.pdfPath}`}
                                    title={latestFiche.pdfPath}
                                    type="application/pdf"
                                    style={{width: "100%", height: "800px", backgroundColor: "lightslategrey", borderRadius: "0.5rem"}}
                                />
                            )}
                            <p><strong>Créé le:</strong> {new Date(latestFiche.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold">Fiche client</h2>
                    <div className="fc ai-c g1 h100 jc-c">
                        <PrimaryLoader/>
                        <p className="text-gray-600 italic">La fiche client est en cours de génération...</p>
                    </div>
                </>
            )}

            {isFicheOpen && (
                <div ref={ficheRef} className={"modale full"} style={{zIndex: 4}}>
                    <div className={"box g1"} style={{position: 'relative', maxHeight: '90vh'}}>
                        <h2 className="text-2xl font-bold">Fiche client</h2>
                        <button
                            className="maximize-button"
                            onClick={() => setIsFicheOpen(false)}
                        >
                            <FeatherIcon icon="minimize-2"/>
                        </button>

                        <div className={"fr"} style={{maxHeight: '80vh'}}>
                            <div style={{width: "70%"}} className={"fc g1"}>
                                <div style={{overflowY: 'scroll'}}>
                                    <div style={{overflowY: 'scroll'}}>
                                        {isIOS ? (
                                            <a
                                                href={`${import.meta.env.VITE_API_URL}/${fiches[currentIndex].pdfPath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{display: 'inline-block', marginTop: '1rem'}}
                                            >
                                                📄 Voir le PDF
                                            </a>
                                        ) : (
                                            <embed
                                                src={`${import.meta.env.VITE_API_URL}/${fiches[currentIndex].pdfPath}`}
                                                title={fiches[currentIndex].pdfPath}
                                                type="application/pdf"
                                                style={{width: "100%", height: "800px", backgroundColor: "lightslategrey", borderRadius: "0.5rem"}}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="fr g1 jc-c ai-c">
                                    <button
                                        className={"special-button"}
                                        disabled={currentIndex === 0}
                                        onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                                    ><FeatherIcon icon={"arrow-left"}/>
                                    </button>
                                    <p>
                                        {currentIndex + 1} / {fiches.length}
                                    </p>
                                    <button
                                        className={"special-button"}
                                        disabled={currentIndex === fiches.length - 1}
                                        onClick={() => setCurrentIndex(i => Math.min(i + 1, fiches.length - 1))}
                                    ><FeatherIcon icon={"arrow-right"}/>
                                    </button>
                                </div>
                            </div>
                            <div className={"fc"} style={{width: '35%', justifyContent: 'flex-end'}}>
                                <div className={"bot-chat"}>
                                    <div>
                                        <img src="/ia-bot.png" alt="IA Bot" style={{width: "4rem", alignSelf: "end", marginBottom: "0", marginRight: '-0.5rem'}}/>
                                        <div className={"details"}>
                                            <h3 className="text-xl font-bold">CallMeBot</h3>
                                            <div className={"status-icon"}>
                                                <div>

                                                </div>
                                                <h4>En ligne</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="fc g1 jc-sb" style={{padding: '2rem 0 0rem 2rem', height:'91%'}}>
                                <div className="chat-history" ref={chatRef} style={{maxHeight: '90%', overflowY: 'scroll'}}>
                                        {allChats.map((msg, index) => (
                                            <div key={index} className={`chat-msg ${msg.role}`}>
                                                <p>{msg.content}</p>
                                                {msg.error && <span className="text-red-500">⚠️ Erreur IA : {msg.error}</span>}
                                                <small>{new Date(msg.date).toLocaleString()}</small>
                                            </div>
                                        ))}
                                        {tempChat && (
                                            <>
                                                <div className="chat-msg user">
                                                    <p>{tempChat.content}</p>
                                                    <small>{new Date(tempChat.date).toLocaleString()}</small>
                                                </div>
                                                <div className="chat-msg no-padding">
                                                    <div className="dots-loader">
                                                        <div className="dot"></div>
                                                        <div className="dot"></div>
                                                        <div className="dot"></div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <textarea
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder="Écrire une instruction..."
                                            disabled={isLoading}
                                            style={{width: '100%', height: '100px', resize: 'none'}}
                                        />
                                        <button type="submit" disabled={isLoading} style={{color: 'white'}}>Envoyer</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}