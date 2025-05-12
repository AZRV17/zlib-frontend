import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import UniversalForm from '../../components/forms/UniversalForm';
import {data} from "autoprefixer";

const UniqueCodeFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [initialData, setInitialData] = useState({});
    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            fetchUniqueCodes();
        }
        fetchBooks();
    }, []);

    const fetchUniqueCodes = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/unique-codes/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setInitialData(response.data);
        } catch (error) {
            console.error('Error fetching author:', error);
            navigate('/admin/unique-codes');
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://localhost:8080/books/', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setBooks(response.data);
            console.log(books)
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const fields = [
        {
            key: 'code',
            label: 'Код',
            type: 'text',
            required: true
        },
        {
            key: 'book',
            label: 'Книга',
            type: 'select',
            required: true,
            options: books,
            optionsLabel: 'title'
        },
        {
            key: 'is_available',
            label: 'Доступен',
            type: 'checkbox',
        }
    ];

    const handleSubmit = async (formData) => {
        try {
            const dataToSend = {...formData, book: parseInt(formData.book.id), code: parseInt(formData.code)};

            if (isEdit) {
                await axios.put(`http://localhost:8080/unique-codes/${id}`, dataToSend, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.post('http://localhost:8080/unique-codes/', dataToSend, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            navigate('/admin/unique-codes');
        } catch (error) {
            console.error('Error saving author:', error);
        }
    };

    const handleCancel = () => {
        navigate('/admin/unique-codes');
    };

    return (
        <div className="p-6 ml-[100px]">
            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? 'Редактировать код' : 'Добавить код'}
            </h1>
            <UniversalForm
                initialData={initialData}
                fields={fields}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEdit={isEdit}
            />
        </div>
    );
};

export default UniqueCodeFormPage;