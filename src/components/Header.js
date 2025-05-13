import React, {useEffect, useState} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    FiBook,
    FiBookmark, FiClipboard,
    FiCode,
    FiDatabase,
    FiHeart,
    FiHome,
    FiLogIn,
    FiLogOut, FiMenu,
    FiPenTool,
    FiUser, FiX
} from "react-icons/fi";
import axios from "axios";
import {FaNewspaper} from "react-icons/fa";
import {FaBarcode, FaMasksTheater} from "react-icons/fa6";
import {BsFillChatTextFill} from "react-icons/bs";

import {api} from '../App.js'


const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false); // Для отображения кастомного окна

    const navigate = useNavigate()
    const location = useLocation();

    const fetchUser = async () => {
        try {
            return await axios.get(`${api}/users/cookie`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            console.log("Ошибка при проверке авторизации", err);
            return null;
        }
    };

    const handleNavigation = (path) => {
        setIsOpen(false); // Закрываем меню
        navigate(path);
    };

    const handleLogoutClick = (e) => {
        if (e) {
            e.preventDefault();
        }
        setIsOpen(false);
        setShowLogoutModal(true);
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${api}/users/logout`, null, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                setRole("");
                window.location.reload();
            }
        } catch (err) {
            console.log("Ошибка при выходе из системы", err);
        }
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        handleLogout();
    };

    const cancelLogout = () => {
        setShowLogoutModal(false); // Закрываем окно
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            setIsLoading(true);
            const response = await fetchUser();

            if (response && response.status === 200) {
                setRole(response.data.role);
            } else {
                setRole("");
            }
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    if (isLoading) {
        return null;
    }

    const MenuItem = ({ to, icon: Icon, text, onClick }) => {
        const isActive = location.pathname === to;
        return (
            <div
                className={`flex items-center px-6 py-3 hover:bg-gray-100 cursor-pointer
                ${isActive ? 'text-[#0D276B] font-medium' : 'text-gray-600'}`}
                onClick={(e) => { // Добавляем объект события
                    if (onClick) {
                        onClick(e);
                    } else {
                        handleNavigation(to);
                    }
                }}
            >
                <Icon size={20} className="mr-3" />
                <span>{text}</span>
            </div>
        );
    };

    return (
        <>
            <button
                className="fixed top-4 left-4 z-50 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <header className={`fixed left-0 top-0 h-full bg-white shadow-lg w-64 transform 
                transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-40`}>
                <Link
                    className="block text-2xl font-bold text-center py-6 border-b border-gray-200"
                    to="/"
                    onClick={() => setIsOpen(false)}
                >
                    ZLib
                </Link>

                <nav className="py-4">
                    {role === "" && (
                        <>
                            <MenuItem to="/" icon={FiHome} text="Главная" />
                            <MenuItem to="/auth" icon={FiLogIn} text="Войти" />
                        </>
                    )}

                    {role === "user" && (
                        <>
                            <MenuItem to="/" icon={FiHome} text="Главная" />
                            <MenuItem to="/favorites" icon={FiHeart} text="Избранное" />
                            <MenuItem to="/reservations" icon={FiBookmark} text="Бронирования" />
                            <MenuItem to="/profile" icon={FiUser} text="Профиль" />
                            <MenuItem to="/chat" icon={BsFillChatTextFill} text="Чат" />
                            <MenuItem
                                to="#"
                                icon={FiLogOut}
                                text="Выйти"
                                onClick={handleLogoutClick}
                            />
                        </>
                    )}

                    {role === "librarian" && (
                        <>
                            <MenuItem to="/admin/books" icon={FiBook} text="Книги" />
                            <MenuItem to="/admin/authors" icon={FiPenTool} text="Авторы" />
                            <MenuItem to="/admin/genres" icon={FaMasksTheater} text="Жанры" />
                            <MenuItem to="/admin/publishers" icon={FaNewspaper} text="Издатели" />
                            <MenuItem to="/admin/unique-codes" icon={FaBarcode} text="Уникальные коды" />
                            <MenuItem to="/admin/reservations" icon={FiClipboard} text="Бронирования" />
                            <MenuItem to="/librarian/chat" icon={BsFillChatTextFill} text="Чат" />
                            <MenuItem
                                to="#"
                                icon={FiLogOut}
                                text="Выйти"
                                onClick={handleLogoutClick}
                            />
                        </>
                    )}

                    {role === "admin" && (
                        <>
                            <MenuItem to="/" icon={FiHome} text="Главная" />
                            <MenuItem to="/admin/users" icon={FiUser} text="Пользователи" />
                            <MenuItem to="/admin/backup" icon={FiDatabase} text="БД" />
                            <MenuItem to="/admin/logs" icon={FiCode} text="Логи" />
                            <MenuItem
                                to="#"
                                icon={FiLogOut}
                                text="Выйти"
                                onClick={handleLogoutClick}
                            />
                        </>
                    )}
                </nav>
            </header>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Вы уверены?</h2>
                        <p className="mb-6">Вы хотите выйти из системы?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400
                                    transition-colors duration-150"
                                onClick={cancelLogout}
                            >
                                Отмена
                            </button>
                            <Link
                                className="px-4 py-2 rounded-md bg-red-500 text-white
                                    hover:bg-red-600 transition-colors duration-150"
                                onClick={confirmLogout}
                                to="/"
                            >
                                Выйти
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;


