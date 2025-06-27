import { useEffect, useRef, useState } from "react";

export default function PrimaryLoader() {
    const NUMBER_OF_SQUARES = 7;
    const FRAME_INTERVAL_MS = 800;
    const STATES = [
        [
            { left: 30, top: 6, opacity: 0.6 },
            { left: 18, top: 18 },
            { left: 42, top: 18 },
            { left: 6, top: 30 },
            { left: 18, top: 42 },
            { left: 12, top: 12, opacity: 0 },
            { left: 42, top: 54 }
        ],
        [
            { left: 24, top: 12 },
            { left: 0, top: 24 },
            { left: 48, top: 24 },
            { left: 12, top: 36 },
            { left: 12, top: 48, opacity: 0.6 },
            { left: 12, top: 12, opacity: 0 },
            { left: 36, top: 38 }
        ],
        [
            { left: 24, top: 24 },
            { left: 0, top: 24, opacity: 0.6 },
            { left: 48, top: 12, opacity: 1 },
            { left: 0, top: 36 },
            { left: 12, top: 60, opacity: 0.6 },
            { left: 12, top: 0 },
            { left: 24, top: 38 }
        ]
    ];

    const [currentState, setCurrentState] = useState(0);
    const intervalRef = useRef();

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrentState(prev => (prev + 1) % STATES.length);
        }, FRAME_INTERVAL_MS);

        return () => clearInterval(intervalRef.current);
    }, []);

    return (
        <div className="loader">
            <div className="loader__surface">
                {Array.from({ length: NUMBER_OF_SQUARES }).map((_, i) => {
                    const { left, top, opacity = 1 } = STATES[currentState][i];
                    return (
                        <div
                            key={i}
                            className="loader__square"
                            style={{
                                transform: `translate(${left}px, ${top}px)`,
                                opacity
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}