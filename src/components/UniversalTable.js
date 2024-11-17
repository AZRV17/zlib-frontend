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

    return (
        <div className="w-full bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Таблица данных</h2>

                <div className="flex justify-between items-center gap-4 flex-wrap">
                    <div className="flex-1 flex items-center flex-row min-w-[250px] border border-gray-200 rounded-lg shadow-sm">
                        <button
                            className="text-gray-800 font-bold py-2.5 px-4 rounded-l-xl"
                            type="submit"
                        >
                            <IoSearchOutline />
                        </button>
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-[80%] h-full text-black font-medium rounded-r-xl focus:outline-none p-2"
                        />
                    </div>
                    {!isReservation && !isUser && !isLog && (
                        <button
                            onClick={onCreate}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            Создать
                        </button>
                    )}
                </div>
            </div>

            {/* Контейнер для скролла с тенями */}
            <div className="z-0">
                {/* Тень слева при скролле */}
                {/*<div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />*/}
                {/* Тень справа при скролле */}
                {/*<div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />*/}

                {/* Контейнер с горизонтальным скроллом */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full border-collapse bg-white text-left">
                            <thead className="bg-gray-50">
                            <tr>
                                {headers.map((header) => (
                                    <th
                                        key={header.key}
                                        onClick={() => handleSort(header.key)}
                                        className="top-0 px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-200 bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            {header.label}
                                            <span className="text-gray-400">
                                                    {sortConfig.key === header.key ?
                                                        (sortConfig.direction === "asc" ?
                                                                <ChevronUp className="h-4 w-4" /> :
                                                                <ChevronDown className="h-4 w-4" />
                                                        ) : null}
                                                </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="top-0 right-0 px-6 py-4 text-sm font-semibold text-gray-900 bg-gray-50 min-w-[140px]">

                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {tableData.map((row, index) => (
                                <tr
                                    key={index}
                                    onMouseEnter={() => setHoveredRow(index)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    className={`
                                            transition-colors duration-200
                                            ${hoveredRow === index ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                        `}
                                >
                                    {headers.map((header) => (
                                        <td
                                            key={header.key}
                                            className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                                        >
                                            {
                                                header.key === "books.title"
                                                    ? row.books.map(book => book.title).join(", ")
                                                    : getValueByPath(row, header.key)
                                            }
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                                        <div className="flex items-center gap-3">
                                            {isReservation && (
                                                <>
                                                    <button
                                                        onClick={() => onEdit(row["id"])}
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        <span>Изменить статус</span>
                                                    </button>
                                                </>
                                            )}

                                            {(!isReservation && !isLog) && (
                                                (
                                                    <>
                                                        <button
                                                            onClick={() => onEdit(row["id"])}
                                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                            <span>Изменить</span>
                                                        </button>
                                                        <button
                                                            onClick={() => onDelete(row["id"])}
                                                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Удалить</span>
                                                        </button>
                                                    </>
                                                )
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalTable;