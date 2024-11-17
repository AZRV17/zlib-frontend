import React, {useEffect} from 'react';
import {Book} from "../models/book";
import axios from "axios";
import {render} from "@testing-library/react";
import {Link} from "react-router-dom";

const BookCard = ({ book, onSelectBook }) => {

    const fetch_book = async (id) => {
        await axios.get(`http://localhost:8080/books/${id}`).then(
            response => {
                onSelectBook(book => Book.fromJson(response.data));
            }
        ).catch(err => {
            console.log(err)
        })
    }

    const handleSelect = () => {
        fetch_book(book.id)
    };

    const checkBookLength = () => {
        if (book.title.length >= 14) {
            book.title = book.title.slice(0, 14) + '...';
        }

        if (book.author.name + book.author.lastname.length >= 14) {
            book.author.name = book.author.name.slice(0, 14) + '...';
            book.author.lastname = book.author.lastname.slice(0, 14) + '...';
        }
    }

    // useEffect(() => {
    //
    // }, [book]);

    return (
        <Link
            className="w-60 h-[20.2em] bg-white rounded-lg
            shadow-md overflow-hidden border
            border-gray-200 m-2 cursor-pointer
            hover:shadow-2xl transition-shadow duration-300
            hover:bg-opacity-80 group"
            // onClick={handleSelect}
            to={`/books/${book.id}`}
        >
            {checkBookLength()}
            <div className="bg-black">
                <img
                    className="w-full h-[15em] object-cover transition-opacity duration-300 group-hover:opacity-70" // Затемнение при наведении
                    src={book.picture}
                    alt={`Cover of ${book.title}`}
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-montserrat font-medium text-gray-800 transition-colors duration-300 group-hover:text-blue-600">
                    {book.title}
                </h3>
                <p className="text-gray-500 font-montserrat font-medium text-sm mb-2">
                    {book.author.name} {book.author.lastname}
                </p>
                <p className="text-gray-500 font-montserrat font-medium text-sm mb-2">
                    {book.rating}
                </p>
            </div>
        </Link>
    );
};

export default BookCard;
