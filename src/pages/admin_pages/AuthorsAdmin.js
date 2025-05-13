import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable";
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import { Download } from 'lucide-react';
import {toast, ToastContainer} from 'react-toastify';
import {FiUpload} from "react-icons/fi";
import {api} from '../../App.js'

const AdminAuthorsPage = () => {
    const [authors, setAuthors] = useState([]);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchAuthors = async () => {
        try {
            const response = await axios.get(`${api}/authors/`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const authorsData = response.data.map(author => {
                return Author.fromJson(author)
            });

            console.log(authorsData)
            setAuthors(authorsData);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    // Delete author
    const handleDeleteAuthor = async (id) => {
        try {
            await axios.delete(`${api}/authors/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setAuthors(authors.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    // Edit author
    const handleEditAuthor = (id) => {
        navigate(`/admin/authors/edit/${id}`);
    };

    // Create new author
    const handleCreateAuthor = () => {
        navigate("/admin/authors/new");
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get(`${api}/authors/export`, {
                withCredentials: true,
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.href = url;
            link.setAttribute('download', `authors_${timestamp}.csv`);
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
            const response = await axios.post(`${api}/authors/import`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(response.data.message);
            fetchAuthors();
            setFile(null);
        } catch (error) {
            console.error("Error importing CSV:", error);
            toast.error(error.response?.data?.error || "Ошибка при импорте CSV файла");
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Имя" },
        { key: "lastname", label: "Фамилия" },
        { key: "biography", label: "Биография" },
        { key: "birthdate", label: "Дата рождения" },
        { key: "books.title", label: "Книги" }
    ];

    return (
        <div className="p-6">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Авторы</h1>

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

            {(authors.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={authors}
                    headers={columns}
                    onEdit={handleEditAuthor}
                    onDelete={handleDeleteAuthor}
                    onCreate={handleCreateAuthor}
                />
            )}
        </div>
    );
};

export default AdminAuthorsPage;