import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AudioBookEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [audioFiles, setAudioFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [newChapterTitle, setNewChapterTitle] = useState('');

    // Загрузка информации о книге
    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`http://localhost:8080/books/${id}`);
                setBook(response.data);

                // Получение существующих аудиофайлов
                const filesResponse = await axios.get(`http://localhost:8080/books/${id}/audio`);
                setAudioFiles(filesResponse.data || []);
            } catch (err) {
                setError('Ошибка при загрузке данных о книге: ' + err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    // Загрузка аудиофайла
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setIsLoading(true);
        setError(null);
        setSuccess('');
        setUploadProgress(0);

        // Создаем FormData для отправки файлов
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`audioFiles`, file);
        });

        // Добавляем название главы
        formData.append('chapterTitle', newChapterTitle);

        try {
            // Отправка запроса с отслеживанием прогресса
            const response = await axios.post(`http://localhost:8080/books/${id}/audio/upload`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                }
            }).catch((err) => {
                console.log(err)
            })

            if (response.status === 200) {
                const filesResponse = await axios.get(`http://localhost:8080/books/${id}/audio`);
                setAudioFiles(filesResponse.data || []);
                setSuccess('Файлы успешно загружены!');
                setNewChapterTitle(''); // Сбросить поле названия главы
            } else {
                setError('Ошибка при загрузке файлов: ' + response.statusText);
            }

        } catch (err) {
            setError('Ошибка при загрузке файлов: ' + err.message);
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    // Удаление аудиофайла
    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) {
            return;
        }

        try {
            setIsLoading(true);
            await axios.delete(`http://localhost:8080/books/${id}/audio/${fileId}`);

            // Обновление списка файлов
            const updatedFiles = audioFiles.filter(file => file.id !== fileId);
            setAudioFiles(updatedFiles);
            setSuccess('Файл успешно удален!');
        } catch (err) {
            setError('Ошибка при удалении файла: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Изменение порядка файлов
    const handleReorderFiles = async (fileId, direction) => {
        try {
            setIsLoading(true);
            await axios.put(`http://localhost:8080/books/${id}/audio/${fileId}/reorder`, { direction });

            // Обновление списка файлов
            const filesResponse = await axios.get(`http://localhost:8080/books/${id}/audio`);
            setAudioFiles(filesResponse.data || []);
            setSuccess('Порядок файлов обновлен!');
        } catch (err) {
            setError('Ошибка при изменении порядка файлов: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Обновление названия главы
    const handleUpdateChapterTitle = async (fileId, newTitle) => {
        try {
            setIsLoading(true);
            await axios.put(`http://localhost:8080/books/${id}/audio/${fileId}`, {
                chapter_title: newTitle
            });

            // Обновление списка файлов
            const updatedFiles = audioFiles.map(file => {
                if (file.id === fileId) {
                    return { ...file, chapter_title: newTitle };
                }
                return file;
            });

            setAudioFiles(updatedFiles);
            setSuccess('Название главы обновлено!');
        } catch (err) {
            setError('Ошибка при обновлении названия главы: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Возврат к списку книг
    const handleBackToList = () => {
        navigate('/admin/books');
    };

    // Получение имени файла из пути
    const getFilenameFromPath = (filePath) => {
        if (!filePath) return '';
        return filePath.split('/').pop();
    };

    if (isLoading && !book) {
        return <div className="loading">Загрузка данных...</div>;
    }

    return (
        <div className="container mx-auto ml-[10%] max-w-[85%] p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Управление аудиофайлами{book ? `: ${book.title}` : ''}
                </h1>
                <button
                    onClick={handleBackToList}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                    Назад к списку книг
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Загрузить новую главу аудиокниги</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="chapterTitle">
                        Название главы
                    </label>
                    <input
                        id="chapterTitle"
                        type="text"
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Введите название главы"
                        disabled={isLoading}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="audioFile">
                        Аудиофайл
                    </label>
                    <input
                        id="audioFile"
                        type="file"
                        onChange={handleFileUpload}
                        accept="audio/*"
                        className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3"
                        disabled={isLoading || !newChapterTitle.trim()}
                    />
                    <p className="text-gray-600 text-sm mt-1">
                        Поддерживаемые форматы: MP3, WAV, AAC и OGG
                    </p>
                </div>

                {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <p className="text-sm text-gray-600 mt-1">
                            Загружено: {uploadProgress}%
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Список глав аудиокниги</h2>

                {audioFiles.length === 0 ? (
                    <p className="text-gray-500">Аудиофайлы отсутствуют</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {audioFiles.sort((a, b) => a.order - b.order).map((file, index) => (
                            <li key={file.id} className="py-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start mb-2 md:mb-0">
                                        <span className="text-gray-700 mr-2 mt-1">{file.order}.</span>
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <input
                                                    type="text"
                                                    value={file.chapter_title}
                                                    onChange={(e) => {
                                                        const updatedFiles = audioFiles.map(f =>
                                                            f.id === file.id ? {...f, chapter_title: e.target.value} : f
                                                        );
                                                        setAudioFiles(updatedFiles);
                                                    }}
                                                    onBlur={(e) => handleUpdateChapterTitle(file.id, e.target.value)}
                                                    className="font-medium border border-gray-300 rounded py-1 px-2 mr-2"
                                                />
                                                <span className="text-sm text-gray-500">
                          {getFilenameFromPath(file.file_path)}
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <audio controls className="h-8 w-48 md:w-64">
                                            <source src={`http://localhost:8080/books/audio/${file.id}`} type="audio/mpeg" />
                                            Ваш браузер не поддерживает аудиоэлемент.
                                        </audio>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleReorderFiles(file.id, 'up')}
                                                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                                title="Переместить вверх"
                                                disabled={isLoading || file.order <= 1}
                                            >
                                                ↑
                                            </button>

                                            <button
                                                onClick={() => handleReorderFiles(file.id, 'down')}
                                                className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                                title="Переместить вниз"
                                                disabled={isLoading || file.order >= audioFiles.length}
                                            >
                                                ↓
                                            </button>

                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="p-1 text-red-600 hover:text-red-900"
                                                title="Удалить файл"
                                                disabled={isLoading}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AudioBookEditPage;