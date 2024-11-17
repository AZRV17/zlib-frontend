import Header from "../components/Header";
import { Book } from "../models/book";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {FaStar} from "react-icons/fa";
import {Review} from "../models/review";
import ReviewCard from "../components/ReviewCard";

const BookDetail = () => {
    const [book, setBook] = useState(null);
    const { id } = useParams();
    const [isFilled, setIsFilled] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [rating, setRating] = useState(0);

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
        await axios.get(`http://localhost:8080/books/${id}`, {
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
            const response = await axios.get(`http://localhost:8080/favorites/cookie`, {
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
            const response = await axios.post(`http://localhost:8080/books/${id}`, {}, {
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
            const response = await axios.post(`http://localhost:8080/favorites/cookie`, { "book_id": parseInt(id) }, {
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
            await axios.delete(`http://localhost:8080/favorites/cookie/${parseInt(id)}`, {
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
            const response = await axios.get(`http://localhost:8080/reviews/${id}`, {
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

    const submitReview = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/reviews/`,
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
            toast.error("Не удалось добавить отзыв.");
            console.log(err);
        }
    };

    const handleRating = (rate) => setRating(rate);

    useEffect(() => {
        fetch_book_by_id(id);
        check_is_favorite();
        fetchReviews()

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

            {/* <Header /> */}
            <div className="flex flex-col w-full text-gray-800 ml-[100px] p-10">
                <div className="flex flex-row w-full">
                    <div className="w-1/3 mr-10">
                        <img
                            className="w-auto h-[60vh] object-cover rounded-xl shadow-md"
                            src={book?.picture}
                            alt={`Cover of ${book?.title}`}
                        />
                    </div>

                    <div className="w-2/3 flex flex-col">
                        <h1 className="text-4xl font-bold mb-4">{book?.title}</h1>
                        <p className="text-2xl text-gray-600 mb-2">
                            {book?.author?.name} {book?.author?.lastname}
                        </p>
                        <p className="text-xl text-gray-500 mb-5">
                            Жанр: {book?.genre?.name}
                        </p>

                        <div className="flex flex-row space-x-4 mb-5">
                            <button
                                className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600"
                                title="Забронировать книгу"
                                onClick={reserve_book}>
                                Забронировать
                            </button>
                            <button
                                onClick={() => {
                                    isFilled ? remove_from_favorites() : add_to_favorites();
                                }}
                                title="Добавить в избранное"
                            >
                                <FiHeart
                                    size={30}
                                    className={`transition-colors duration-200 ${
                                        isFilled ? "text-transparent" : "text-red-500"
                                    }`}
                                    fill={isFilled ? "red" : "none"}
                                />
                            </button>
                        </div>

                        <div className="mt-5">
                            <h2 className="text-2xl font-bold mb-3">Описание</h2>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {book?.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Отзывы */}
                <div className="mt-10">
                    <h2 className="text-3xl font-bold mb-5">Отзывы</h2>

                    {/* Форма добавления отзыва */}
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-3">Оставьте свой отзыв</h3>
                        <textarea
                            className="w-full p-2 border rounded-md mb-3"
                            rows="4"
                            placeholder="Напишите свой отзыв..."
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                        ></textarea>

                        <div className="flex items-center mb-3">
                            <span className="mr-2">Оценка:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={24}
                                    className={`cursor-pointer ${star <= rating ? "text-yellow-500" : "text-gray-400"}`}
                                    onClick={() => handleRating(star)}
                                />
                            ))}
                        </div>

                        <button
                            className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600"
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
            </div>
        </div>
    );
};

export default BookDetail;
