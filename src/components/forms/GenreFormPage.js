import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import UniversalForm from '../../components/forms/UniversalForm';
import {data} from "autoprefixer";

const GenreFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState({});
    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            fetchGenre();
        }
    }, [id]);

    const fetchGenre = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/genres/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setInitialData(response.data);
        } catch (error) {
            console.error('Error fetching author:', error);
            navigate('/admin/genres');
        }
    };

    const fields = [
        {
            key: 'name',
            label: 'Название',
            type: 'text',
            required: true
        },
        {
            key: 'description',
            label: 'Описание',
            type: 'text',
            required: true
        }
    ];

    const handleSubmit = async (formData) => {
        try {
            const dataToSend = {...formData};

            if (isEdit) {
                await axios.put(`http://localhost:8080/genres/${id}`, dataToSend, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.post('http://localhost:8080/genres/', dataToSend, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            navigate('/admin/genres');
        } catch (error) {
            console.error('Error saving author:', error);
        }
    };

    const handleCancel = () => {
        navigate('/admin/genres');
    };

    return (
        <div className="p-6 ml-[100px]">
            <h1 className="text-2xl font-bold mb-6">
                {isEdit ? 'Редактировать жанр' : 'Добавить жанр'}
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

export default GenreFormPage;