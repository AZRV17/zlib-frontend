import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import {Book} from "../../models/book";
import {Genre} from "../../models/genre";
import {Publisher} from "../../models/publisher";

const AdminPublishersPage = () => {
    const [publishers, setPublishers] = useState([]);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchPublishers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/publishers/", {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const publishersData = response.data.map(publisher => {

                return Publisher.fromJson(publisher)
            });

            setPublishers(publishersData);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    // Delete author
    const handleDeleteGenre = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/publishers/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setPublishers(publishers.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    // Edit author
    const handleEditGenre = (id) => {
        navigate(`/admin/publishers/edit/${id}`);
    };

    // Create new author
    const handleCreateGenre = () => {
        navigate("/admin/publishers/new");
    };

    useEffect(() => {
        fetchPublishers();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Название" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Издательства</h1>
            {(publishers.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={publishers}
                    headers={columns}
                    onEdit={handleEditGenre}
                    onDelete={handleDeleteGenre}
                    onCreate={handleCreateGenre}
                />
            )}
        </div>
    );
};

export default AdminPublishersPage;
