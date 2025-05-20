import React, { useState, useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';
import axios from 'axios';
import EpubReader from '../components/EpubReader';
import { toast } from 'react-toastify';
import { Book } from "epubjs";
import {FiCrosshair, FiMoon, FiSun, FiX} from "react-icons/fi";
import {api} from '../App.js'

const ReadPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    useEffect(() => {
        let currentBook = null;

        const fetchEpub = async () => {
            try {
                const response = await axios.get(`${api}/books/${id}/download`, {
                    withCredentials: true,
                    responseType: 'blob'
                });

                if (response.status === 200) {
                    const arrayBuffer = await response.data.arrayBuffer();
                    currentBook = new Book(arrayBuffer, { openAs: 'binary' });
                    await currentBook.ready;
                    setBook(currentBook);
                }
            } catch (error) {
                console.error('Error fetching EPUB:', error);
                toast.error("Не удалось загрузить книгу");
            } finally {
                setLoading(false);
            }
        };

        fetchEpub();

        return () => {
            if (currentBook) {
                try {
                    currentBook.destroy();
                } catch (e) {
                    console.error('Error destroying book:', e);
                }
            }
        };
    }, [id]);

    const [bookDetails, setBookDetails] = useState(null);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await axios.get(`${api}/books/${id}`, {
                    withCredentials: true
                });
                setBookDetails(response.data);
            } catch (error) {
                console.error('Error fetching book details:', error);
            }
        };

        fetchBookDetails();
    }, [id]);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');

        toast.info("Применение темы...", { autoClose: 1000 });

        window.location.reload();
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
                <div className="text-xl">Загрузка книги...</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-black'}`}>
            <div className="container mx-auto h-full px-10 py-6">
                {bookDetails && (
                    <div className="flex flex-row mb-5 justify-between items-center">
                        <h1 className="text-2xl font-bold">
                            {bookDetails.title}
                        </h1>
                        <div className="flex flex-row items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full duration-200 ${isDarkMode ? 'text-yellow-300 hover:text-yellow-100' : 'text-gray-700 hover:text-gray-500'}`}
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
                            </button>
                            <Link to={`/books/${id}`} className={`flex items-center justify-center ${isDarkMode ? "hover:text-white" : "hover:text-black"} text-[#737373] transition-colors duration-200`}>
                                <FiX size={30}  />
                            </Link>
                        </div>
                    </div>
                )}
                {book ? (
                    <div className={`border rounded-lg shadow-lg p-4 ${isDarkMode ? 'bg-gray-950 border-gray-800 shadow-gray-900' : 'bg-white border-gray-200'}`}>
                        <EpubReader book={book} isDarkMode={isDarkMode} bookId={id} />
                    </div>
                ) : (
                    <div className="text-center text-red-600">
                        Электронный формат данной книги недоступен
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadPage;