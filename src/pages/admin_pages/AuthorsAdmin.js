import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable";
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminAuthorsPage = () => {
    const [authors, setAuthors] = useState([]);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchAuthors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/authors/", {
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
            await axios.delete(`http://localhost:8080/authors/${id}`, {
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

    // Export authors to CSV
    const handleExportCSV = async () => {
        try {
            const response = await axios.get("http://localhost:8080/authors/export", {
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

    useEffect(() => {
        fetchAuthors();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Имя" },
        { key: "lastname", label: "Фамилия" },
        { key: "biography", label: "Биография" },
        { key: "birthdate", label: "Дата рождения" },
        { key: "books.title", label: "Книги" }
    ];

    return (
        <div className="p-6 ml-[100px]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Авторы</h1>

                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                    <Download size={20} />
                    Экспорт в CSV
                </button>
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