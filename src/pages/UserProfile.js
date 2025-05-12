import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/Header";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";

const UserProfile = () => {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showSensitiveData, setShowSensitiveData] = useState(false);
    const [user, setUser] = useState({
        id: 0,
        login: '',
        full_name: '',
        password: '',
        email: '',
        role: '',
        phone_number: '',
        passport_number: 0
    });

    const fetchUser = async () => {
        await axios.get('http://localhost:8080/users/cookie', {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            setUser({
                ...response.data,
                phone_number: response.data.phone_number || '', // Проверка на случай undefined
                passport_number: response.data.passport_number || '' // Проверка на случай undefined
            });
        }).catch(err => {
            console.log(err);
        });
    };

    const updateUser = async () => {
        user.passport_number = parseInt(user.passport_number);
        user.email = newEmail

        const response = await axios.patch('http://localhost:8080/users/cookie', user, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            setIsEditing(false);
        } else {
            fetchUser();
            alert("Произошла ошибка при обновлении профиля");
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            updateUser();
            setShowSensitiveData(false)
        } else {
            setShowSensitiveData(true)
        }

        setIsEditing(!isEditing);
    };

    const handleToggleSensitiveData = () => {
        setShowSensitiveData(!showSensitiveData);
    };

    const handleEmailChange = async () => {
        try {
            const response = await axios.patch('http://localhost:8080/users/cookie', { ...user, email: newEmail }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setUser((prevUser) => ({ ...prevUser, email: newEmail })); // Обновляем email в состоянии
                setIsEmailModalOpen(false);
                toast.success("Email успешно изменен");
            } else {
                toast.error("Произошла ошибка при обновлении email");
            }
        } catch (error) {
            console.error("Ошибка при изменении email:", error);
            toast.error("Не удалось изменить email");
        }
    };

    const handleDeleteProfile = async () => {
        try {
            // Отправка запроса на удаление профиля
            await axios.delete("http://localhost:8080/users/cookie", {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });
            toast.success("Профиль успешно удален");
            // Перенаправление после удаления
            window.location.href = "/";
        } catch (error) {
            console.error("Ошибка при удалении профиля:", error);
            toast.error("Не удалось удалить профиль");
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">{user.login}</h2>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                    <button
                        onClick={handleEditToggle}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        {isEditing ? 'Сохранить' : 'Изменить'}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block font-medium text-gray-700 mb-2">Логин</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3"
                            value={user.login || ''} // Гарантируем наличие значения
                            onChange={(e) => setUser({ ...user, login: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-2">Полное имя</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3"
                            value={user.full_name || ''} // Гарантируем наличие значения
                            onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-2">Номер телефона</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3"
                            value={showSensitiveData ? user.phone_number : '••••••••••'} // Скрытие данных
                            onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-2">Серия и номер паспорта</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3"
                            value={showSensitiveData ? user.passport_number : '••••••••••'} // Скрытие данных
                            onChange={(e) => setUser({ ...user, passport_number: e.target.value })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <button
                    onClick={handleToggleSensitiveData}
                    className="w-full mt-4 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
                >
                    {showSensitiveData ? 'Скрыть персональные данные' : 'Показать персональные данные'}
                </button>

                <div className="mt-8">
                    <h3 className="text-lg font-bold mb-4">Мой адрес электронной почты</h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-blue-100 text-blue-500 rounded-full p-2">
                            ✉️
                        </div>
                        <div className="flex flex-col">
                            <p>{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-blue-100 text-blue-500 rounded-md hover:bg-blue-200 transition duration-200"
                    >
                        Изменить email
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="mt-4 ml-4 px-4 py-2 bg-red-100 text-red-500 rounded-md hover:bg-red-200 transition duration-200"
                    >
                        Удалить аккаунт
                    </button>
                </div>
            </div>

            {/* Модальное окно для изменения email */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Изменить email</h2>
                        <input
                            type="email"
                            placeholder="Введите новый email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsEmailModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleEmailChange}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для удаления профиля */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Удалить профиль</h2>
                        <p className="mb-4">Вы уверены, что хотите удалить свой профиль? Это действие необратимо.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDeleteProfile}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
