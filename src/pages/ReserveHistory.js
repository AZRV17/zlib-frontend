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
                console.log(response.data)
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
        <div className="min-h-screen flex w-full bg-gray-100">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <div className="flex flex-col w-full text-gray-800 ml-[100px] p-10">
                <h1 className="text-4xl font-bold mb-6">История бронирования</h1>

                {loading ? (
                    <p>Загрузка истории бронирования...</p>
                ) : reservarions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reservarions.map((booking) => (
                            <Link
                                key={booking.id}
                                className="p-4 bg-white rounded-lg shadow-md w-[60%] cursor-pointer hover:shadow-lg transition-shadow duration-300"
                                to={`/books/${booking.book.id}`}>
                                <img
                                    className="w-full h-[200px] object-cover rounded-md"
                                    src={booking.book.picture || "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg"}
                                    alt={`Cover of ${booking.book.title}`}
                                />
                                <div className="mt-4">
                                    <h2 className="text-2xl font-bold">{booking.book.title}</h2>
                                    <p className="text-lg text-gray-600">
                                        {booking.book.author?.name} {booking.book.author?.lastname}
                                    </p>
                                    <p className="text-md text-gray-500">
                                        Жанр: {booking.book.genre?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Дата бронирования: {new Date(booking.date_of_issue).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Дата возврата: {new Date(booking.date_of_return).toLocaleDateString()}
                                    </p>
                                    {new Date(booking.date_of_return) < new Date() && (
                                        <p className="text-sm font-bold text-red-500">Книга просрочена</p>
                                    )}
                                    {/*<p className="text-sm text-gray-500">*/}
                                    {/*    Статус: {booking.status === "reserved" ? "Забронирована" : "Возвращена"}*/}
                                    {/*</p>*/}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>У вас пока нет забронированных книг.</p>
                )}
            </div>
        </div>
    );
};

export default ReserveHistory;
