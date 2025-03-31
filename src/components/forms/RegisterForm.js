// src/components/RegisterForm.js
import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        email: '',
        full_name: '',
        role: '',
        phone_number: '',
        passport_number: '',
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

        const newUser = {
            login: formData.login,
            password: formData.password,
            email: formData.email,
            full_name: formData.full_name,
            role: "user",
            phone_number: formData.phone_number,
            passport_number: parseInt(formData.passport_number),
        };

        // setFormData({ login: '', password: '' , email: '', role: '', phone_number: '', passport_number: '' });

        const response = await axios.post('http://localhost:8080/users/sign-up', newUser)

        if (response.status === 200) {
            window.location.href = "/auth";
        } else {
            toast.error("Не удалось зарегистрироваться.");
        }
    };

    return (
        <div className="flex justify-center items-center w-full">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <form
                onSubmit={handleSubmit}
                className="rounded-lg max-w-md w-full"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Логин
                    </label>
                    <input
                        type="text"
                        name="login"
                        id="login"
                        value={formData.login}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Введите логин"
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

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Введите email"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                        ФИО
                    </label>
                    <input
                        type="text"
                        name="full_name"
                        id="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Введите ФИО"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                        Номер телефона
                    </label>
                    <InputMask
                        mask="+7 (999) 999-99-99"
                        value={formData.phone_number}
                        onChange={handleChange}
                        name="phone_number"
                        id="phone_number"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Введите номер телефона"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="passport_number" className="block text-sm font-medium text-gray-700">
                        Номер паспорта
                    </label>
                    <input
                        type="number"
                        min="1000000000"
                        max="9999999999"
                        name="passport_number"
                        id="passport_number"
                        value={formData.passport_number}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Введите номер паспорта"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full font-medium bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-150"
                >
                    Зарегистрироваться
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;
