import React, { useEffect, useState } from "react";
import axios from "axios";
import UniversalTable from "../../components/UniversalTable"; // Import the universal table component
import { useNavigate } from "react-router-dom";
import {User} from "../../models/user";
import {ChevronDown} from "lucide-react";
import {toast} from "react-toastify";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState("")
    const [selectedUser, setSelectedUser] = useState(null);

    const options = [
        {
            value: "user",
            label: "Пользователь"
        },
        {
            value: "librarian",
            label: "Библиотекарь"
        },
        {
            value: "admin",
            label: "Администратор"
        }
    ]

    // Fetch authors data
    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/users/", {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const usersData = response.data.map(user => {

                // let books = author.books.map(book => {
                //     return book.id
                // })
                //
                // author.books = books

                return User.fromJson(user)
            });

            console.log(usersData)

            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchUser = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/users/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setSelectedUser(User.fromJson(response.data));
        } catch (error) {
            console.error("Error fetching author:", error);
        }
    };

    // Delete author
    const handleDeleteAuthor = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/users/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setUsers(users.filter(author => author.id !== id));
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    const confirmEdit = async () => {
        try {
            await axios.patch(`http://localhost:8080/users/change-role`, {"id": editId, "role": role}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            toast.success("Роль изменена");

            fetchUsers();
        } catch (error) {
            console.error("Error editing user:", error);
            toast.error("Не удалось изменить роль пользователя");
        }
        setIsEdit(false)
    }

    // Edit author
    const handleEditAuthor = (id) => {
        setEditId(id)
        fetchUser(id).then(r => {
            setIsEdit(true)
        })
    };

    // Create new author
    const handleCreateAuthor = () => {
        navigate("/admin/user/new");
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Define the columns for the table
    const columns = [
        { key: "id", label: "ID" },
        {key: "login", label: "Логин"},
        {key: "full_name", label: "ФИО"},
        {key: "password", label: "Пароль"},
        {key: "email", label: "Email"},
        {key: "role", label: "Роль"},
        {key: "phone_number", label: "Номер телефона"},
        {key: "passport_number", label: "Номер паспорта"},
    ];

    return (
        <div className="p-6 ml-[100px]">
            <h1 className="text-2xl font-bold mb-4">Пользователи</h1>
            {(users.length !== 0 && columns.length !== 0) && (
                <UniversalTable
                    data={users}
                    headers={columns}
                    onEdit={handleEditAuthor}
                    onDelete={handleDeleteAuthor}
                    onCreate={handleCreateAuthor}
                    isUser={true}
                />
            )}

            {isEdit && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black bg-opacity-50">
                    {/* Модальное окно */}
                    <div className="relative bg-white p-6 rounded-lg shadow-lg z-50">
                        <h2 className="text-xl font-bold mb-4">Выберите роль</h2>
                        <div className="relative">
                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className={`w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between border-gray-300`}
                            >
                                <span className={`${!selectedUser ? 'text-gray-500' : ''}`}>
                                    {selectedUser.id ? options.find(opt => opt.value === selectedUser.role)['label'] : 'Выберите из списка...'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {options.map((option) => (
                                        <div
                                            key={option.value}
                                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                setRole({ target: { value: option.value } }.target.value);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between mt-5 space-x-4">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-150"
                                onClick={confirmEdit}
                            >
                                Изменить
                            </button>
                            <button
                                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-150"
                                onClick={() => setIsEdit(false)}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUsersPage;
