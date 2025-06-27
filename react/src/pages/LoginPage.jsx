import LoginForm from "../components/LoginPage/LoginForm.jsx";
import JoinForm from "../components/LoginPage/JoinForm.jsx";

export default function LoginPage() {
    return (
        <div className={"login_form_container"}>
            <img src="/ia-bot.png" alt="IA Bot"/>
            <div className="mx-auto box g1 fc login_form">
                <LoginForm/>
                <div className={"fc ai-c"}>
                    OU
                </div>
                <JoinForm/>
            </div>
        </div>

    )
}