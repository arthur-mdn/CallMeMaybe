import { Link } from 'react-router-dom'

export default function HomePage() {
    return (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>Bienvenue</h1>
            <div style={{ margin: '1rem' }}>
                <Link to="/login">
                    <button style={{ padding: '1rem 2rem' }}>Admin Login</button>
                </Link>
            </div>
            <div style={{ margin: '1rem' }}>
                <Link to="/join">
                    <button style={{ padding: '1rem 2rem' }}>Rejoindre un appel</button>
                </Link>
            </div>
        </div>
    )
}