import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import CallPage from './pages/CallPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/:callId" element={<CallPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App