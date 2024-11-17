import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import { Author } from "../../models/author";
import { useNavigate } from "react-router-dom";
import {Book} from "../../models/book";
import {Genre} from "../../models/genre";

const AdminGenresPage = () => {
    const [genres, setGenres] = useState([]);
    const navigate = useNavigate();

    // Fetch authors data
    const fetchGenres = async () => {
        try {
            const response = await axios.get("http://localhost:8080/genres/", {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const genresData = response.data.map(genre => {

                return Genre.fromJson(genre)
            });

            console.log(genresData)

            setGenres(genresData);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    // Delete author
    const handleDeleteGenre = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/genres/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setGenres(genres.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    // Edit author
    const handleEditGenre = (id) => {
        navigate(`/admin/genres/edit/${id}`);
    };

    // Create new author
    const handleCreateGenre = () => {
        navigate("/admin/genres/new");
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Название" },
        { key: "description", label: "Описание" },
    ];

    return (
        <div className="p-6 ml-[100px]">
            <h1 className="text-2xl font-bold mb-4">Жанры</h1>
            {(genres.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={genres}
                    headers={columns}
                    onEdit={handleEditGenre}
                    onDelete={handleDeleteGenre}
                    onCreate={handleCreateGenre}
                />
            )}
        </div>
    );
};

export default AdminGenresPage;
