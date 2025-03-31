import React, { useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

const EpubReader = ({ book, isDarkMode, bookId }) => {
    const viewerRef = useRef(null);
    const [rendition, setRendition] = useState(null);
    const resizeObserverRef = useRef(null);

    // Загрузка сохраненных настроек или установка значений по умолчанию
    const [selectedFont, setSelectedFont] = useState(() => {
        return localStorage.getItem(`readerFont_${bookId}`) || 'default';
    });

    const [fontSize, setFontSize] = useState(() => {
        const savedFontSize = localStorage.getItem(`readerFontSize_${bookId}`);
        return savedFontSize ? parseInt(savedFontSize) : 16;
    });

    const fonts = {
        default: "'Arial', sans-serif",
        serif: "'Georgia', serif",
        monospace: "'Courier New', monospace"
    };

    // Обработчики для сохранения настроек
    useEffect(() => {
        localStorage.setItem(`readerFont_${bookId}`, selectedFont);
    }, [selectedFont, bookId]);

    useEffect(() => {
        localStorage.setItem(`readerFontSize_${bookId}`, fontSize.toString());
    }, [fontSize, bookId]);

    // Общие стили для темной и светлой темы
    const createTheme = (isDark) => ({
        'body, html': {
            'font-family': `${fonts[selectedFont]} !important`,
            'font-size': `${fontSize}px !important`,
            'color': isDark ? '#ffffff !important' : '#000000 !important',
            'background-color': isDark ? '#030712 !important' : '#ffffff !important'
        },
        'p, div, span, h1, h2, h3, h4, h5, h6': {
            'font-family': `${fonts[selectedFont]} !important`,
            'color': isDark ? '#ffffff !important' : '#000000 !important'
        },
        'a': {
            'color': isDark ? '#6ba2f7 !important' : '#0000EE !important'
        }
    });

    // Функция для обновления темы
    const updateTheme = () => {
        if (rendition) {
            const theme = createTheme(isDarkMode);
            rendition.themes.default(theme);
            rendition.resize();
        }
    };

    useEffect(() => {
        updateTheme();
    }, [isDarkMode, selectedFont, fontSize, rendition]);

    useEffect(() => {
        let mounted = true;
        let newRendition = null;

        const initializeReader = async () => {
            if (!book || !viewerRef.current) return;

            try {
                viewerRef.current.innerHTML = '';
                await book.ready;

                if (!mounted) return;

                newRendition = book.renderTo(viewerRef.current, {
                    method: "default",
                    width: "100%",
                    height: "100%",
                    flow: "paginated",
                    spread: "auto"
                });

                // Применяем начальные стили
                const initialTheme = createTheme(isDarkMode);
                newRendition.themes.default(initialTheme);

                // Восстановление последней страницы с более надежным подходом
                const savedLocation = localStorage.getItem(`readerLocation_${bookId}`);

                if (savedLocation) {
                    try {
                        const parsedLocation = JSON.parse(savedLocation);

                        // Используем самый точный CFI
                        await newRendition.display(parsedLocation.start);
                    } catch (error) {
                        console.error('Error restoring book location:', error);
                        await newRendition.display();
                    }
                } else {
                    await newRendition.display();
                }

                // Обработчик для сохранения максимально точной позиции
                newRendition.on('relocated', (location) => {
                    if (location && location.start) {
                        try {
                            // Пытаемся получить наиболее точный CFI
                            const mostPreciseCfi = newRendition.currentLocation().start.cfi;

                            localStorage.setItem(`readerLocation_${bookId}`, JSON.stringify({
                                start: mostPreciseCfi,
                                end: location.end ? location.end.cfi : mostPreciseCfi,
                                percentage: location.start.percentage
                            }));

                            console.log('Saved precise location:', mostPreciseCfi);
                        } catch (error) {
                            console.error('Error saving precise location:', error);
                        }
                    }
                });

                const handleKeyUp = (event) => {
                    if (event.key === "ArrowLeft") {
                        newRendition.prev();
                    }
                    if (event.key === "ArrowRight") {
                        newRendition.next();
                    }
                };

                document.addEventListener("keyup", handleKeyUp);

                resizeObserverRef.current = new ResizeObserver(() => {
                    if (newRendition) {
                        newRendition.resize();
                    }
                });

                resizeObserverRef.current.observe(viewerRef.current);

                if (mounted) {
                    setRendition(newRendition);
                }

                return () => {
                    document.removeEventListener("keyup", handleKeyUp);
                };

            } catch (error) {
                console.error('Ошибка инициализации EPUB:', error);
            }
        };

        initializeReader();

        return () => {
            mounted = false;

            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, [book, bookId]);

    const handlePrev = () => {
        if (rendition) rendition.prev();
    };

    const handleNext = () => {
        if (rendition) rendition.next();
    };

    return (
        <div className={`relative w-full h-[80vh] flex flex-col items-center ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
            <div className="w-full flex justify-center mb-4 space-x-4">
                {/* Font Selection Dropdown */}
                <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className={`px-2 py-1 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
                >
                    <option value="default">Default Font</option>
                    <option value="serif">Serif Font</option>
                    <option value="monospace">Monospace Font</option>
                </select>

                {/* Font Size Adjustment */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                        className={`px-2 py-1 rounded ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-black hover:bg-gray-200'}`}
                    >
                        A-
                    </button>
                    <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>{fontSize}px</span>
                    <button
                        onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                        className={`px-2 py-1 rounded ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-black hover:bg-gray-200'}`}
                    >
                        A+
                    </button>
                </div>
            </div>

            <div
                ref={viewerRef}
                id="viewer"
                className="w-full h-full overflow-hidden"
                style={{
                    WebkitFontSmoothing: 'antialiased',
                    transform: 'translateZ(0)'
                }}
                tabIndex={0}
            />
            <div className="w-full flex justify-center gap-4 mt-4">
                <button
                    onClick={handlePrev}
                    className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-400'} rounded transition-colors duration-150 ${isDarkMode ? 'hover:text-gray-400' : 'hover:text-gray-600'}`}
                >
                    <FiArrowLeft
                        size={27}
                        className="inline-block"
                    />
                </button>
                <button
                    onClick={handleNext}
                    className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-400'} rounded transition-colors duration-150 ${isDarkMode ? 'hover:text-gray-400' : 'hover:text-gray-600'}`}
                >
                    <FiArrowRight
                        size={27}
                        className="inline-block"
                    />
                </button>
            </div>
        </div>
    );
};

export default EpubReader;