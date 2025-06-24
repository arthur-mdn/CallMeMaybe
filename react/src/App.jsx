import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import CreateCallPage from './pages/CreateCallPage.jsx'
import JoinPage from './pages/JoinPage.jsx'
import CallPage from './pages/CallPage.jsx'
import {AuthProvider, useAuth} from "../AuthContext.jsx";


const AuthenticatedApp = () => {
    const {authStatus} = useAuth();
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create" element={<CreateCallPage />} />


                {authStatus === "unauthenticated" ? (
                    <>
                        {/* Routes publiques */}
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/join" element={<JoinPage />} />
                        <Route path="/room/:callId" element={<CallPage />} />
                    </>
                ) : (
                    <>
                        {/* Routes privées */}
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/create" element={<CreateCallPage />} />
                        <Route path="/join" element={<JoinPage />} />
                        <Route path="/room/:callId" element={<CallPage />} />
                    </>
                )}

                <Route path="*"
                       element={<Navigate to={authStatus === "unauthenticated" ? "/login" : "/"}/>}/>

            </Routes>
        </BrowserRouter>
    )
};



const App = () => {
    return (
        <AuthProvider>
            <AuthenticatedApp/>
        </AuthProvider>
    );
};

export default App