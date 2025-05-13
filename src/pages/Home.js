// src/Home.js
import React, {useEffect, useState} from 'react';
import Header from '../components/Header';
import { IoSearchOutline } from "react-icons/io5";
import BookCard from "../components/BookCard";
import {Book} from "../models/book";
import axios from "axios";
import { Combobox } from 'react-widgets';
import 'react-widgets/styles.css';
import {Link} from "react-router-dom";
import {Author} from "../models/author";
import {FiArrowDown} from "react-icons/fi";
import {api} from '../App.js'

const Home = () => {
    const [books, setBooks] = React.useState([]);
    const [authors, setAuthors] = React.useState([]);
    const [genres, setGenres] = React.useState([]);
    const [showScrollButton, setShowScrollButton] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);

    const fetch_books = async () => {
        await axios.get(`${api}/books/`).then(
            response => {
                setBooks(books => []);
                for (let i = 0; i < response.data.length; i++) {
                    let book = Book.fromJson(response.data[i]);

                    if (book.picture === null || book.picture === "") {
                        book.picture = "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg"
                        console.log(book.picture)
                    }
                    setBooks(books => [...books, book]);
                }
            }
        ).catch(err => {
            console.log(err)
        })
    }

    const fetch_authors = async () => {
        await axios.get(`${api}/authors/`).then(
            response => {
                setAuthors(authors => []);
                for (let i = 0; i < response.data.length; i++) {
                    let author = Author.fromJson(response.data[i]);
                    setAuthors(authors => [...authors, author]);
                }
            }
        ).catch(err => {
            console.log(err)
        })
    }

    const fetch_genres = async () => {
        await axios.get(`${api}/genres/`).then(
            response => {
                setGenres(genres => []);
                for (let i = 0; i < response.data.length; i++) {
                    setGenres(genres => [...genres, response.data[i]]);
                }
            }
        ).catch(err => {
            console.log(err)
        })
    }

    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        fetch_books()
        fetch_authors()
        fetch_genres()

        const handleScroll = () => {
            setShowScrollButton(window.scrollY < 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section className="py-16 md:py-24 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                        <span className="text-blue-600">Z</span>Lib
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Ваша персональная библиотека для чтения и открытия новых историй
                    </p>
                    <div className="flex justify-center">
                        <Link
                            to="/books"
                            className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-300"
                        >
                            Начать читать
                        </Link>
                    </div>
                </section>

                {/* Статистика */}
                <section className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-b border-gray-200">
                    <div className="text-center">
                        <span className="block text-3xl md:text-4xl font-bold text-blue-600">{books.length}</span>
                        <span className="text-gray-600">Книг</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-3xl md:text-4xl font-bold text-blue-600">24/7</span>
                        <span className="text-gray-600">Доступ</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-3xl md:text-4xl font-bold text-blue-600">{authors.length}+</span>
                        <span className="text-gray-600">Авторов</span>
                    </div>
                    <div className="text-center">
                        <span className="block text-3xl md:text-4xl font-bold text-blue-600">{genres.length}+</span>
                        <span className="text-gray-600">Жанров</span>
                    </div>
                </section>

                {/* Кнопка прокрутки */}
                {showScrollButton && (
                    <button
                        onClick={scrollToContent}
                        className="fixed bottom-8 left-[50%] -translate-x-[50%] bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 animate-bounce z-50 group hidden md:block"
                        aria-label="Прокрутить вниз"
                    >
                        <FiArrowDown className="w-6 h-6" />
                    </button>
                )}

                {/* Hero секция с топ-3 */}
                <section className="py-12 mt-12">
                    <div className="flex items-center mb-8 group">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            Топ популярных книг
                        </h2>
                        <div className="flex flex-row ml-10 w-10 items-center justify-center group-hover:w-20 transition-width duration-300">
                            <div className="bg-black w-full relative size-1 transition-transform duration-300"></div>
                            <div className="size-4 mt-[0.1em] ml-[-0.8em] border border-l-0 border-b-0 border-black border-r-4 border-t-4 transform rotate-45"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[0, 1, 2].map((index) => (
                            <Link
                                key={index}
                                to={books[index] ? `/books/${books[index].id}` : '#'}
                                className="relative group"
                            >
                                <div className="relative overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105">
                                    <div className={`absolute inset-0 ${
                                        index === 0 ? 'bg-purple-600'
                                            : index === 1 ? 'bg-blue-500'
                                                : 'bg-yellow-500'
                                    } opacity-65 z-10`} />

                                    <img
                                        className="w-full h-[400px] object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        src={books[index]?.picture || "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg"}
                                        alt={books[index]?.title || "Книга"}
                                    />

                                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-white">
                                    <span className={`text-8xl md:text-9xl font-bold ${
                                        index === 0 ? 'text-purple-100'
                                            : index === 1 ? 'text-blue-100'
                                                : 'text-yellow-100'
                                    } opacity-80`}>
                                        {index + 1}
                                    </span>
                                        <h3 className="text-xl md:text-2xl font-bold mb-2">
                                            {books[index]?.title || "Загрузка..."}
                                        </h3>
                                        <p className="text-sm md:text-base opacity-75">
                                            {books[index]?.author?.name || ""} {books[index]?.author?.lastname || ""}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Секция всех книг */}
                <section className="py-12">
                    <Link
                        className="flex flex-row px-10 group cursor-pointer"
                        to="/books"
                    >
                        <p className="font-montserrat font-bold text-[2em] text-black group-hover:text-blue-600 transition-colors duration-300">Все книги</p>
                        <div className="flex flex-row ml-10 w-10 items-center justify-center group-hover:w-20 transition-width duration-300">
                            <div className="bg-black w-full relative size-1 transition-transform duration-300"></div>
                            <div className="size-4 mt-[0.1em] ml-[-0.8em] border border-l-0 border-b-0 border-black border-r-4 border-t-4 transform rotate-45"></div>
                        </div>
                    </Link>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map(book => (
                            <BookCard
                                key={book.id}
                                book={book}
                                onSelectBook={() => setSelectedBook(book)} // Исправлено
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Home;
