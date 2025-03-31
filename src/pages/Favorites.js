import React, { useEffect, useState } from 'react';
import Header from "../components/Header";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import {AiFillHeart} from "react-icons/ai";
import {FiHeart} from "react-icons/fi";

const FavoriteBooks = () => {
    const [favorite, setFavorite] = useState([]);
    const navigate = useNavigate();

    // Fetch favorite books
    const fetchFavoriteBooks = async () => {
        try {
            const response = await axios.get('http://localhost:8080/favorites/cookie', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // console.log(response)

            response.data.map(book => {
                if (book.book.picture === null || book.book.picture === "") {
                    book.book.picture = "https://img.freepik.com/premium-vector/blank-cover-book-magazine-template_212889-605.jpg";
                }
            })

            setFavorite(response.data);
        } catch (error) {
            console.log("Error fetching favorite books:", error);
        }
    };

    const removeFromFavorites = async (bookId) => {
        try {
            await axios.delete(`http://localhost:8080/favorites/cookie/${bookId}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            fetchFavoriteBooks(); // Re-fetch the favorite books after deletion
        } catch (error) {
            console.log("Error removing favorite book:", error);
        }
    };

    useEffect(() => {
        fetchFavoriteBooks();
    }, []);

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50">
            {/*<Header />*/}
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-screen-xl">
                <h2 className="text-2xl font-bold mb-4">Избранные книги</h2>
                {favorite.length === 0 ? (
                    <p className="text-gray-600">У вас нет избранных книг.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {favorite.map((f) => (
                            <div
                                key={f.book.id}
                                className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/books/${f.book.id}`)} // Clicking the block opens the book page
                            >
                                <div className="relative">
                                    <img
                                        src={f.book.picture}
                                        alt={f.book.title}
                                        className="w-full h-[350px] sm:h-[350px] object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <FiHeart
                                            size={30}
                                            className="transition-transform text-transparent
                                             hover:scale-110 hover:transform duration-200 cursor-pointer"
                                            fill={"red"}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent navigation when clicking "Remove"
                                                removeFromFavorites(f.book.id);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-semibold text-gray-800 truncate">{f.book.title}</h3>
                                    <p className="text-xs text-gray-600 truncate">
                                        {f.book.author.name} {f.book.author.lastname}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteBooks;
