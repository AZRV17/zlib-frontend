import axios from "axios";
import { Book } from "../models/book";
import React, { useEffect, useState } from "react";
import { Range } from "react-range";
import { IoSearchOutline } from "react-icons/io5";
import { DropdownList } from "react-widgets/cjs";
import BookCard from "../components/BookCard";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useDebounce } from 'react-use';
import {api} from '../App.js'

const Books = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSearch, setIsSearch] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [authors, setAuthors] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [yearRange, setYearRange] = useState([1700, new Date().getFullYear()]);
    const [sortOption, setSortOption] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortLabel, setSortLabel] = useState('Название (А-Я)');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    useDebounce(
        () => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1);
        },
        500,
        [searchQuery]
    );

    const fetchBooks = async (page = 1) => {
        setIsLoading(true);
        try {
            let url = `${api}/books/pagination?page=${page}`;
            
            // Добавляем параметры фильтрации и сортировки
            if (debouncedSearchQuery) {
                url += `&query=${encodeURIComponent(debouncedSearchQuery)}`;
            }
            
            if (selectedAuthor && selectedAuthor.id && selectedAuthor.name !== "Все авторы") {
                url += `&author_id=${selectedAuthor.id}`;
            }
            
            if (selectedGenre && selectedGenre.id && selectedGenre.name !== "Все жанры") {
                url += `&genre_id=${selectedGenre.id}`;
            }
            
            url += `&year_start=${yearRange[0]}`;
            url += `&year_end=${yearRange[1]}`;
            url += `&sort_by=${sortOption}`;
            url += `&sort_order=${sortOrder}`;

            const response = await axios.get(url);
            const { books: booksData, totalPages: total, currentPage: current } = response.data;

            // Проверяем, что сервер возвращает корректное количество книг
            if (!Array.isArray(booksData) || booksData.length === 0) {
                setBooks([]);
                setTotalPages(1);
                setCurrentPage(1);
                return;
            }

            const processedBooks = booksData.map(bookData => {
                let book = Book.fromJson(bookData);
                if (!book.picture) {
                    book.picture = "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg";
                }
                return book;
            });

            console.log(`Получено ${processedBooks.length} книг на странице ${current} из ${total}`);

            setBooks(processedBooks);
            setTotalPages(total);
            setCurrentPage(current);
        } catch (err) {
            console.log(err);
            setBooks([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await axios.get(`${api}/genres/`);
            setGenres(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await axios.get(`${api}/authors/`);
            setAuthors(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchGenres();
        fetchAuthors();
    }, []);

    useEffect(() => {
        fetchBooks(currentPage);
    }, [currentPage, debouncedSearchQuery, selectedGenre, selectedAuthor, yearRange, sortOption, sortOrder]);

    const handlePageChange = (newPage) => {
        // Убедимся, что не переходим на пустую страницу
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (option) => {
        setSortOption(option.value);
        setSortLabel(option.label);
        setSortOrder(option.order);
    };

    const handleGenreChange = (genre) => {
        setSelectedGenre(genre);
        setCurrentPage(1);
    };

    const handleAuthorChange = (author) => {
        setSelectedAuthor(author);
        setCurrentPage(1);
    };

    const handleYearRangeChange = (values) => {
        setYearRange(values);
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pageNumbers.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pageNumbers;
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Фильтры и поиск */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-white shadow-md rounded-lg mb-8">
                    {/* Поисковая строка */}
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 shadow-sm flex-1 min-w-[250px]">
                        <button className="p-3 text-gray-500">
                            <IoSearchOutline className="w-5 h-5" />
                        </button>
                        <input
                            className="w-full p-3 text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
                            type="text"
                            placeholder="Поиск книг..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Фильтр по жанру */}
                    <div className="flex-1 min-w-[200px]">
                        <DropdownList
                            placeholder="Выберите жанр"
                            data={[{ id: null, name: "Все жанры" }, ...genres]}
                            value={selectedGenre}
                            onChange={handleGenreChange}
                            textField="name"
                            valueField="name"
                            className="h-full"
                            containerClassName="h-full"
                        />
                    </div>

                    {/* Фильтр по автору */}
                    <div className="flex-1 min-w-[200px]">
                        <DropdownList
                            placeholder="Выберите автора"
                            data={[{ id: null, name: "Все авторы", lastname: "Все авторы" }, ...authors]}
                            value={selectedAuthor}
                            onChange={handleAuthorChange}
                            textField="lastname"
                            valueField="name"
                            className="h-full"
                            containerClassName="h-full"
                        />
                    </div>

                    {/* Фильтр по году публикации */}
                    <div className="flex flex-col items-center min-w-[250px]">
                        <label className="block font-medium text-gray-700 mb-2">Год публикации</label>
                        <Range
                            step={1}
                            min={1700}
                            max={new Date().getFullYear()}
                            values={yearRange}
                            onChange={handleYearRangeChange}
                            renderTrack={({ props, children }) => (
                                <div
                                    {...props}
                                    style={{
                                        ...props.style,
                                        height: "6px",
                                        width: "100%",
                                        background: "linear-gradient(to right, #3b82f6, #d1d5db)",
                                        borderRadius: "3px",
                                    }}
                                >
                                    {children}
                                </div>
                            )}
                            renderThumb={({ props }) => (
                                <div
                                    {...props}
                                    style={{
                                        ...props.style,
                                        height: "20px",
                                        width: "20px",
                                        borderRadius: "50%",
                                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                                    }}
                                />
                            )}
                        />
                        <div className="flex justify-between w-full mt-2 text-sm text-gray-600">
                            <span>{yearRange[0]}</span>
                            <span>{yearRange[1]}</span>
                        </div>
                    </div>

                    {/* Сортировка */}
                    <div className="flex-1 min-w-[200px]">
                        <DropdownList
                            data={[
                                { label: "Название (А-Я)", value: 'title', order: 'asc' },
                                { label: "Название (Я-А)", value: 'title', order: 'desc' },
                                { label: "Рейтинг (убыв.)", value: 'rating', order: 'desc' },
                                { label: "Рейтинг (возр.)", value: 'rating', order: 'asc' },
                                { label: "Новые сначала", value: 'year', order: 'desc' },
                                { label: "Старые сначала", value: 'year', order: 'asc' }
                            ]}
                            value={{ label: sortLabel, value: sortOption, order: sortOrder }}
                            onChange={handleSortChange}
                            textField="label"
                            valueField="value"
                            placeholder="Сортировка"
                            className="h-full"
                            containerClassName="h-full"
                        />
                    </div>
                </div>

                {/* Список книг */}
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="relative w-20 h-20">
                            <div className="absolute border-4 border-gray-200 rounded-full w-full h-full"></div>
                            <div className="absolute border-4 border-blue-500 rounded-full w-full h-full animate-spin border-t-transparent"></div>
                        </div>
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map(book => (
                            <BookCard key={book.id} book={book} onSelectBook={setSelectedBook} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
                        <p className="text-xl font-medium">Книги не найдены</p>
                        <p className="mt-2 text-sm text-gray-400">Попробуйте изменить параметры поиска</p>
                    </div>
                )}

                {/* Пагинация */}
                {totalPages > 1 && !isLoading && (
                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex rounded-lg shadow bg-white">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-l-lg border-r ${
                                    currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex">
                                {getPageNumbers().map((number, index) => (
                                    <React.Fragment key={index}>
                                        {number === '...' ? (
                                            <span className="flex items-center justify-center w-10 text-gray-500">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handlePageChange(number)}
                                                className={`w-10 ${
                                                    currentPage === number
                                                        ? 'bg-blue-500 text-white'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {number}
                                            </button>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-r-lg border-l ${
                                    currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Books;