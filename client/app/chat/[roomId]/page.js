'use client';
import React, { useState, useEffect, use } from 'react';
import { useChat, useNavbarOffset } from "@/contexts/ChatContext";
import Link from 'next/link';
import { useToast, ToastContainer } from "@/components/UI/Toast";


export default function ChatRoom({ params }) {
    const {
        leaveRoom,
        joinRoom,
        name,
        peerId,
        sendMessage,
        chatLog,
        chatContainerRef,
        scrollToBottom,
        socket,
        isConnected
    } = useChat();
    const navbarOffset = useNavbarOffset();
    const { roomId } = use(params); const [participants, setParticipants] = useState([]);
    const [roomMessages, setRoomMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joinError, setJoinError] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const { toasts, addToast, removeToast } = useToast();// Auto-join room when component mounts
    useEffect(() => {
        const attemptJoin = async () => {
            if (roomId && name && peerId && isConnected) {
                try {
                    setIsLoading(true);
                    setJoinError(null);
                    await joinRoom(roomId);
                    addToast(`Successfully joined room ${roomId}`, 'success');
                    setIsLoading(false);
                } catch (error) {
                    console.error('Failed to join room:', error);
                    setJoinError('Failed to join the room. Please try again.');
                    setIsLoading(false);
                }
            } else if (!name || !peerId) {
                setJoinError('Please set your name on the home page first.');
                setIsLoading(false);
            }
        };

        attemptJoin();
    }, [roomId, name, peerId, isConnected, joinRoom]);    // Listen for room-specific messages and typing events
    useEffect(() => {
        if (socket) {
            const handleRoomMessage = (data) => {
                if (data.roomId === roomId) {
                    setRoomMessages((prev) => [...prev, data]);
                    if (data.sender !== name) {
                        addToast(`New message from ${data.sender}`, 'info', 2000);
                    }
                }
            };

            const handleUserTyping = (data) => {
                if (data.roomId === roomId && data.user.name !== name) {
                    setTypingUsers(prev => {
                        if (!prev.find(u => u.name === data.user.name)) {
                            return [...prev, data.user];
                        }
                        return prev;
                    });
                }
            };

            const handleUserStoppedTyping = (data) => {
                if (data.roomId === roomId) {
                    setTypingUsers(prev => prev.filter(u => u.name !== data.user.name));
                }
            };

            socket.on('receive_message', handleRoomMessage);
            socket.on('user_typing', handleUserTyping);
            socket.on('user_stopped_typing', handleUserStoppedTyping);

            return () => {
                socket.off('receive_message', handleRoomMessage);
                socket.off('user_typing', handleUserTyping);
                socket.off('user_stopped_typing', handleUserStoppedTyping);
            };
        }
    }, [socket, roomId, name, addToast]);

    // Auto-scroll for room messages
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [roomMessages]);

    const sendRoomMessage = (messageText) => {
        if (messageText.trim() && socket && name) {
            const message = {
                text: messageText,
                sender: name,
                roomId: roomId,
                timestamp: new Date().toISOString()
            };
            socket.emit('send_message', message);
        }
    }; useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/${roomId}/participants`);
                if (response.ok) {
                    const data = await response.json();
                    setParticipants(data);
                } else {
                    console.error('Failed to fetch participants:', response.status);
                    setParticipants([]);
                }
            } catch (error) {
                console.error('Error fetching participants:', error);
                setParticipants([]);
            }
        };

        if (roomId) {
            fetchParticipants();
            // Refresh participants every 5 seconds
            const interval = setInterval(fetchParticipants, 5000);
            return () => clearInterval(interval);
        }
    }, [roomId]); return (
        <>
            {isLoading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-lg">Joining room {roomId}...</p>
                    </div>
                </div>
            ) : joinError ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center bg-red-100 p-8 rounded-lg border border-red-300">
                        <h2 className="text-xl font-bold text-red-800 mb-4">Unable to Join Room</h2>
                        <p className="text-red-600 mb-4">{joinError}</p>
                        <Link
                            href="/"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Go to Home
                        </Link>
                    </div>
                </div>) : (
                <main className='flex' style={{ height: `calc(100vh - ${navbarOffset.top})` }}>
                    <section className='sidebar'>
                        <div className="p-4 bg-gray-100 text-black h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Participants</h2>
                                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                                    title={isConnected ? 'Connected' : 'Disconnected'}>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Room: {roomId}</p>
                            <ul className="space-y-2">
                                {participants.length > 0 ? participants.map((participant, index) => (
                                    <li key={index} className="p-2 bg-white rounded shadow flex items-center justify-between">
                                        <span>{participant.name}</span>
                                        {participant.name === name && (
                                            <span className="text-xs text-blue-600 font-semibold">(You)</span>
                                        )}
                                    </li>
                                )) : (
                                    <li className="p-2 bg-white rounded shadow">
                                        No other participants
                                    </li>
                                )}
                            </ul>
                        </div>
                    </section>

                    <section className="w-full h-full flex flex-col">
                        {/* Chat Header */}
                        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                            <h1 className="text-xl font-bold">Room: {roomId}</h1>
                            <Link
                                href={'/'}
                                onClick={() => leaveRoom(roomId)}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                                Leave Room
                            </Link>
                        </div>
                        {/* Messages Display */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 p-4 overflow-y-auto bg-gray-50"
                            style={{ maxHeight: `calc(100vh - ${navbarOffset.top} - 160px)` }}
                        >
                            {roomMessages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                roomMessages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 p-3 rounded-lg max-w-xs ${message.sender === name
                                            ? 'bg-blue-500 text-white ml-auto'
                                            : 'bg-white border text-black border-gray-200'
                                            }`}
                                    >
                                        {message.sender !== name && (
                                            <div className="text-xs text-gray-600 mb-1 font-semibold">
                                                {message.sender}
                                            </div>
                                        )}
                                        <div className="break-words">{message.text}</div>
                                        <div className={`text-xs mt-1 ${message.sender === name ? 'text-blue-100' : 'text-gray-400'
                                            }`}>
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>))
                            )}

                            {/* Typing Indicator */}
                            {typingUsers.length > 0 && (
                                <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-200 rounded-lg max-w-xs">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {typingUsers.length === 1
                                            ? `${typingUsers[0].name} is typing...`
                                            : `${typingUsers.length} people are typing...`
                                        }
                                    </span>
                                </div>
                            )}
                        </div>                    {/* Message Input */}
                        <RoomMessageInput
                            onSendMessage={sendRoomMessage}
                            socket={socket}
                            roomId={roomId}
                            user={{ name, peerId }}
                        />
                    </section>
                </main>)}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
}

// Room Message Input Component
function RoomMessageInput({ onSendMessage, socket, roomId, user }) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = React.useRef(null);

    const handleTypingStart = () => {
        if (!isTyping && socket && roomId && user) {
            setIsTyping(true);
            socket.emit('typing_start', { roomId, user });
        }
    };

    const handleTypingStop = () => {
        if (isTyping && socket && roomId && user) {
            setIsTyping(false);
            socket.emit('typing_stop', { roomId, user });
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);

        // Start typing indicator
        handleTypingStart();

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            handleTypingStop();
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim() && !isSending) {
            // Stop typing indicator immediately when sending
            handleTypingStop();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            setIsSending(true);
            try {
                await onSendMessage(message);
                setMessage('');
            } catch (error) {
                console.error('Failed to send message:', error);
            } finally {
                setIsSending(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (isTyping) {
                handleTypingStop();
            }
        };
    }, []);

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={!message.trim() || isSending}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </div>
        </form>
    );
}