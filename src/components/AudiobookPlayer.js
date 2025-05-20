import React, { useState, useEffect, useRef } from 'react';
import {api} from '../App'
import axios from 'axios';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const AudiobookPlayer = ({ bookId, isOpen, onClose }) => {
    const [audioFiles, setAudioFiles] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    // Fetch audio files for the book
    useEffect(() => {
        if (isOpen && bookId) {
            setLoading(true);
            axios.get(`${api}/books/${bookId}/audio`, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            })
                .then(response => {
                    if (response.status === 200) {
                        // Sort chapters by order
                        const sortedFiles = response.data.sort((a, b) => a.order - b.order);
                        setAudioFiles(sortedFiles);
                        setLoading(false);
                    }
                })
                .catch(err => {
                    console.error("Error fetching audiobook files:", err);
                    setLoading(false);
                });
        }
    }, [bookId, isOpen]);

    // Set up audio listeners when current track changes
    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;

            const updateTime = () => setCurrentTime(audio.currentTime);
            const updateDuration = () => setDuration(audio.duration);
            const onEnded = () => {
                if (currentTrackIndex < audioFiles.length - 1) {
                    setCurrentTrackIndex(currentTrackIndex + 1);
                } else {
                    setIsPlaying(false);
                }
            };

            audio.addEventListener('timeupdate', updateTime);
            audio.addEventListener('loadedmetadata', updateDuration);
            audio.addEventListener('ended', onEnded);

            return () => {
                audio.removeEventListener('timeupdate', updateTime);
                audio.removeEventListener('loadedmetadata', updateDuration);
                audio.removeEventListener('ended', onEnded);
            };
        }
    }, [audioRef, currentTrackIndex, audioFiles.length]);

    // Control playback when isPlaying changes
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.error("Error playing audio:", error);
                    setIsPlaying(false);
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrackIndex]);

    // Handle volume changes and mute
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Format time in MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleTrackChange = (index) => {
        setCurrentTrackIndex(index);
        setCurrentTime(0);
        setIsPlaying(true);
    };

    const handlePrevTrack = () => {
        if (currentTime > 3) {
            // If more than 3 seconds into track, restart current track
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
        } else if (currentTrackIndex > 0) {
            // Go to previous track
            setCurrentTrackIndex(currentTrackIndex - 1);
        }
    };

    const handleNextTrack = () => {
        if (currentTrackIndex < audioFiles.length - 1) {
            setCurrentTrackIndex(currentTrackIndex + 1);
        }
    };

    const handleProgressClick = (e) => {
        const progressBar = progressBarRef.current;
        const percent = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
        const newTime = percent * duration;

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-3xl mx-4 shadow-2xl p-6 relative">
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6 pr-8">Аудио Плеер</h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : audioFiles.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-lg text-gray-600">Нет доступных аудио для данной книги</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 bg-gray-100 rounded-lg p-4">
                            <h3 className="text-xl font-medium mb-2">
                                {audioFiles[currentTrackIndex]?.chapter_title || `Chapter ${currentTrackIndex + 1}`}
                            </h3>

                            {/* Audio element (hidden) */}
                            <audio
                                ref={audioRef}
                                src={`${api}/books/audio/${audioFiles[currentTrackIndex]?.id}`}
                                preload="metadata"
                            />

                            {/* Progress bar */}
                            <div
                                ref={progressBarRef}
                                className="h-2 bg-gray-300 rounded-full mb-2 relative cursor-pointer"
                                onClick={handleProgressClick}
                            >
                                <div
                                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                                ></div>
                            </div>

                            {/* Time display */}
                            <div className="flex justify-between text-sm text-gray-600 mb-4">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>

                            {/* Player controls */}
                            <div className="flex items-center justify-center space-x-6">
                                <button
                                    className="text-gray-700 hover:text-blue-500 focus:outline-none"
                                    onClick={handlePrevTrack}
                                >
                                    <SkipBack size={24} />
                                </button>

                                <button
                                    className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 focus:outline-none"
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                </button>

                                <button
                                    className="text-gray-700 hover:text-blue-500 focus:outline-none"
                                    onClick={handleNextTrack}
                                    disabled={currentTrackIndex >= audioFiles.length - 1}
                                >
                                    <SkipForward size={24} className={currentTrackIndex >= audioFiles.length - 1 ? "opacity-50" : ""} />
                                </button>

                                {/* Volume control */}
                                <div className="flex items-center ml-4">
                                    <button
                                        className="text-gray-700 hover:text-blue-500 focus:outline-none mr-2"
                                        onClick={toggleMute}
                                    >
                                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-24"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Chapter list */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">Chapters</h3>
                            <div className="max-h-64 overflow-y-auto pr-2">
                                {audioFiles.map((file, index) => (
                                    <div
                                        key={file.id}
                                        className={`p-3 rounded mb-2 cursor-pointer flex items-center
                      ${currentTrackIndex === index
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'bg-gray-100 hover:bg-gray-200'}`}
                                        onClick={() => handleTrackChange(index)}
                                    >
                                        <span className="w-6 text-center mr-2">{index + 1}</span>
                                        <span className="flex-1 truncate">{file.chapter_title || `Chapter ${index + 1}`}</span>
                                        {currentTrackIndex === index && isPlaying && (
                                            <div className="flex space-x-1 ml-2">
                                                <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{animationDelay: '0ms'}}></div>
                                                <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{animationDelay: '200ms'}}></div>
                                                <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{animationDelay: '400ms'}}></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AudiobookPlayer;