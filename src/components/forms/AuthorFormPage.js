import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import UniversalForm from '../../components/forms/UniversalForm';
import {data} from "autoprefixer";

const AuthorFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState({});
    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            fetchAuthor();
        }
    }, [id]);

    const fetchAuthor = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/authors/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const author = response.data;
            if (author.birthdate) {
                const date = new Date(author.birthdate);
                author.birthdate = date.toISOString().split('T')[0]; // Форматируем в "YYYY-MM-DD"
            }


            setInitialData(response.data);
        } catch (error) {
            console.error('Error fetching author:', error);
            navigate('/admin/authors');
        }
    };

    const fields = [
        {
            key: 'name',
            label: 'Имя',
            required: true
        },
        {
            key: 'lastname',
            label: 'Фамилия',
            required: true
        },
        {
            key: 'biography',
            label: 'Биография',
            type: 'textarea',
            required: true
        },
        {
            key: 'birthdate',
            label: 'Дата рождения',
            type: 'date',
            required: true
        }
    ];

    const handleSubmit = async (formData) => {
        try {
            const dataToSend = {
                ...formData,
                birthdate: new Date(formData.birthdate).toISOString() // Форматируем дату в ISO 8601
            };

            if (isEdit) {
                await axios.put(`http://localhost:8080/authors/${id}`, dataToSend, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.post('http://localhost:8080/authors/', dataToSend, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            navigate('/admin/authors');
        } catch (error) {
            console.error('Error saving author:', error);
        }
    };

    const handleCancel = () => {
        navigate('/admin/authors');
    };

    return (
        <div className="p-6 ml-[100px]">
            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? 'Редактировать автора' : 'Добавить автора'}
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

export default AuthorFormPage;