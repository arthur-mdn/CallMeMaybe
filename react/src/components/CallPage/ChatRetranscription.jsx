import { useEffect, useRef, useState } from "react";
import axios from "axios";
import FeatherIcon from "feather-icons-react";

export default function ChatRetranscription({ callDetails, setCallDetails }) {
    const [message, setMessage] = useState('');
    const [tempChat, setTempChat] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef();
    const chatHistory = callDetails?.chatRetranscription || [];

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chatHistory.length, tempChat]);

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
                `${import.meta.env.VITE_API_URL}/api/calls/${callDetails.callId}/chat-transcript`,
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

    return (
        <div className="fc g1">
            <div className="chat-history" ref={chatRef} style={{ maxHeight: '60vh', overflowY: 'scroll' }}>
                {chatHistory.map((msg, index) => (
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

            <form onSubmit={handleSubmit} style={{ marginTop: 'auto' }}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ex. Quel est son prénom ?"
                    disabled={isLoading}
                    style={{ width: '100%', height: '80px', resize: 'none' }}
                />
                <button type="submit" disabled={isLoading} className="button mt-2" style={{color:'white'}}>Envoyer</button>
            </form>
        </div>
    );
}