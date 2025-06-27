import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import CreateCallPage from './pages/CreateCallPage.jsx'
import CallPage from './pages/CallPage.jsx'
import {AuthProvider, useAuth} from "../AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";

const AuthenticatedApp = () => {
    const {authStatus} = useAuth();
    console.log(authStatus)
    return (
        <BrowserRouter>
            <Routes>
                {(authStatus === "unauthenticated" || authStatus === "loading") ? (
                    <>
                        {/* Routes publiques */}
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/room/:callId" element={<CallPage />} />
                    </>
                ) : (
                    <>
                        {/* Routes privées */}
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/create" element={<CreateCallPage />} />
                        <Route path="/room/:callId" element={<CallPage />} />
                    </>
                )}

                <Route path="*" element={<Navigate to={authStatus === "unauthenticated" ? "/login" : "/"}/>}/>

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