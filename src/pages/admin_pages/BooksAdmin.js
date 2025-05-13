import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable";
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import {Book} from "../../models/book";
import {Download} from "lucide-react";
import {ToastContainer, toast} from "react-toastify";
import {FiUpload} from "react-icons/fi";
import {api} from '../../App.js'

const AdminBooksPage = () => {
    const [books, setBooks] = useState([]);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchBooks = async () => {
        try {
            const response = await axios.get(`${api}/books/`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const booksData = response.data.map(book => {
                return Book.fromJson(book)
            });

            console.log(booksData)

            setBooks(booksData);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    // Delete author
    const handleDeleteBook = async (id) => {
        try {
            await axios.delete(`${api}/books/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setBooks(books.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    // Edit author
    const handleEditBook = (id) => {
        navigate(`/admin/books/edit/${id}`);
    };

    // Create new author
    const handleCreateBook = () => {
        navigate("/admin/books/new");
    };

    const handleExportCSV = async () => {
        try {
            const response = await axios.get(`${api}/books/export`, {
                withCredentials: true,
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.href = url;
            link.setAttribute('download', `books_${timestamp}.csv`);
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
            const response = await axios.post(`${api}/books/import`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(response.data.message);
            fetchBooks();
            setFile(null);
        } catch (error) {
            console.error("Error importing CSV:", error);
            toast.error(error.response?.data?.error || "Ошибка при импорте CSV файла");
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Название" },
        { key: "description", label: "Описание" },
        { key: "author.name", label: "Автор" },
        { key: "genre.name", label: "Жанр" },
        { key: "publisher.name", label: "Издательство" },
        { key: "rating", label: "Рейтинг" },
        { key: "isbn", label: "ISBN" },
        { key: "unique_codes.code.col", label: "Уникальные коды" },
        { key: "picture", label: "Обложка" },
        { key: "year_of_publication", label: "Год публикации" },
    ];

    return (
        <div className="p-6">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Книги</h1>
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

            {(books.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={books}
                    headers={columns}
                    onEdit={handleEditBook}
                    onDelete={handleDeleteBook}
                    onCreate={handleCreateBook}
                />
            )}
        </div>
    );
};

export default AdminBooksPage;
