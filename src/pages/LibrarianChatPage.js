import React, { useEffect, useState, useRef } from "react";
import {FiMenu, FiPlus} from "react-icons/fi";

const LibrarianChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [chatId, setChatId] = useState(null);
    const [assignedChats, setAssignedChats] = useState([]);
    const [unassignedChats, setUnassignedChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Получение сообщений чата
    const fetchMessages = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/chats/${id}/messages`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Ошибка при получении сообщений:", error);
        }
    };

// Настройка WebSocket соединения
    const setupWebSocket = () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.close(1000);
        }

        socketRef.current = new WebSocket(`ws://localhost:8080/ws`);

        socketRef.current.onopen = () => {
            console.log("WebSocket подключен");
            setWsConnected(true);

            // Отправляем начальное сообщение с ID чата
            socketRef.current.send(JSON.stringify({
                chat_id: chatId,
                content: "" // Пустое сообщение для инициализации
            }));
        };

        socketRef.current.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.chat_id === chatId) {
                    setMessages(prev => [...prev, msg]);
                }
            } catch (error) {
                console.error("Ошибка при обработке сообщения:", error);
            }
        };

        socketRef.current.onclose = (event) => {
            console.log("WebSocket отключен, код:", event.code);
            setWsConnected(false);
            // Переподключаемся только если чат все еще активен
            if (event.code !== 1000 && chatId) {
                setTimeout(setupWebSocket, 2000);
            }
        };
    };

// Отправка сообщения
    const sendMessage = () => {
        if (!message.trim() || !wsConnected || !chatId) {
            return;
        }

        const msgObject = {
            chat_id: chatId,
            content: message
        };

        socketRef.current.send(JSON.stringify(msgObject));
        setMessage("");
    };

// Обработка нажатия Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        fetchAssignedChats();
        return () => {
            if (socketRef.current) {
                socketRef.current.close(1000);
            }
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (chatId) {
            fetchMessages(chatId);
            setupWebSocket();
        } else {
            if (socketRef.current) {
                socketRef.current.close(1000);
                setWsConnected(false);
            }
        }
    }, [chatId]);

    const fetchAssignedChats = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/librarian/chats/', {
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setAssignedChats(data);
                if (data.length > 0) {
                    setChatId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Ошибка при получении назначенных чатов:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedChats = async () => {
        try {
            const response = await fetch('http://localhost:8080/librarian/chats/unassigned', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUnassignedChats(data);
            }
        } catch (error) {
            console.error("Ошибка при получении непринятых чатов:", error);
        }
    };

    const assignChat = async (chatId) => {
        try {
            const response = await fetch(`http://localhost:8080/librarian/chats/${chatId}/assign`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                setShowModal(false);
                await fetchAssignedChats();
            }
        } catch (error) {
            console.error("Ошибка при назначении чата:", error);
        }
    };

    const openUnassignedChatsModal = () => {
        fetchUnassignedChats();
        setShowModal(true);
    };

    const closeChat = async () => {
        try {
            const response = await fetch(`http://localhost:8080/librarian/chats/${chatId}/close`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Обновляем список чатов после закрытия
                await fetchAssignedChats();
                // Можно добавить уведомление об успешном закрытии
                console.log("Чат успешно закрыт");
                // Сбрасываем ID чата
                setChatId(null);
            }
        } catch (error) {
            console.error("Ошибка при закрытии чата:", error);
        }
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
            {/* Верхняя кнопка для мобильного меню */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="flex items-center space-x-2 text-blue-500"
                >
                    <FiMenu size={24} />
                    <span className="font-medium">Активные чаты</span>
                </button>
            </div>

            {/* Боковая панель с чатами */}
            <div className={`
            fixed md:block md:relative
            w-full md:w-1/4 h-[calc(100%-56px)] md:h-full
            bg-gray-50 z-40 md:z-10
            top-14 md:top-0 md:border-r
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-base md:text-lg font-semibold">Активные чаты</h2>
                        <button
                            onClick={() => {
                                openUnassignedChatsModal();
                                setIsSidebarOpen(false);
                            }}
                            className="bg-green-500 text-white p-2 rounded"
                        >
                            <FiPlus size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {assignedChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => {
                                    setChatId(chat.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`p-3 rounded mb-2 cursor-pointer ${
                                    chat.id === chatId ? 'bg-blue-100' : 'hover:bg-gray-200'
                                }`}
                            >
                                <div className="font-medium truncate">{chat.title}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(chat.created_at).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Пользователь: {chat.user_name}
                                </div>
                                <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                                    chat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {chat.status === 'active' ? 'Активен' : 'Закрыт'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Затемнение фона при открытом сайдбаре */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Область сообщений */}
            <div className="w-full md:w-3/4 flex flex-col flex-1">
                {chatId ? (
                    <>
                        <div className="p-3 md:p-4 border-b flex justify-between items-center bg-white">
                            <h2 className="text-base md:text-lg font-semibold truncate">
                                {assignedChats.find(chat => chat.id === chatId)?.title}
                            </h2>
                            <button
                                onClick={closeChat}
                                className="bg-red-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded text-sm"
                            >
                                Закрыть чат
                            </button>
                        </div>

                        <div className="flex-1 p-2 md:p-4 overflow-y-auto bg-white">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`my-1 md:my-2 p-2 md:p-3 rounded-lg max-w-[80%] md:max-w-xs ${
                                        msg.sender_role === 'librarian'
                                            ? 'bg-blue-100 ml-auto'
                                            : 'bg-gray-100'
                                    }`}
                                >
                                    <div className="font-semibold text-xs md:text-sm">
                                        {msg.sender_name || 'Пользователь'}
                                    </div>
                                    <div className="text-sm">{msg.content}</div>
                                    <div className="text-[10px] md:text-xs text-gray-500 text-right mt-1">
                                        {new Date(msg.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-2 md:p-4 border-t">
                            <div className="flex">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border rounded-l text-sm md:text-base"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Введите сообщение..."
                                />
                                <button
                                    className={`px-3 md:px-4 py-2 rounded-r text-sm md:text-base text-white ${
                                        wsConnected ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
                                    }`}
                                    onClick={sendMessage}
                                >
                                    Отправить
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center text-gray-500">
                            <p className="text-sm md:text-base">Выберите чат для начала общения</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Модальное окно непринятых чатов */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base md:text-lg font-semibold">Непринятые чаты</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {unassignedChats.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm md:text-base">
                                Нет доступных чатов
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {unassignedChats.map(chat => (
                                    <div key={chat.id} className="p-3 border rounded">
                                        <div className="font-medium text-sm md:text-base">{chat.title}</div>
                                        <div className="text-xs md:text-sm text-gray-500">
                                            Пользователь: {chat.user_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Создан: {new Date(chat.created_at).toLocaleString()}
                                        </div>
                                        <button
                                            onClick={() => assignChat(chat.id)}
                                            className="mt-2 bg-green-500 text-white px-3 py-1.5 rounded w-full hover:bg-green-600 text-sm md:text-base"
                                        >
                                            Принять чат
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibrarianChatPage;