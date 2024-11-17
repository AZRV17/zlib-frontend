// src/pages/Login.js
import React from 'react';
import Header from "../components/Header";
import RegisterForm from "../components/forms/RegisterForm";

const Register = () => {
    return (
        <div className="min-h-screen flex flex-col items-start bg-gray-50 w-full">
            {/*<Header />*/}
            <div className="flex justify-center items-center mt-10 p-4 w-full max-h-screen px-[30%]">
                <RegisterForm />
            </div>
        </div>
    );
};

export default Register;
