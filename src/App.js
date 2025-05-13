import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from "./pages/Register";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import Favorites from "./pages/Favorites";
import Header from "./components/Header";
import ReserveHistory from "./pages/ReserveHistory";
import AdminAuthorsPage from "./pages/admin_pages/AuthorsAdmin";
import AdminBooksPage from "./pages/admin_pages/BooksAdmin";
import AdminGenresPage from "./pages/admin_pages/GenresAdmin";
import AdminPublishersPage from "./pages/admin_pages/PublishersAdmin";
import AdminUniqueCodesPage from "./pages/admin_pages/UniqueCodesAdmin";
import AdminReservationsPage from "./pages/admin_pages/ReservationsAdmin";
import AuthorFormPage from "./components/forms/AuthorFormPage";
import BookFormPage from "./components/forms/BookFormPage";
import GenreFormPage from "./components/forms/GenreFormPage";
import PublisherFormPage from "./components/forms/PublisherFormPage";
import UniqueCodeFormPage from "./components/forms/UniqueCodeFormPage";
import AdminUsersPage from "./pages/admin_pages/UsersAdmin";
import BackupRestorePage from "./pages/admin_pages/BackupAdmin";
import AdminLogsPage from "./pages/admin_pages/LogsAdmin";
import ReadPage from "./pages/ReadPage";
import AudioBookEditPage from "./components/forms/AudioBookEditPage";
import ChatPage from "./pages/ChatPage";
import LibrarianChatPage from "./pages/LibrarianChatPage";

// Контекст авторизации
export const AuthContext = createContext({
    isAuthenticated: false,
    setAuth: () => {},
});

export const api = "http://localhost:8080";

const AppContent = () => {
    const location = useLocation();
    const [isAuth, setIsAuth] = useState(false);

    // Проверяем, если текущий путь совпадает с /books/:id/read, то не показываем Header
    const hideHeader = location.pathname.startsWith("/books/") && location.pathname.endsWith("/read");

    return (
        <AuthContext.Provider value={{ isAuth, setIsAuth }}>
            {!hideHeader && <Header />}
            <div className={hideHeader ? "" : "pt-16"}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/:id" element={<BookDetail />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/reservations" element={<ReserveHistory />} />
                    <Route path="/admin/authors" element={<AdminAuthorsPage />} />
                    <Route path="/admin/books" element={<AdminBooksPage />} />
                    <Route path="/admin/genres" element={<AdminGenresPage />} />
                    <Route path="/admin/publishers" element={<AdminPublishersPage />} />
                    <Route path="/admin/unique-codes" element={<AdminUniqueCodesPage />} />
                    <Route path="/admin/reservations" element={<AdminReservationsPage />} />
                    <Route path="/admin/logs" element={<AdminLogsPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/authors/new" element={<AuthorFormPage />} />
                    <Route path="/admin/authors/edit/:id" element={<AuthorFormPage />} />
                    <Route path="/admin/books/new" element={<BookFormPage />} />
                    <Route path="/admin/books/edit/:id" element={<BookFormPage />} />
                    <Route path="/admin/genres/new" element={<GenreFormPage />} />
                    <Route path="/admin/genres/edit/:id" element={<GenreFormPage />} />
                    <Route path="/admin/publishers/new" element={<PublisherFormPage />} />
                    <Route path="/admin/publishers/edit/:id" element={<PublisherFormPage />} />
                    <Route path="/admin/unique-codes/new" element={<UniqueCodeFormPage />} />
                    <Route path="/admin/unique-codes/edit/:id" element={<UniqueCodeFormPage />} />
                    <Route path="/admin/backup" element={<BackupRestorePage />} />
                    <Route path="/books/:id/read" element={<ReadPage />} />
                    <Route path="/admin/books/audio/edit/:id" element={<AudioBookEditPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/librarian/chat" element={<LibrarianChatPage />} />
                </Routes>
            </div>
        </AuthContext.Provider>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
