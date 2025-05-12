import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import UniversalForm from '../../components/forms/UniversalForm';
import {Book} from "../../models/book";

const BookFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState({});
    const isEdit = Boolean(id);
    const [authors, setAuthors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [book, setBook] = useState({});

    useEffect(() => {
        if (isEdit) {
            fetchBook();
        }

        fetchAuthors();
        fetchGenres();
        fetchPublishers();
    }, [id]);

    const fetchBook = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/books/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setBook(Book.fromJson(response.data));

            if (book.year_of_publication) {
                const date = new Date(book.year_of_publication);
                book.year_of_publication = date.toISOString().split('T')[0];
            }

            console.log('Fetched book:', book);

            setInitialData(response.data);
        } catch (error) {
            console.error('Error fetching book:', error);
            navigate('/admin/books');
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/authors/', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setAuthors(response.data);
        } catch (error) {
            console.error('Error fetching authors:', error);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await axios.get('http://localhost:8080/genres/', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setGenres(response.data);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const fetchPublishers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/publishers/', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setPublishers(response.data);
        } catch (error) {
            console.error('Error fetching publishers:', error);
        }
    };

    const fields = [
        {
            key: 'title',
            label: 'Название',
            required: true
        },
        {
            key: 'author',
            label: 'Автор',
            required: true,
            type: "select",
            options: authors,
            optionsLabel: 'lastname',
        },
        {
            key: 'year_of_publication',
            label: 'Год публикации',
            type: 'date',
            required: true
        },
        {
            key: 'description',
            label: 'Описание',
            type: 'textarea',
            required: true
        },
        {
            key: 'picture',  // Changed from 'image' to 'picture' to match backend
            label: 'Изображение',
            type: 'file',
            accept: 'image/*', // Add accept attribute for images only
            required: !isEdit  // Required only for new books
        },
        {
            key: 'epub',
            label: 'EPUB',
            type: 'file',
            accept: '.epub',
            required: !isEdit
        },
        {
            key: 'genre',
            label: 'Жанр',
            type: "select",
            required: true,
            options: genres,
            optionsLabel: 'name'
        },
        {
            key: 'publisher',
            label: 'Издательство',
            type: "select",
            required: true,
            options: publishers,
            optionsLabel: 'name'
        },
        {
            key: 'isbn',
            label: 'ISBN',
            type: 'text',
            required: true
        }
    ];

    const handleEditAudioBook = () => {
        navigate(`/admin/books/audio/edit/${id}`);
    };

    const handleSubmit = async (formData) => {
        try {
            // Create FormData object
            const form = new FormData();

            // Add all text fields
            form.append('title', formData.title);
            form.append('description', formData.description);
            form.append('isbn', formData.isbn);
            form.append('year_of_publication', new Date(formData.year_of_publication).toISOString());

            // Add IDs from select fields - Note the change from 'author' to 'author_id' to match backend
            form.append('author', formData.author.id);
            form.append('genre', formData.genre.id);
            form.append('publisher', formData.publisher.id);

            // Debug logging to check file
            console.log('File being uploaded:', formData.picture);

            // Check if there's a file and it's a File object
            if (formData.picture instanceof File) {
                console.log('Appending file to form data');
                form.append('picture', formData.picture, formData.picture.name);
            } else {
                console.log('No file or invalid file object:', formData.picture);
            }

            if (formData.epub instanceof File) {
                console.log('Appending file to form data');
                form.append('epub', formData.epub, formData.epub.name);
            } else {
                console.log('No file or invalid file object:', formData.epub);
            }

            // Log the form data for debugging
            for (let pair of form.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // Add ID for edit mode
            if (isEdit) {
                form.append('id', id);
            }

            const config = {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (isEdit) {
                await axios.put(`http://localhost:8080/books/${id}`, form, config);
            } else {
                await axios.post('http://localhost:8080/books/', form, config);
            }

            navigate('/admin/books');
        } catch (error) {
            console.error('Error saving book:', error);
            console.error('Error response:', error.response?.data);
        }
    };

    const handleCancel = () => {
        navigate('/admin/books');
    };

    return (
        <div className="p-6 lg:ml-[100px] min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-8 text-gray-800">
                    {isEdit ? 'Редактировать книгу' : 'Добавить книгу'}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Превью изображения */}
                    {book.picture && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-700">Текущая обложка:</h3>
                            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
                                <img
                                    src={book.picture}
                                    alt="Обложка книги"
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                                />
                            </div>
                        </div>
                    )}

                    {/* Форма */}
                    <div className={`${initialData.picture ? 'md:col-span-1' : 'md:col-span-2'}`}>
                        <UniversalForm
                            initialData={initialData}
                            fields={fields}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isEdit={isEdit}
                        />
                    </div>
                </div>

                {isEdit && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleEditAudioBook}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Редактировать аудиофайлы
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookFormPage;