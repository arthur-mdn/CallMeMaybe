import dotenv from 'dotenv'
dotenv.config()

const config = {
    dbUri: process.env.DB_URI,
    port: process.env.PORT || 3004,
    clientUrl: process.env.CLIENT_URL,
    secretKey: process.env.SECRET_KEY,
    cookieSessionName: 'call_session_token'
}

export default config