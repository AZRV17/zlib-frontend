import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import {Log} from "../../models/log";

const AdminLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchLogs = async () => {
        try {
            const response = await axios.get("http://localhost:8080/logs/", {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const logsData = response.data.map(log => {

                // let books = author.books.map(book => {
                //     return book.id
                // })
                //
                // author.books = books

                return Log.fromJson(log)
            });

            console.log(logsData)

            setLogs(logsData);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    // Delete author
    const handleDeleteAuthor = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/authors/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setLogs(logs.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    // Edit author
    const handleEditAuthor = (id) => {
        navigate(`/admin/authors/edit/${id}`);
    };

    // Create new author
    const handleCreateAuthor = () => {
        navigate("/admin/authors/new");
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        { key: "user.login", label: "Пользователь" },
        { key: "action", label: "Действие" },
        { key: "details", label: "Детали" },
        { key: "date", label: "Дата" }
    ];

    return (
        <div className="p-6 ml-[100px]">
            <h1 className="text-2xl font-bold mb-4">Логи</h1>
            {(logs.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={logs}
                    headers={columns}
                    onEdit={handleEditAuthor}
                    onDelete={handleDeleteAuthor}
                    onCreate={handleCreateAuthor}
                    isLog={true}
                />
            )}
        </div>
    );
};

export default AdminLogsPage;
