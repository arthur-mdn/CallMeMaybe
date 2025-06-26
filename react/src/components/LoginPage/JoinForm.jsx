import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function JoinForm() {
    const [values, setValues] = useState(Array(7).fill(''));
    const inputsRef = useRef([]);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const extractCallId = (text) => {
        const urlMatch = text.match(/room\/([a-zA-Z0-9]{7})/);
        if (urlMatch) return urlMatch[1].toLowerCase();

        const clean = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return clean.length === 7 ? clean : null;
    };

    const fillInputsAndVerify = (callId) => {
        const chars = callId.split('');
        setValues(chars);
        chars.forEach((char, i) => {
            if (inputsRef.current[i]) inputsRef.current[i].value = char;
        });
        verifyCall(callId);
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('Text');
        const callId = extractCallId(pasted);
        if (callId) fillInputsAndVerify(callId);
        else setErrorMessage('ID invalide ou format incorrect.');
    };

    const handleChange = (index, e) => {
        const val = e.target.value.toLowerCase().slice(0, 1);
        const newValues = [...values];
        newValues[index] = val;
        setValues(newValues);

        if (val && index < 6) {
            inputsRef.current[index + 1]?.focus();
        }

        if (newValues.every(char => char)) {
            const fullId = newValues.join('');
            verifyCall(fullId);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (values[index]) {
                const newValues = [...values];
                newValues[index] = '';
                setValues(newValues);
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 6) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const verifyCall = async (callId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/calls/${callId}`);
            if (res.data) {
                navigate(`/room/${callId}`, { state: { isCreator: false } });
            }
        } catch (err) {
            setErrorMessage('Appel non trouvé. Veuillez vérifier l’ID et réessayer. '+ err.message);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Entrez l’ID de l’appel</h2>
            {errorMessage && <div className="text-red-600 font-bold mb-4">{errorMessage}</div>}
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                {values.map((char, i) => (
                    <input
                        key={i}
                        type="text"
                        value={char}
                        maxLength="1"
                        ref={el => inputsRef.current[i] = el}
                        onChange={e => handleChange(i, e)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className="w-12 h-12 text-center text-xl border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                ))}
            </div>
        </div>
    );
}