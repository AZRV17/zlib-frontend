import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {api} from '../../App.js'


const ResetPasswordForm = ({ onBackToLogin }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const token = searchParams.get('token');

    useEffect(() => {
        const validateToken = async () => {
            try {
                await axios.get(`${api}/users/reset-password?token=${token}`);


            } catch (error) {
                toast.error('Недействительная или истекшая ссылка');
                navigate('/auth');
            }
        };
        if (token) validateToken();
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${api}/users/reset-password`,
                { token, new_password: newPassword },
                { headers: { 'Content-Type': 'application/json' } }
            );
            toast.success(response.data.message);
            onBackToLogin();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Произошла ошибка');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-900">Сброс пароля</h2>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Новый пароль
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите новый пароль"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;