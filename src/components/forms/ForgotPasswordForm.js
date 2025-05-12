import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPasswordForm = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/users/forgot-password',
                { "email": email },
                { headers: { 'Content-Type': 'application/json' } }
            );
            toast.success("Письмо отправлено");
            onBackToLogin();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-3xl font-bold text-center text-gray-900">Восстановление пароля</h2>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                    {loading ? 'Отправка...' : 'Отправить'}
                </button>
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-150"
                >
                    Вернуться к входу
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;