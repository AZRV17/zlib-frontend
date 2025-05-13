import {Link} from "react-router-dom";
import { Book } from "../models/book";
import { useParams } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {FiBookOpen, FiDownload, FiHeart} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {FaStar} from "react-icons/fa";
import {Review} from "../models/review";
import ReviewCard from "../components/ReviewCard";
import {AudioLinesIcon, FileAudio} from "lucide-react";
import AudiobookPlayer from "../components/AudiobookPlayer"; // Import the new component
import {api} from '../App.js'

const BookDetail = () => {
    const [book, setBook] = useState(null);
    const { id } = useParams();
    const [isFilled, setIsFilled] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [rating, setRating] = useState(0);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false); // State for controlling audio modal

    const scrollToReview = (reviewId) => {
        const element = document.getElementById(`review-${reviewId}`);
        if (element) {
            // Добавляем отступ сверху для лучшего позиционирования
            const offset = 100; // отступ в пикселях
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Set yellow background initially
            element.style.backgroundColor = "rgb(254, 243, 199)"; // yellow-50
            element.style.transition = "background-color .5s ease-in";

            // Start fade-out effect after 2 seconds
            setTimeout(() => {
                let opacity = 1.0;
                const fadeInterval = setInterval(() => {
                    opacity -= 0.5;
                    element.style.backgroundColor = `rgba(254, 243, 199, ${opacity})`;

                    // Stop interval when opacity is close to 0
                    if (opacity <= 0) {
                        clearInterval(fadeInterval);
                        element.style.backgroundColor = "white"; // reset to white background
                    }
                }, 50); // Adjust this value for a faster or slower fade
            }, 2000);

            element.removeAttribute('id');

        }
    };

    const fetch_book_by_id = async (id) => {
        await axios.get(`${api}/books/${id}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(
            (response) => {
                let book = Book.fromJson(response.data);
                if (!book.picture) {
                    book.picture = "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg";
                }
                setBook(book);
            }
        ).catch((err) => {
            console.log(err);
        });
    };

    const check_is_favorite = async () => {
        try {
            const response = await axios.get(`${api}/favorites/cookie`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                response.data.some(fav => fav.book_id.toString() === id) && setIsFilled(true);
            } else {
                setIsFilled(false);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const reserve_book = async () => {
        try {
            const response = await axios.post(`${api}/books/${id}`, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                toast.success("Книга успешно забронирована!");
            }
        } catch (err) {
            toast.error("Не удалось забронировать книгу.");
            console.log(err);
        }
    };

    const add_to_favorites = async () => {
        try {
            const response = await axios.post(`${api}/favorites/cookie`, { "book_id": parseInt(id) }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setIsFilled(true);
                toast.success("Книга добавлена в избранное!");
            }
        } catch (err) {
            toast.error("Не удалось добавить книгу в избранное.");
            console.log(err);
        }
    };

    const remove_from_favorites = async () => {
        try {
            await axios.delete(`${api}/favorites/cookie/${parseInt(id)}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setIsFilled(false);
            toast.info("Книга удалена из избранного.");
        } catch (err) {
            toast.error("Не удалось удалить книгу из избранного.");
            console.log(err);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${api}/reviews/${id}`, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200) {
                const reviewsData = response.data.map(reviewData => {
                    let review = Review.fromJson(reviewData);
                    return review;
                })

                setReviews(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const downloadBook = async () => {
        try {
            const response = await axios.get(`${api}/books/${id}/download`, {
                withCredentials: true,
                responseType: 'blob' // Говорим axios, что нам нужен бинарный файл
            });

            if (response.status === 200) {
                const url = window.URL.createObjectURL(response.data);
                const link = document.createElement('a');

                // Получаем имя файла из заголовка, если сервер его отправляет
                let filename = `book_${new Date().toISOString().replace(/[:.]/g, '-')}.epub`;
                const contentDisposition = response.headers['content-disposition'];
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="(.+)"/);
                    if (match && match[1]) {
                        filename = match[1];
                    }
                }

                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                toast.success("Книга успешно скачана!");
            }
        } catch (err) {
            toast.error("Не удалось скачать книгу.");
            console.log(err);
        }
    };


    const submitReview = async () => {
        try {
            const response = await axios.post(`${api}/reviews/`,
                { message: newReview, rating: parseFloat(rating), book_id: parseInt(id) },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.status === 200) {
                toast.success("Отзыв успешно добавлен!");
                setNewReview("");
                setRating(0);
                fetchReviews();

                const newReviewId = response.data.id; // предполагая, что сервер возвращает id нового отзыва
                setTimeout(() => scrollToReview(newReviewId), 100);
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                toast.error("Пожалуйста, войдите в систему, чтобы оставить отзыв.");
            } else if (err.response.data.error === "user already reviewed this book") {
                toast.error("Вы уже оставили отзыв на эту книгу.");
            } else {
                toast.error("Не удалось добавить отзыв.");
                console.log(err);
            }
        }
    };

    const handleRating = (rate) => setRating(rate);

    // Open audio player modal
    const openAudioPlayer = () => {
        setShowAudioPlayer(true);
    };

    // Close audio player modal
    const closeAudioPlayer = () => {
        setShowAudioPlayer(false);
    };

    useEffect(() => {
        fetch_book_by_id(id);
        check_is_favorite();
        fetchReviews();

        const hash = window.location.hash;
        if (hash && hash.startsWith('#review-')) {
            const reviewId = hash.replace('#review-', '');
            // Даем время на загрузку отзывов
            setTimeout(() => scrollToReview(reviewId), 500);
        }
    }, [id]);

    return (
        <div className="min-h-screen flex w-full bg-gray-100">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            {/* Основной контент */}
            <div className="flex flex-col w-full text-gray-800 p-4 md:p-10 md:ml-[100px]">
                {/* Информация о книге */}
                <div className="flex flex-col md:flex-row w-full">
                    {/* Обложка книги */}
                    <div className="w-full md:w-1/3 md:mr-10 mb-6 md:mb-0">
                        <img
                            className="w-full h-auto md:h-[60vh] object-cover rounded-xl shadow-md mx-auto"
                            src={book?.picture}
                            alt={`Cover of ${book?.title}`}
                        />
                    </div>

                    {/* Детали книги */}
                    <div className="w-full md:w-2/3 flex flex-col">
                        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{book?.title}</h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-2">
                            {book?.author?.name} {book?.author?.lastname}
                        </p>
                        <p className="text-lg md:text-xl text-gray-500">
                            Жанр: {book?.genre?.name}
                        </p>
                        <p className="text-lg md:text-xl text-gray-500 mb-4 md:mb-5">
                            Год: {new Date(book?.year_of_publication).getFullYear()}
                        </p>
                        {/* Рейтинг книги */}
                        <div className="flex items-center mb-3">
                            <span className="text-lg md:text-xl text-gray-500 mr-2">Рейтинг:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={24}
                                    className={`${star <= book?.rating ? "text-yellow-500" : "text-gray-400"}`}
                                    onClick={() => handleRating(star)}
                                />
                            ))}
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                className="flex-1 md:flex-none bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600"
                                title="Забронировать книгу"
                                onClick={reserve_book}>
                                Забронировать
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        isFilled ? remove_from_favorites() : add_to_favorites();
                                    }}
                                    title="Добавить в избранное"
                                    className="p-2"
                                >
                                    <FiHeart
                                        size={24}
                                        className={`transition-colors duration-200 ${
                                            isFilled ? "text-transparent" : "text-red-500"
                                        }`}
                                        fill={isFilled ? "red" : "none"}
                                    />
                                </button>
                                <button
                                    className="text-gray-400 p-2 hover:text-gray-500"
                                    title="Скачать книгу"
                                    onClick={downloadBook}
                                >
                                    <FiDownload size={24} />
                                </button>
                                <Link
                                    className="text-gray-400 p-2 hover:text-gray-500"
                                    title="Читать"
                                    to={`/books/${book?.id}/read`}
                                >
                                    <FiBookOpen size={24} />
                                </Link>
                                <button
                                    className="text-gray-400 p-2 hover:text-gray-500"
                                    title="Прослушать аудиокнигу"
                                    onClick={openAudioPlayer}
                                >
                                    <AudioLinesIcon size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Описание */}
                        <div className="mt-4 md:mt-5">
                            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Описание</h2>
                            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                                {book?.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Отзывы */}
                <div className="mt-6 md:mt-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-5">Отзывы</h2>

                    {/* Форма отзыва */}
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-lg md:text-xl font-semibold mb-3">Оставьте свой отзыв</h3>
                        <textarea
                            className="w-full p-2 border rounded-md mb-3 text-sm md:text-base"
                            rows="4"
                            placeholder="Напишите свой отзыв..."
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                        ></textarea>

                        <div className="flex items-center mb-3">
                            <span className="mr-2 text-sm md:text-base">Оценка:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={20}
                                    className={`cursor-pointer ${star <= rating ? "text-yellow-500" : "text-gray-400"}`}
                                    onClick={() => handleRating(star)}
                                />
                            ))}
                        </div>

                        <button
                            className="w-full md:w-auto bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 text-sm md:text-base"
                            onClick={submitReview}
                        >
                            Отправить отзыв
                        </button>
                    </div>

                    {/* Список отзывов */}
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>

                {/* Плеер аудиокниги */}
                <AudiobookPlayer
                    bookId={id}
                    isOpen={showAudioPlayer}
                    onClose={closeAudioPlayer}
                />
            </div>
        </div>
    );
};

export default BookDetail;