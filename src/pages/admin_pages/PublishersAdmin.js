import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import {Book} from "../../models/book";
import {Genre} from "../../models/genre";
import {Publisher} from "../../models/publisher";
import {toast, ToastContainer} from "react-toastify";
import {Download} from "lucide-react";
import {FiUpload} from "react-icons/fi";

const AdminPublishersPage = () => {
    const [publishers, setPublishers] = useState([]);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchPublishers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/publishers/", {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const publishersData = response.data.map(publisher => {

                return Publisher.fromJson(publisher)
            });

            setPublishers(publishersData);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    // Delete author
    const handleDeleteGenre = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/publishers/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setPublishers(publishers.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    // Edit author
    const handleEditGenre = (id) => {
        navigate(`/admin/publishers/edit/${id}`);
    };

    // Create new author
    const handleCreateGenre = () => {
        navigate("/admin/publishers/new");
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get("http://localhost:8080/publishers/export", {
                withCredentials: true,
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.href = url;
            link.setAttribute('download', `publushers_${timestamp}.csv`);
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

    const handleFileChange = (e) => {
        toast.info("Файл выбран");
        setFile(e.target.files[0]);
    };

    const handleImportCSV = async () => {
        if (!file) {
            toast.error("Пожалуйста, выберите CSV файл");
            return;
        }

        const formData = new FormData();
        formData.append("csv", file);

        try {
            const response = await axios.post("http://localhost:8080/publishers/import", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(response.data.message);
            fetchPublishers();
            setFile(null);
        } catch (error) {
            console.error("Error importing CSV:", error);
            toast.error(error.response?.data?.error || "Ошибка при импорте CSV файла");
        }
    };

    useEffect(() => {
        fetchPublishers();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Название" },
    ];

    return (
        <div className="p-6">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Издательства</h1>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        <Download size={20} />
                        Экспорт в CSV
                    </button>

                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-upload"
                    />
                    <label
                        htmlFor="csv-upload"
                        className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        <FiUpload size={20} className="inline-block mr-2" />
                        Выбрать CSV
                    </label>
                    <button
                        onClick={handleImportCSV}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        Импортировать
                    </button>
                </div>
            </div>
            {(publishers.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={publishers}
                    headers={columns}
                    onEdit={handleEditGenre}
                    onDelete={handleDeleteGenre}
                    onCreate={handleCreateGenre}
                />
            )}
        </div>
    );
};

export default AdminPublishersPage;
