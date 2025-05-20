import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import {Book} from "../../models/book";
import {Genre} from "../../models/genre";
import {Publisher} from "../../models/publisher";
import {UniqueCode} from "../../models/uniqueCode";
import {api} from '../../App.js'

const AdminUniqueCodesPage = () => {
    const [uniqueCode, setUniqueCode] = useState([]);
    const navigate = useNavigate();

    const fetchUniqueCode = async () => {
        try {
            const response = await axios.get(`${api}/unique-codes/`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const uniqueCodesData = response.data.map(uniqueCode => {

                return UniqueCode.fromJson(uniqueCode)
            });

            console.log(uniqueCodesData)

            setUniqueCode(uniqueCodesData);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    const handleDeleteUniqueCode = async (id) => {
        try {
            await axios.delete(`${api}/unique-codes/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setUniqueCode(uniqueCode.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    const handleEditUniqueCode = (id) => {
        navigate(`/admin/unique-codes/edit/${id}`);
    };

    const handleCreateUniqueCode = () => {
        navigate("/admin/unique-codes/new");
    };

    useEffect(() => {
        fetchUniqueCode();
    }, []);

    const columns = [
        { key: "id", label: "ID" },
        { key: "code", label: "Код" },
        { key: "book.title", label: "Книга" },
        { key: "is_available", label: "Доступен" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Уникальные коды</h1>
            {(uniqueCode.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={uniqueCode}
                    headers={columns}
                    onEdit={handleEditUniqueCode}
                    onDelete={handleDeleteUniqueCode}
                    onCreate={handleCreateUniqueCode}
                />
            )}
        </div>
    );
};

export default AdminUniqueCodesPage;
