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

const Home = () => {
    const [books, setBooks] = React.useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSearch, setIsSearch] = useState(false);

    const fetch_books = async () => {
        await axios.get("http://localhost:8080/books/").then(
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

    useEffect(() => {
        fetch_books()
    }, []);

    return (
        <main className="min-h-screen flex w-full">
            {/*<Header />*/}
            <div className="flex flex-col text-xl w-full font-montserrat font-bold text-white min-h-screen ml-[100px]">
                <div className="flex flex-col w-full min-h-screen flex-wrap">

                    {/*TODO add some image */}

                    <div className="flex flex-row px-10 pt-7 group cursor-pointer mt-3">
                        <p className="font-montserrat font-bold text-[2em] text-black group-hover:text-blue-600 transition-colors duration-300">Топ 3</p>
                        <div className="flex flex-row ml-10 w-10 items-center justify-center group-hover:w-20 transition-width duration-300">
                            <div className="bg-black w-full relative size-1 transition-transform duration-300"></div>
                            <div className="size-4 mt-[0.1em] ml-[-0.7em] border border-l-0 border-b-0 border-black border-r-4 border-t-4 transform rotate-45"></div>
                        </div>
                    </div>

                    <div className="flex flex-row p-10 w-full h-fit items-center justify-center gap-[5em] flex-wrap">
                        <div className="flex flex-row justify-center items-center cursor-pointer hover:transform hover:scale-105 transition-transform duration-300">
                            <p className="font-montserrat font-bold text-[12em] text-[#390C45]">1</p>
                            <img
                                className="w-full h-[14em] ml-[-1.4em] object-cover transition-opacity duration-300 rounded-xl"
                                src={"https://upload.wikimedia.org/wikipedia/commons/b/bc/%D0%A2%D0%BE%D0%BB%D1%81%D1%82%D0%BE%D0%B9_%D0%9B._%D0%9D._%D0%92%D0%BE%D0%B9%D0%BD%D0%B0_%D0%B8_%D0%BC%D0%B8%D1%80%2C_%D0%A2._1._%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%B8%D0%B7%D0%B4.1912%D0%B3%2C%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F.jpg"}
                                alt={`Cover of`}
                            />
                        </div>
                        <div className="flex flex-row justify-center items-center cursor-pointer hover:transform hover:scale-105 transition-transform duration-300">
                            <p className="font-montserrat font-bold text-[12em] text-[#0784B0]">2</p>
                            <img
                                className="w-full h-[14em] ml-[-2.2em] object-cover transition-opacity duration-300 rounded-xl"
                                src={"https://upload.wikimedia.org/wikipedia/commons/b/bc/%D0%A2%D0%BE%D0%BB%D1%81%D1%82%D0%BE%D0%B9_%D0%9B._%D0%9D._%D0%92%D0%BE%D0%B9%D0%BD%D0%B0_%D0%B8_%D0%BC%D0%B8%D1%80%2C_%D0%A2._1._%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%B8%D0%B7%D0%B4.1912%D0%B3%2C%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F.jpg"}
                                alt={`Cover of`}
                            />
                        </div>
                        <div className="flex flex-row justify-center items-center cursor-pointer hover:transform hover:scale-105 transition-transform duration-300">
                            <p className="font-montserrat font-bold text-[12em] text-[#E7D923]">3</p>
                            <img
                                className="w-full h-[14em] ml-[-2.4em] object-cover transition-opacity duration-300 rounded-xl"
                                src={"https://upload.wikimedia.org/wikipedia/commons/b/bc/%D0%A2%D0%BE%D0%BB%D1%81%D1%82%D0%BE%D0%B9_%D0%9B._%D0%9D._%D0%92%D0%BE%D0%B9%D0%BD%D0%B0_%D0%B8_%D0%BC%D0%B8%D1%80%2C_%D0%A2._1._%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%B8%D0%B7%D0%B4.1912%D0%B3%2C%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F.jpg"}
                                alt={`Cover of`}
                            />
                        </div>
                    </div>

                    <Link
                        className="flex flex-row px-10 pt-7 group cursor-pointer"
                        to="/books"
                    >
                        <p className="font-montserrat font-bold text-[2em] text-black group-hover:text-blue-600 transition-colors duration-300">Все книги</p>
                        <div className="flex flex-row ml-10 w-10 items-center justify-center group-hover:w-20 transition-width duration-300">
                            <div className="bg-black w-full relative size-1 transition-transform duration-300"></div>
                            <div className="size-4 mt-[0.1em] ml-[-0.7em] border border-l-0 border-b-0 border-black border-r-4 border-t-4 transform rotate-45"></div>
                        </div>
                    </Link>

                    <div className="flex flex-wrap p-4 w-full min-h-screen">
                        {books.sort().map(book => (
                            <BookCard key={book.id} book={book} onSelectBook={setSelectedBook} />
                        ))}
                    </div>
                </div>
            </div>


        </main>
    );
};

export default Home;
