import {Navigate, Outlet, useLocation} from "react-router-dom";
import {useContext} from "react";
import {AuthContext} from "../../App";

const PrivateRoute = () => {
    const { isAuthenticated } = useContext(AuthContext); // используем контекст для получения значения isAuthenticated
    const location = useLocation(); // получаем текущий маршрут с помощью хука useLocation()

    return (
        // если пользователь авторизован, то рендерим дочерние элементы текущего маршрута, используя компонент Outlet
        isAuthenticated === true ?
            <Outlet />
            // если пользователь не авторизован, то перенаправляем его на маршрут /login с помощью компонента Navigate
            // свойство replace указывает, что текущий маршрут будет заменен на новый, чтобы пользователь не мог вернуться
            // обратно, используя кнопку "назад" в браузере.
            :
            <Navigate to="/auth" state={{ from: location }} replace />
    );
}

export default PrivateRoute