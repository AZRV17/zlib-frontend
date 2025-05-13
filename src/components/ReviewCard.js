import React from 'react';
import { Star } from 'lucide-react';
import {toast} from "react-toastify";
import {FiShare} from "react-icons/fi";
import {api} from '../App.js'

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

const ReviewCard = ({ review }) => {

    const shareLink = () => {
        const baseUrl = window.location.href.split('#')[0]; // Получаем базовый URL без хэша
        const reviewUrl = `${baseUrl}#review-${review.id}`; // Добавляем id отзыва как хэш
        navigator.clipboard.writeText(reviewUrl);

        // Показываем уведомление
        toast.success('Ссылка скопирована в буфер обмена')
    };

    return (
        <div id={`review-${review.id}`} className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {review.user.login.charAt(0).toUpperCase()}
            </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {review.user.login}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          {review.rating}/5
        </span>
            </div>

            <div className="flex items-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={18}
                        className={`${
                            star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                        } mr-1`}
                    />
                ))}
            </div>

            <p className="text-gray-700 leading-relaxed">
                {review.message}
            </p>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex space-x-4">
                    <button
                        onClick={shareLink}
                        className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FiShare size={16} />
                        <span className="text-sm">Поделиться</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;