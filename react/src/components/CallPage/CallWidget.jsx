import { useEffect, useRef } from "react";
import FeatherIcon from "feather-icons-react";

export default function CallWidget({
                                       isCreator,
                                       joined,
                                       callDetails,
                                       onJoin,
                                       onHangUp,
                                       localStream,
                                       remoteStreams
                                   }) {
    const localAudioRef = useRef(null);
    const remoteAudioRefs = useRef({});

    useEffect(() => {
        if (localAudioRef.current && localStream) {
            localAudioRef.current.srcObject = localStream;
        }

        remoteStreams.forEach(({ socketId, stream }) => {
            const ref = remoteAudioRefs.current[socketId];
            if (ref && stream) {
                ref.srcObject = stream;
            }
        });
    }, [localStream, remoteStreams]);

    if (!callDetails) return null;

    if (!joined && callDetails.endedAt && !isCreator) {
        return (
            <div>
                L'appel est terminé. Vous ne pouvez pas rejoindre un appel terminé.
            </div>
        );
    }
    if (!joined && callDetails.endedAt) {
        return (
            <></>
        );
    }

    if (!joined) {
        return (
            <div className="box jc-fs">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {isCreator ? 'Démarrer l’appel' : 'Rejoindre l’appel'}
                </h2>
                <button
                    onClick={onJoin}
                    className="call start mta"
                >
                    <FeatherIcon icon={"phone-call"} size={20} className="mr-2" />
                    {isCreator ? 'Démarrer' : 'Rejoindre'}
                </button>
            </div>
        );
    }

    return (
        <div className="box">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Appel en cours
            </h2>
            <div className="flex flex-col space-y-4 mb-4">
                <audio
                    ref={localAudioRef}
                    autoPlay
                    muted
                    controls
                    style={{display: "none"}}
                />
                {remoteStreams.map(({socketId}) => (
                    <audio
                        key={socketId}
                        autoPlay
                        controls
                        ref={el => {
                            if (el) remoteAudioRefs.current[socketId] = el;
                        }}
                        className="w-full rounded-md shadow-sm"
                    />
                ))}
            </div>
            <button
                onClick={onHangUp}
                className="call end mta"
            >
                <FeatherIcon icon={"phone-off"} size={20} className="mr-2"/>
                {isCreator ? 'Terminer l’appel' : 'Quitter l’appel'}
            </button>
        </div>
    );
}