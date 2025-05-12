import axios from "axios";
import { Book } from "../models/book";
import React, { useEffect, useState } from "react";
import { Range } from "react-range";
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
    const [authors, setAuthors] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
    const [sortOption, setSortOption] = useState('title');
    const [sortLabel, setSortLabel] = useState('Название');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);

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

    const fetchBooks = async (page, searchTerm = '') => {
        setIsLoading(true);
        try {
            let url = `http://localhost:8080/books/pagination?page=${page}`;
            if (searchTerm) {
                url += `&query=${encodeURIComponent(searchTerm)}`;
            }

            const response = await axios.get(url);
            const { books: booksData, totalPages: total, currentPage: current } = response.data;

            const processedBooks = booksData.map(bookData => {
                let book = Book.fromJson(bookData);
                if (!book.picture) {
                    book.picture = "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg";
                }
                return book;
            });

            setBooks(processedBooks);
            setFilteredBooks(processedBooks); // Добавьте эту строку
            setTotalPages(total);
            setCurrentPage(current);
        } catch (err) {
            console.log(err);
            setBooks([]);
            setFilteredBooks([]); // И эту тоже
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

    const fetchAuthors = async () => {
        try {
            const response = await axios.get("http://localhost:8080/authors/");
            setAuthors(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, [books, selectedGenre, selectedAuthor, yearRange]);

    useEffect(() => {
        fetchBooks(currentPage, debouncedSearchQuery);
    }, [currentPage, debouncedSearchQuery]);

    useEffect(() => {
        fetchGenres();
    }, []);

    useEffect(() => {
        if (books.length > 0) {
            const filtered = books.filter(book => {
                // Извлекаем год из даты
                const year = new Date(book.year_of_publication).getFullYear();
                const minYear = yearRange[0];
                const maxYear = yearRange[1];

                console.log(`Книга: ${book.title}, Извлеченный год: ${year}`);

                const matchesGenre = !selectedGenre || selectedGenre.name === "Все жанры" || book.genre?.name === selectedGenre.name;
                const matchesAuthor = !selectedAuthor || selectedAuthor.name === "Все авторы" || book.author?.name === selectedAuthor.name;
                const matchesYear = year >= minYear && year <= maxYear;

                return matchesGenre && matchesAuthor && matchesYear;
            });

            const sorted = [...filtered].sort((a, b) => {
                switch (sortOption) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'rating':
                        return b.rating - a.rating;
                    case 'publicationDate':
                    case 'publicationYear':
                        return new Date(b.year_of_publication).getFullYear() - new Date(a.year_of_publication).getFullYear();
                    case 'author':
                        return a.author?.name.localeCompare(b.author?.name);
                    default:
                        return 0;
                }
            });

            setFilteredBooks(sorted);
        }
    }, [books, selectedGenre, selectedAuthor, yearRange, sortOption]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // const filteredBooks = books.filter(book => {
    //     const matchesGenre = !selectedGenre || selectedGenre.name === "Все жанры" || book.genre?.name === selectedGenre.name;
    //     const matchesAuthor = !selectedAuthor || selectedAuthor.name === "Все авторы" || book.author?.name === selectedAuthor.name;
    //     const matchesYear = !book.publicationYear || (book.publicationYear >= yearRange[0] && book.publicationYear <= yearRange[1]);
    //
    //     return matchesGenre && matchesAuthor && matchesYear;
    // });

    // const sortedBooks = filteredBooks.sort((a, b) => {
    //     if (sortOption === 'title') {
    //         return a.title.localeCompare(b.title);
    //     } else if (sortOption === 'rating') {
    //         return b.rating - a.rating;
    //     } else if (sortOption === 'publicationDate') {
    //         return new Date(b.publicationDate) - new Date(a.publicationDate);
    //     } else if (sortOption === 'author') {
    //         return a.author.localeCompare(b.author);
    //     } else if (sortOption === 'publicationYear') {
    //         return a.publicationYear - b.publicationYear;
    //     }
    //     return 0;
    // });

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
                            data={[{ name: "Все жанры" }, ...genres]}
                            value={selectedGenre}
                            onChange={setSelectedGenre}
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
                            data={[{ name: "Все авторы", lastname: "Все авторы" }, ...authors]}
                            value={selectedAuthor}
                            onChange={setSelectedAuthor}
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
                            min={1900}
                            max={new Date().getFullYear()}
                            values={yearRange}
                            onChange={(values) => {
                                setYearRange(values)
                            }}
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
                                { label: "Название", value: 'title' },
                                { label: "Рейтинг", value: 'rating' },
                                { label: "Дата публикации", value: 'publicationDate' }
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

                {/* Список книг */}
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="relative w-20 h-20">
                            <div className="absolute border-4 border-gray-200 rounded-full w-full h-full"></div>
                            <div className="absolute border-4 border-blue-500 rounded-full w-full h-full animate-spin border-t-transparent"></div>
                        </div>
                    </div>
                ) : filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.map(book => (
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