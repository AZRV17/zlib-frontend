import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import {Reservation, reservation} from "../../models/reservation";
import {Link, useNavigate} from "react-router-dom";
import {ChevronDown, Download} from "lucide-react";
import {toast} from "react-toastify";

const AdminReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState("")
    const [selectedReservation, setSelectedReservation] = useState(null);

    const options = [
        {
            value: "reserved",
            label: "Забронированно"
        },
        {
            value: "taken",
            label: "Взято"
        },
        {
            value: "returned",
            label: "Возвращено"
        }
    ]

    // Fetch reservations data
    const fetchReservations = async () => {
        try {
            const response = await axios.get("http://localhost:8080/reservations/", {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const reservationsData = response.data.map(reservation => {

                return Reservation.fromJson(reservation)
            });

            setReservations(reservationsData);
        } catch (error) {
            console.error("Error fetching reservations:", error);
        }
    };

    // Delete reservation
    const handleDeleteReservation = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/reservations/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setReservations(reservations.filter(reservation => reservation.id !== id));
        } catch (error) {
            console.error("Error deleting reservation:", error);
        }
    };

    const confirmEdit = async () => {
        try {
            await axios.patch(`http://localhost:8080/reservations/${editId}`, {"status": status}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            toast.success("Статус изменен");

            fetchReservations();
        } catch (error) {
            console.error("Error editing reservation:", error);
            toast.error("Не удалось изменить статус брони");
        }
        setIsEdit(false)
    }

    const fetchReservation = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/reservations/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(response.data)

            const reservation = Reservation.fromJson(response.data);
            setSelectedReservation(reservation);
            setStatus(reservation.status);
        } catch (error) {
            console.error("Error fetching reservation:", error);
        }
    };

    // Edit reservation
    const handleEditReservation = (id) => {
        // navigate(`/admin/reservations/edit/${id}`);
        setEditId(id)
        fetchReservation(id).then(r => {
            setIsEdit(true)
        })
    };

    // Create new reservation
    const handleCreateReservation = () => {
        // navigate("/admin/reservations/new");
        setIsEdit(true);
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get("http://localhost:8080/reservations/export", {
                withCredentials: true,
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.href = url;
            link.setAttribute('download', `reservations_${timestamp}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('CSV файл успешно скачан');
        } catch (error) {
            console.error("Error exporting CSV:", error);
            toast.error('Ошибка при экспорте CSV файла');
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        { key: "user.login", label: "Пользователь" },
        { key: "book.title", label: "Книга" },
        { key: "unique_code.code", label: "Код" },
        { key: "status", label: "Статус" },
        { key: "date_of_issue", label: "Дата бронирования" },
        { key: "date_of_return.", label: "Дата возврата" },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Бронирования</h1>

                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                    <Download size={20} />
                    Экспорт в CSV
                </button>
            </div>
            {(reservations.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={reservations}
                    headers={columns}
                    onEdit={handleEditReservation}
                    onDelete={handleDeleteReservation}
                    onCreate={handleCreateReservation}
                    isReservation={true}
                />
            )}

            {isEdit && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black bg-opacity-50">
                    {/* Модальное окно */}
                    <div className="relative bg-white p-6 rounded-lg shadow-lg z-50">
                        <h2 className="text-xl font-bold mb-4">Выберите статус</h2>
                        <div className="relative">
                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className={`w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between border-gray-300`}
                            >
                                <span className={`${!status ? 'text-gray-500' : ''}`}>
                                    {status ? options.find(opt => opt.value === status)?.label : 'Выберите из списка...'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {options.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                                                status === option.value ? 'bg-blue-50' : ''
                                            }`}
                                            onClick={() => {
                                                setStatus(option.value);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between mt-5 space-x-4">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-150"
                                onClick={confirmEdit}
                            >
                                Изменить
                            </button>
                            <button
                                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-150"
                                onClick={() => setIsEdit(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReservationsPage;
