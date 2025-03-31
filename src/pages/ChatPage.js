import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {FiMenu} from "react-icons/fi";

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [chatId, setChatId] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Инициализация при монтировании компонента
    useEffect(() => {
        fetchChats();
        return () => {
            if (socketRef.current) {
                socketRef.current.close(1000);
            }
        };
    }, []);

    // Прокрутка к последнему сообщению
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Загрузка сообщений при смене чата
    // Подключение WebSocket только при выборе чата
    useEffect(() => {
        if (chatId) {
            fetchMessages(chatId);
            setupWebSocket();
        } else {
            // Закрываем соединение если чат не выбран
            if (socketRef.current) {
                socketRef.current.close(1000);
                setWsConnected(false);
            }
        }
    }, [chatId]);

    // Получение списка чатов
    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/chats/', {
                credentials: 'include'
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setChats(data);
                if (data.length > 0) {
                    setChatId(data[0].id);
                }
            }
        } catch (error) {
            console.error("Ошибка при получении чатов:", error);
        } finally {
            setLoading(false);
        }
    };

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

    // Создание нового чата
    const createNewChat = async () => {
        if (!newChatTitle.trim()) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/chats/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newChatTitle
                })
            });

            if (!response.ok) throw new Error('Network error');

            const newChat = await response.json();
            setChats(prev => [newChat, ...prev]);
            setChatId(newChat.id);
            setShowCreateModal(false);
            setNewChatTitle("");
        } catch (error) {
            console.error("Ошибка создания чата:", error);
        }
    };

    const isChatClosed = () => {
        const currentChat = chats.find(chat => chat.id === chatId);
        return currentChat?.status === 'closed';
    };

    const sendMessage = () => {
        if (!message.trim() || !wsConnected || !chatId || isChatClosed()) {
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

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    // Основной интерфейс
    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] relative">

            {/* Верхняя кнопка для мобильного меню */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="flex items-center space-x-2 text-blue-500"
                >
                    <FiMenu size={24} />
                    <span className="font-medium">Мои обращения</span>
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
                        <h2 className="text-base md:text-lg font-semibold">Мои обращения</h2>
                        <button
                            onClick={() => {
                                setShowCreateModal(true);
                                setIsSidebarOpen(false);
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                        >
                            Новое обращение
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {chats.map(chat => (
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
                                <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                                    chat.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                                        chat.status === 'active' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                }`}>
                                    {chat.status === 'waiting' ? 'Ожидает ответа' :
                                        chat.status === 'active' ? 'Активен' : 'Закрыт'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Затемнение фона при открытом сайдбаре на мобильных */}
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
                            {isChatClosed() ? (
                                <div className="text-center text-gray-500 p-2 bg-gray-100 rounded text-sm">
                                    Чат закрыт. Отправка сообщений невозможна
                                </div>
                            ) : (
                                <div className="flex">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-l text-sm md:text-base"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Введите сообщение..."
                                        disabled={isChatClosed()}
                                    />
                                    <button
                                        className={`text-white px-3 md:px-4 py-2 rounded-r text-sm md:text-base ${
                                            wsConnected ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
                                        }`}
                                        onClick={sendMessage}
                                        disabled={isChatClosed()}
                                    >
                                        Отправить
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center text-gray-500">
                            <p className="text-sm md:text-base">Выберите чат или создайте новый</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 bg-blue-500 text-white px-3 py-2 rounded text-sm md:text-base"
                            >
                                Создать новый чат
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Модальное окно создания нового чата */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 md:p-6 rounded-lg w-full md:w-1/3 max-w-md">
                        <h2 className="text-base md:text-lg font-semibold mb-4">Новое обращение</h2>
                        <input
                            type="text"
                            className="w-full p-2 border rounded mb-4 text-sm md:text-base"
                            value={newChatTitle}
                            onChange={(e) => setNewChatTitle(e.target.value)}
                            placeholder="Тема обращения"
                        />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-white px-3 py-2 rounded bg-red-500 hover:bg-red-600 text-sm md:text-base"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={createNewChat}
                                className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm md:text-base"
                            >
                                Создать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;