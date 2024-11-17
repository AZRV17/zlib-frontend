// src/pages/Login.js
import React from 'react';
import Header from "../components/Header";
import LoginForm from "../components/forms/LoginForm";

const Login = () => {
    return (
        <div className="min-h-screen flex flex-col items-start bg-gray-50 w-full">
            {/*<Header />*/}
            <div className="flex justify-center items-center mt-10 p-4 w-full max-h-screen px-[30%]">
                <LoginForm />
            </div>
        </div>
    );
};

export default Login;
