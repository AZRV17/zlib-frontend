import axios from "axios";
import { Book } from "../models/book";
import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { DropdownList } from "react-widgets/cjs";
import BookCard from "../components/BookCard";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useDebounce } from 'react-use';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSearch, setIsSearch] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [sortOption, setSortOption] = useState('title');
    const [sortLabel, setSortLabel] = useState('Название');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search query
    useDebounce(
        () => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); // Reset to first page on new search
        },
        500, // 500ms delay
        [searchQuery]
    );

    // Fetch books with pagination and search
    const fetchBooks = async (page, searchTerm = '') => {
        setIsLoading(true);
        try {
            let url = `http://localhost:8080/books/pagination?page=${page}`;
            if (searchTerm) {
                url += `&title=${encodeURIComponent(searchTerm)}`;
            }

            const response = await axios.get(url);
            const { books: booksData, totalPages: total, currentPage: current } = response.data;

            const processedBooks = booksData.map(bookData => {
                let book = Book.fromJson(bookData);
                if (!book.picture) {
                    book.picture = "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg";
                }

                console.log(book.picture)

                return book;
            });

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
            const response = await axios.get("http://localhost:8080/genres/");
            setGenres(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchBooks(currentPage, debouncedSearchQuery);
    }, [currentPage, debouncedSearchQuery]);

    useEffect(() => {
        fetchGenres();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredBooks = books.filter(book => {
        const matchesGenre = selectedGenre && selectedGenre.name !== "Все жанры"
            ? book.genre.name === selectedGenre.name
            : true;
        return matchesGenre;
    });

    const sortedBooks = filteredBooks.sort((a, b) => {
        if (sortOption === 'title') {
            return a.title.localeCompare(b.title);
        } else if (sortOption === 'rating') {
            return b.rating - a.rating;
        }
        return 0;
    });

    const handleSortChange = (option) => {
        setSortOption(option.value);
        setSortLabel(option.label);
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

    // Enhanced Pagination Component
    const Pagination = () => {

        const renderPageButton = (number) => {
            if (number === '...') {
                return (
                    <div className="flex items-center justify-center w-10 h-10 text-gray-600">
                        <MoreHorizontal size={20} />
                    </div>
                );
            }

            return (
                <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 
                        ${currentPage === number
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    {number}
                </button>
            );
        };

        return (
            <div className="flex items-center justify-center space-x-2 bg-white p-4 rounded-xl shadow-sm">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200
                        ${currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex space-x-1">
                    {getPageNumbers().map((number, index) => (
                        <React.Fragment key={index}>
                            {renderPageButton(number)}
                        </React.Fragment>
                    ))}
                </div>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200
                        ${currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Фильтры и поиск */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Поисковая строка */}
                    <div className="w-full md:w-1/2 lg:w-2/5">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
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
                    </div>

                    {/* Фильтры */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-1/2 lg:w-3/5">
                        <div className="flex-1">
                            <DropdownList
                                placeholder="Выберите жанр"
                                data={[{ name: "Все жанры" }, ...genres]}
                                value={selectedGenre}
                                onChange={setSelectedGenre}
                                textField="name"
                                valueField="name"
                                className="h-full"
                                containerClassName="h-full"
                            />
                        </div>
                        <div className="flex-1">
                            <DropdownList
                                data={[
                                    { label: "Название", value: 'title' },
                                    { label: "Рейтинг", value: 'rating' }
                                ]}
                                value={{ label: sortLabel, value: sortOption }}
                                onChange={handleSortChange}
                                textField="label"
                                valueField="value"
                                placeholder="Сортировка"
                                className="h-full"
                                containerClassName="h-full"
                            />
                        </div>
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
                ) : sortedBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedBooks.map(book => (
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