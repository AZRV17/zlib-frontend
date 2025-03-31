import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {IoSearchOutline} from "react-icons/io5";

const UniversalTable = ({ data, headers, onCreate, onEdit, onDelete, isReservation = false, isUser = false, isLog = false }) => {
    const [tableData, setTableData] = useState(data);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
    const [hoveredRow, setHoveredRow] = useState(null);

    const getValueByPath = (obj, path) => {
        let s = path.split('.');
        if (s[2] === 'col') {
            try {
                return obj[s[0]].map(o => o[s[1]]).join(", ")
            } catch {
                return
            }
        } if (s[0] === "is_available") {
            return obj[s[0]] ? "Да" : "Нет"
        } else if (s[0] === "date_of_return" || s[0] === "date_of_issue") {
            return obj[s[0]].split("T")[0]
        } else if (s[0] === "status") {
            switch (obj[s[0]]) {
                case "reserved":
                    return "Забронирована"
                case "taken":
                    return "Взята"
                case "returned":
                    return "Возвращена"
                default:
                    return obj[s[0]]
            }
        }

        return path.split('.').reduce((acc, key) => acc ? acc[key] : "", obj);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
        setSortConfig({ key, direction });

        const sortedData = [...tableData].sort((a, b) => {
            const aValue = getValueByPath(a, key);
            const bValue = getValueByPath(b, key);
            if (aValue < bValue) return direction === "asc" ? -1 : 1;
            if (aValue > bValue) return direction === "asc" ? 1 : -1;
            return 0;
        });
        setTableData(sortedData);
    };

    useEffect(() => {
        if (searchTerm) {
            setTableData(
                data.filter((item) =>
                    Object.values(item).some((val) =>
                        val.toString().toLowerCase().includes(searchTerm)
                    )
                )
            );
        } else {
            setTableData(data);
        }
    }, [data, searchTerm]);

    // Вспомогательные функции для рендеринга действий
    const renderActions = (row) => {
        if (isReservation) {
            return (
                <button
                    onClick={() => onEdit(row["id"])}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                    <Edit2 className="h-4 w-4" />
                    <span>Изменить статус</span>
                </button>
            );
        }

        if (!isReservation && !isLog) {
            return (
                <>
                    <button
                        onClick={() => onEdit(row["id"])}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                        <Edit2 className="h-4 w-4" />
                        <span>Изменить</span>
                    </button>
                    <button
                        onClick={() => onDelete(row["id"])}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Удалить</span>
                    </button>
                </>
            );
        }

        return null;
    };

    const renderMobileActions = (row) => {
        if (isReservation) {
            return (
                <button
                    onClick={() => onEdit(row["id"])}
                    className="flex-1 flex items-center justify-center gap-1 text-blue-600 py-2 text-sm font-medium"
                >
                    <Edit2 className="h-4 w-4" />
                    <span>Изменить статус</span>
                </button>
            );
        }

        if (!isReservation && !isLog) {
            return (
                <>
                    <button
                        onClick={() => onEdit(row["id"])}
                        className="flex-1 flex items-center justify-center gap-1 text-blue-600 py-2 text-sm font-medium"
                    >
                        <Edit2 className="h-4 w-4" />
                        <span>Изменить</span>
                    </button>
                    <button
                        onClick={() => onDelete(row["id"])}
                        className="flex-1 flex items-center justify-center gap-1 text-red-600 py-2 text-sm font-medium"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Удалить</span>
                    </button>
                </>
            );
        }

        return null;
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Таблица данных</h2>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center border border-gray-200 rounded-lg shadow-sm">
                            <button className="text-gray-800 p-2 md:p-2.5 rounded-l-lg">
                                <IoSearchOutline className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                placeholder="Поиск..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full min-w-0 text-black rounded-r-lg focus:outline-none p-2 md:p-2.5"
                            />
                        </div>
                    </div>
                    {!isReservation && !isUser && !isLog && (
                        <button
                            onClick={onCreate}
                            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Создать</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Десктопная версия */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
                <div className="min-w-full">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-gray-50">
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header.key}
                                    onClick={() => handleSort(header.key)}
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        {header.label}
                                        {sortConfig.key === header.key && (
                                            <span className="text-gray-400">
                                                {sortConfig.direction === "asc"
                                                    ? <ChevronUp className="h-4 w-4" />
                                                    : <ChevronDown className="h-4 w-4" />}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-sm font-semibold text-gray-900 w-[140px]" />
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {tableData.map((row, index) => (
                            <tr
                                key={index}
                                onMouseEnter={() => setHoveredRow(index)}
                                onMouseLeave={() => setHoveredRow(null)}
                                className={`hover:bg-gray-50 ${hoveredRow === index ? 'bg-blue-50' : ''}`}
                            >
                                {headers.map((header) => (
                                    <td key={header.key} className="px-4 py-3 text-sm text-gray-700">
                                        {header.key === "books.title"
                                            ? row.books.map(book => book.title).join(", ")
                                            : getValueByPath(row, header.key)}
                                    </td>
                                ))}
                                <td className="px-4 py-3 w-[140px]">
                                    <div className="flex items-center gap-3">
                                        {renderActions(row)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Мобильная версия */}
            <div className="md:hidden space-y-4">
                {tableData.map((row, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="p-4 space-y-3">
                            {headers.map((header) => (
                                <div key={header.key} className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500">
                                    {header.label}
                                </span>
                                    <span className="text-sm text-gray-900 mt-1">
                                    {header.key === "books.title"
                                        ? row.books.map(book => book.title).join(", ")
                                        : getValueByPath(row, header.key)}
                                </span>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex gap-4">
                                {renderMobileActions(row)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UniversalTable;