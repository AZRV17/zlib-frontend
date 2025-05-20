// src/components/LoginForm.js
import React, { useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {api} from '../../App.js'

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

        if (!user.login || !user.password) {
            toast.error("Заполните все поля.");
            return;
        }

        if (user.login.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            user = {
                email: user.login,
                password: user.password
            }

            const response = await axios.post(`${api}/users/sign-in-by-email`, user, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch((err) => {
                toast.error("Не удалось войти.")
            })

            if (response && response.status === 200) {
                if (response.data.user.role === "admin") {
                    window.location.href = "/admin/users";
                } else if (response.user.data.role === "librarian") {
                    window.location.href = "/admin/authors";
                } else {
                    window.location.href = "/";
                }
            }
        } else {
            const response = await axios.post(`${api}/users/sign-in-by-login`, user, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch((err) => {
                toast.error("Не удалось войти.")
            })

            if (response && response.status === 200) {
                if (response.data.user.role === "admin") {
                    window.location.href = "/admin/users";
                } else if (response.data.user.role === "librarian") {
                    window.location.href = "/admin/authors";
                } else {
                    window.location.href = "/";
                }
            }
        }
    };

    return (
        <div className="w-full">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-900">Вход</h2>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                            Логин или Email
                        </label>
                        <input
                            type="text"
                            name="login"
                            id="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите логин или email"
                        />
                    </div>

                    <div>
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите пароль"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                    Войти
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
