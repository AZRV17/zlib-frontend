// src/components/LoginForm.js
import React, { useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const LoginForm = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);

        let user = {
            login: formData.login,
            password: formData.password
        };

        const response = await axios.post("http://localhost:8080/users/sign-in-by-login", user, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch((err) => {
            toast.error("Не удалось войти.")
        })

        if (response && response.status === 200) {
            if (response.data.role === "admin") {
                window.location.href = "/admin/users";
            } else if (response.data.role === "librarian") {
                window.location.href = "/admin/authors";
            } else {
                window.location.href = "/";
            }
        }
    };

    return (
        <div className="flex justify-center items-center w-full">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <form onSubmit={handleSubmit} className="w-full">
                <h2 className="text-3xl font-bold mb-6 text-center">Вход</h2>

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Логин или Email
                    </label>
                    <input
                        type="text"
                        name="login"
                        id="login"
                        value={formData.login}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Введите логин или email"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Пароль
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Введите пароль"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full font-medium bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-150"
                >
                    Войти
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
