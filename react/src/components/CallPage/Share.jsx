import QRCode from 'react-qr-code';
import FeatherIcon from "feather-icons-react";

export default function Share() {
    return (
        <div className={"box g1"}>
            <h2 className="text-2xl font-bold">Partager</h2>
            <p>Partagez le lien ci-dessous ou montrez le QR Code.</p>
            <div className={"fr g0-5"}>
                <textarea
                    readOnly
                    value={window.location.href}
                    className="w-full h-10 mb-4 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 resize-none focus:ring-indigo-500 focus:border-indigo-500"
                    style={{backgroundColor: '#EAEAEA', border: 0}}
                />
                <button
                    id={"share_link_button"}
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        const button = document.getElementById("share_link_button");
                        button.style.backgroundColor = "#4CAF50";
                        button.style.color = "#FFFFFF";
                        setTimeout(() => {
                            button.style.backgroundColor = "";
                            button.style.color = "";
                        }, 1000);
                    }}
                >
                    <FeatherIcon icon={"copy"}/>
                </button>
            </div>

            <div className="inline-block">
                <QRCode value={window.location.href} size={128} bgcolor="#ffffff" fgColor="#000000"/>
            </div>
        </div>
    )
}