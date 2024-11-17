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

    // Enhanced Pagination Component
    const Pagination = () => {
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
        <main className="min-h-screen flex w-full">
            <div className="flex flex-col text-xl w-full font-montserrat font-bold text-white min-h-screen ml-[100px]">
                <div className="flex flex-col w-full min-h-screen flex-wrap">
                    {/* Filter and Sort header */}
                    <div className="flex flex-row w-full prN-10 pt-7 items-center space-x-6">
                        {/* Search Bar */}
                        <div className={`flex flex-row h-[50px] ${isSearch ? 'w-[90%]' : 'w-[40%]'} p-1 px-6 duration-300`}>
                            <button
                                className="bg-[#F4F4F4] text-gray-800 font-bold py-2 px-4 rounded-l-xl"
                                type="submit"
                            >
                                <IoSearchOutline />
                            </button>
                            <input
                                className="bg-[#F4F4F4] w-[80%] h-full text-black font-light rounded-r-xl focus:outline-none p-2"
                                onFocus={() => setIsSearch(true)}
                                onBlur={() => setIsSearch(false)}
                                type="text"
                                placeholder="Поиск"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>

                        {/* Genre Filter */}
                        <div className="flex flex-row h-[50px] w-[20%] text-gray-800 text-lg p-1 px-6">
                            <DropdownList
                                placeholder="Выберите жанр"
                                data={[...genres, {name: "Все жанры"}]}
                                value={selectedGenre}
                                onChange={setSelectedGenre}
                                textField="name"
                                valueField="name"
                                onFocus={() => setIsSearch(false)}
                            />
                        </div>

                        {/* Sort Option */}
                        <div className="flex flex-row h-[50px] w-[20%] text-gray-800 text-lg p-1 cursor-pointer px-6">
                            <DropdownList
                                data={[
                                    { label: "Название", value: 'title' },
                                    { label: "Рейтинг", value: 'rating' }
                                ]}
                                value={{ label: sortLabel, value: sortOption }}
                                onChange={handleSortChange}
                                textField="label"
                                valueField="value"
                                placeholder="Сортировать по"
                                onKeyPress={(e) => e.preventDefault()}
                                dropUp={false}
                                tabIndex={-1}
                            />
                        </div>
                    </div>

                    {/* Books list with loading state */}
                    <div className="flex flex-wrap p-4 w-full min-h-screen">
                        {isLoading ? (
                            <div className="w-full h-[50vh] flex justify-center items-center">
                                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                            </div>
                        ) : sortedBooks.length > 0 ? (
                            sortedBooks.map(book => (
                                <BookCard key={book.id} book={book} onSelectBook={setSelectedBook} />
                            ))
                        ) : (
                            <div className="w-full h-[50vh] flex justify-center items-center text-gray-500 text-xl">
                                Книги не найдены
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && !isLoading && (
                        <div className="w-full flex justify-center pb-8">
                            <Pagination />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Books;