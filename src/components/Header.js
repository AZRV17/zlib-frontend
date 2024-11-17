import React, {useEffect, useState} from 'react';
import { Link, NavLink } from "react-router-dom";
import {
    FiBook,
    FiBookmark, FiClipboard,
    FiCode,
    FiDatabase,
    FiHeart,
    FiHome,
    FiLogIn,
    FiLogOut,
    FiPenTool,
    FiUser
} from "react-icons/fi";
import axios from "axios";
import {FaNewspaper} from "react-icons/fa";
import {FaBarcode, FaMasksTheater} from "react-icons/fa6";

const Header = () => {
    const [role, setRole] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false); // Для отображения кастомного окна

    const fetchUser = async () => {
        try {
            return await axios.get("http://localhost:8080/users/cookie", {
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

    const handleLogout = async () => {
        try {
            const response = await axios.post("http://localhost:8080/users/logout", null, {
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

    const handleLogoutClick = (e) => {
        e.preventDefault();

        setShowLogoutModal(true);
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

    return (
        <header className="text-black flex flex-col justify-start items-center h-full px-4 py-2 w-[100px] fixed left-0 top-0">
            <Link className="text-[27px] mt-5 font-montserrat text-center font-medium hover:text-gray-400 transition-colors duration-150 cursor-pointer" to="/">
                ZLib
            </Link>
            <nav className="flex flex-col space-y-10 justify-start items-center m-0">
                {(role === "") && (
                    <>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] mt-[50%] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/">
                            <FiHome size={30} />
                        </NavLink>

                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/auth">
                            <FiLogIn size={30} />
                        </NavLink>
                    </>

                )}

                {(role === "user") && (
                    <>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] mt-[50%] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/">
                            <FiHome size={30} />
                        </NavLink>

                        <NavLink
                            className={({ isActive }) =>
                                `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                            }
                            to="/favorites">
                            <FiHeart size={30} />
                        </NavLink>

                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/reservations">
                            <FiBookmark size={30} />
                        </NavLink>

                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/profile">
                            <FiUser size={30} />
                        </NavLink>

                        <button
                            className="text-[20px] font-montserrat transition-colors duration-150 text-gray-400 hover:text-gray-500"
                            onClick={handleLogoutClick}
                        >
                            <FiLogOut size={30} />
                        </button>
                    </>
                )}

                {(role === "admin") && (
                    <>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] mt-[50%] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/users">
                            <FiUser size={30} />
                        </NavLink>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] mt-[50%] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/logs">
                            <FiClipboard size={30} />
                        </NavLink>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] mt-[50%] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/backup">
                            <FiDatabase size={30} />
                        </NavLink>
                        <button
                            className="text-[20px] font-montserrat transition-colors duration-150 text-gray-400 hover:text-gray-500"
                            onClick={handleLogoutClick}
                        >
                            <FiLogOut size={30} />
                        </button>
                    </>
                )}

                {(role === "librarian") && (
                    <>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] mt-[50%] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/authors">
                            <FiPenTool size={30} />
                        </NavLink>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/books">
                            <FiBook size={30} />
                        </NavLink>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/genres">
                            <FaMasksTheater size={27} />
                        </NavLink>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/publishers">
                            <FaNewspaper size={27} />
                        </NavLink>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/unique-codes">
                            <FaBarcode size={27}/>
                        </NavLink>
                        <NavLink className={({ isActive }) =>
                            `text-[20px] font-montserrat transition-colors duration-150 ${isActive ? 'text-[#0D276B] hover:text-[#0D276B]' : 'text-gray-400 hover:text-gray-500'}`
                        } to="/admin/reservations">
                            <FiBookmark size={30}/>
                        </NavLink>
                        <button
                            className="text-[20px] font-montserrat transition-colors duration-150 text-gray-400 hover:text-gray-500"
                            onClick={handleLogoutClick}
                        >
                            <FiLogOut size={30} />
                        </button>
                    </>
                )}

            </nav>

            {/* Модальное окно для подтверждения выхода */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black bg-opacity-50">
                    {/* Модальное окно */}
                    <div className="relative bg-white p-6 rounded-lg shadow-lg z-50">
                        <h2 className="text-xl font-bold mb-4">Вы уверены?</h2>
                        <p className="mb-6">Вы хотите выйти из системы?</p>
                        <div className="flex justify-between">
                            <Link
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-150"
                                onClick={confirmLogout}
                                to="/"
                            >
                                Выйти
                            </Link>
                            <button
                                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-150"
                                onClick={cancelLogout}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </header>
    );
};

export default Header;
