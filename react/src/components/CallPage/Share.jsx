import QRCode from 'react-qr-code';

export default function Share() {
    return (
        <div className={"box"}>
            <button
                id={"share_link_button"}
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Lien copié dans le presse-papiers !')
                }}
                className="mb-4 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
            >
                Partager
            </button>
            <textarea
                readOnly
                value={window.location.href}
                className="w-full h-10 mb-4 p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 resize-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="p-4 bg-white inline-block">
                <QRCode value={window.location.href} size={128} bgcolor="#ffffff" fgColor="#000000"/>
            </div>
        </div>
    )
}