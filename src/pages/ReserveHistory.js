import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {Link} from "react-router-dom";

const ReserveHistory = () => {
    const [reservarions, setReservarions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReserveHistory = async () => {
        try {
            const response = await axios.get("http://localhost:8080/reservations/cookie", {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setReservarions(response.data);
            }
        } catch (err) {
            toast.error("Не удалось загрузить историю бронирования.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReserveHistory();
    }, []);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-100">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">История бронирования</h1>

                {loading ? (
                    <div className="flex justify-center items-center">
                        <p className="text-lg text-gray-600">Загрузка истории бронирования...</p>
                    </div>
                ) : reservarions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {reservarions.map((booking) => (
                            <Link
                                key={booking.id}
                                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 w-full"
                                to={`/books/${booking.book.id}`}>
                                <div>
                                    <img
                                        className="w-full h-[360px] sm:h-[300px] object-cover rounded-t-lg"
                                        src={booking.book.picture || "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg"}
                                        alt={`Cover of ${booking.book.title}`}
                                    />
                                </div>
                                <div className="p-3">
                                    <h2 className="text-sm font-semibold text-gray-800 truncate">{booking.book.title}</h2>
                                    <p className="text-xs text-gray-700 truncate">
                                        {booking.book.author?.name} {booking.book.author?.lastname}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {booking.book.genre?.name}
                                    </p>
                                    <div className="mt-2 text-[11px] text-gray-500">
                                        <p>Бронь: {new Date(booking.date_of_issue).toLocaleDateString()}</p>
                                        <p>Возврат: {new Date(booking.date_of_return).toLocaleDateString()}</p>
                                        {new Date(booking.date_of_return) < new Date() && (
                                            <p className="text-[11px] font-medium text-red-500">Просрочена</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-center">
                        <p className="text-lg text-gray-600">У вас пока нет забронированных книг.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReserveHistory;
