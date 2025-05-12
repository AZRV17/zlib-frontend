import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import ForgotPasswordForm from "../components/forms/ForgotPasswordForm";
import ResetPasswordForm from "../components/forms/ResetPasswordForm";
import {ToastContainer} from "react-toastify";

const Auth = () => {
    const [searchParams] = useSearchParams();
    const [currentForm, setCurrentForm] = useState(searchParams.get('token') ? 'reset' : 'login');

    const renderForm = () => {
        switch (currentForm) {
            case 'register':
                return <RegisterForm />;
            case 'forgot':
                return <ForgotPasswordForm onBackToLogin={() => setCurrentForm('login')} />;
            case 'reset':
                return <ResetPasswordForm onBackToLogin={() => setCurrentForm('login')} />;
            default:
                return (
                    <>
                        <LoginForm />
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setCurrentForm('register')}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                            >
                                Нет аккаунта? Зарегистрируйтесь
                            </button>
                            <button
                                onClick={() => setCurrentForm('forgot')}
                                className="block mx-auto mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                            >
                                Забыли пароль?
                            </button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-[calc(100vh-65px)] w-full overflow-auto bg-gray-100">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-3">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                    {renderForm()}
                </div>
            </div>
        </div>
    );
};

export default Auth;