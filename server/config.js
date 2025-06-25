import dotenv from 'dotenv'
dotenv.config()

const config = {
    dbUri: process.env.DB_URI,
    port: process.env.PORT || 3004,
    clientUrl: process.env.CLIENT_URL,
    secretKey: process.env.SECRET_KEY,
    cookieSessionName: 'call_session_token',
    admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin'
    },
    transcription: {
        useMock: process.env.USE_MOCK_TRANSCRIPT === 'true',
    }
}

export default config