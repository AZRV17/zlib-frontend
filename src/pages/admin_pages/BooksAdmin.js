import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import {Book} from "../../models/book";

const AdminBooksPage = () => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchBooks = async () => {
        try {
            const response = await axios.get("http://localhost:8080/books/", {
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
            await axios.delete(`http://localhost:8080/books/${id}`, {
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
            <h1 className="text-2xl font-bold mb-4">Книги</h1>
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
