import { useEffect, useState } from 'react';
import axios from 'axios';
import FeatherIcon from "feather-icons-react";

export default function ConfigEditor() {
    const [configs, setConfigs] = useState([]);
    const [edited, setEdited] = useState({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/config`, { withCredentials: true })
            .then(res => setConfigs(res.data));
    }, []);

    const handleChange = (key, value) => {
        setEdited(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = (key) => {
        const value = edited[key];
        axios.put(`${import.meta.env.VITE_API_URL}/api/config/${key}`, { value }, { withCredentials: true })
            .then(res => {
                setConfigs(prev => prev.map(cfg => cfg.key === key ? res.data : cfg));
            });
    };

    const renderInput = (cfg) => {
        const currentValue = edited[cfg.key] !== undefined ? edited[cfg.key] : cfg.value;

        if (typeof cfg.value === 'boolean') {
            return (
                <input
                    type="checkbox"
                    checked={Boolean(currentValue)}
                    onChange={(e) => handleChange(cfg.key, e.target.checked)}
                />
            );
        }

        return (
            <input
                className="border px-2 py-1 flex-1"
                defaultValue={currentValue}
                onChange={(e) => handleChange(cfg.key, e.target.value)}
            />
        );
    };

    return (
        <div className="box">
            <h2 className="text-xl font-bold">Configuration globale</h2>
            <div className={"fc g0-5"}>
                {configs.map(cfg => (
                    <div key={cfg.key} className="flex items-center jc-sb">
                        <div className={"fr g0-5 ai-c"}>
                            <p>{cfg.key}</p>
                            {renderInput(cfg)}
                        </div>

                        <button
                            className="special-button"
                            onClick={() => handleSave(cfg.key)}
                        >
                            <FeatherIcon icon={"save"} size={16} className="inline"/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}