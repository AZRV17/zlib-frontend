// src/pages/Auth.js
import React, { useState } from 'react';
import Header from "../components/Header";
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 w-screen">
            {/*<Header />*/}
            <div className="flex flex-col justify-center shadow-lg rounded-lg bg-white items-center p-4 w-full max-w-md">
                {/* Убрал фоновый квадрат */}
                <div className="w-full p-4">
                    {isLogin ? <LoginForm /> : <RegisterForm />}

                    {/* Toggle Button inside the form */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleForm}
                            className="font-normal text-sm text-gray-400 hover:text-gray-500 transition-colors duration-150"
                        >
                            {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Есть аккаунт? Войдите"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
