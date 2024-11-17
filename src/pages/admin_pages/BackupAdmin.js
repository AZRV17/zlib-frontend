import React, { useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Download, Upload } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const BackupRestorePage = () => {
    const fileInputRef = useRef(null);

    const createBackup = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/backup/backup`, {}, {
                withCredentials: true,
                responseType: 'blob',
            });

            // Создаем ссылку для скачивания файла
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.href = url;
            link.setAttribute('download', `backup_${timestamp}.sql`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Бэкап успешно создан!');
        } catch (error) {
            toast.error('Ошибка при создании бэкапа');
            console.error(error);
        }
    };

    const restoreBackup = async (file) => {
        if (!file) {
            toast.warning('Пожалуйста, выберите файл бэкапа');
            return;
        }

        const formData = new FormData();
        formData.append('backup', file);

        try {
            const response = await axios.post(`http://localhost:8080/backup/restore`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                toast.success('База данных успешно восстановлена!');
            }
        } catch (error) {
            toast.error('Ошибка при восстановлении базы данных');
            console.error(error);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.name.endsWith('.sql')) {
                restoreBackup(file);
            } else {
                toast.error('Пожалуйста, выберите файл .sql');
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center">Бэкап и Восстановление</h1>

                <div className="space-y-6 text-center">
                    <div className="space-y-2">
                        <button
                            onClick={createBackup}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            Создать и скачать бэкап
                        </button>
                        <p className="text-sm text-gray-500">
                            Скачать полную копию базы данных
                        </p>
                    </div>

                    <div className="border-t border-gray-200 my-6"></div>

                    <div className="space-y-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".sql"
                            className="hidden"
                        />
                        <button
                            onClick={handleRestoreClick}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <Upload size={20} />
                            Восстановить из бэкапа
                        </button>
                        <p className="text-sm text-gray-500">
                            Выберите файл .sql для восстановления
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupRestorePage;