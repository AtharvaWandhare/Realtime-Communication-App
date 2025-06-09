'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Peer } from 'peerjs';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

const ChatContext = createContext();

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

// Custom hook specifically for navbar height
export const useNavbarHeight = () => {
    const { navbarHeight } = useChat();
    return navbarHeight;
};

// Utility function to get navbar height as CSS calc string
export const useNavbarOffset = () => {
    const navbarHeight = useNavbarHeight();
    return {
        paddingTop: `${navbarHeight}px`,
        marginTop: `${navbarHeight}px`,
        top: `${navbarHeight}px`,
        height: `calc(100vh - ${navbarHeight}px)`,
        minHeight: `calc(100vh - ${navbarHeight}px)`,
    };
};

export const ChatProvider = ({ children }) => {
    const router = useRouter();
    const [peerId, setPeerId] = useState('');
    const [peer, setPeer] = useState(null);
    const [socket, setSocket] = useState(null);
    const [name, setName] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [navbarHeight, setNavbarHeight] = useState(0);
    const peerRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const p = new Peer();
        peerRef.current = p;
        setPeer(p);

        p.on('open', (id) => {
            console.log('Peer connection established with ID:', id);
            setPeerId(id);
            setIsConnected(true);
        });

        p.on('error', (error) => {
            console.error('Peer error:', error);
        });

        const socketConnection = io(`http://localhost:5000`);
        setSocket(socketConnection);

        socketConnection.on('connect', () => {
            console.log('Connected to server with ID:', socketConnection.id);
            setIsConnected(true);
        });

        socketConnection.on('receive_message', (data) => {
            setChatLog((prev) => [...prev, data]);
        });

        socketConnection.on('disconnect', () => {
            console.log('Disconnected from server with ID:', socketConnection.id);
            setIsConnected(false);
        });

        socketConnection.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        });

        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
            }
            if (socketConnection) {
                socketConnection.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatLog]);

    // Navbar height tracking
    useEffect(() => {
        const updateNavbarHeight = () => {
            const navElement = document.querySelector('nav');
            if (navElement) {
                const height = navElement.offsetHeight;
                if (height !== navbarHeight) {
                    setNavbarHeight(height);
                }
            }
        };

        // Initial measurement
        updateNavbarHeight();

        // Listen for resize events
        window.addEventListener('resize', updateNavbarHeight);

        // Listen for DOM mutations in case navbar content changes
        const observer = new MutationObserver(updateNavbarHeight);
        const navElement = document.querySelector('nav');
        if (navElement) {
            observer.observe(navElement, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }

        return () => {
            window.removeEventListener('resize', updateNavbarHeight);
            observer.disconnect();
        };
    }, [navbarHeight]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const sendMessage = (messageText, roomId = null) => {
        if (messageText.trim() && socket && name) {
            const message = { text: messageText, sender: name };
            socket.emit('send_message', { roomId, message });
        }
    };

    const createRoom = (roomName) => {
        const roomId = uuidv4();
        if (socket && name) {
            socket.emit('create_room', roomId, roomName, { creator: name, id: peerId });
            const newRoom = { id: roomId, name: roomName };
            setRooms((prev) => [...prev, newRoom]);
            // router.push(`/chat/${roomId}`);
            return newRoom;
        }
        return null;
    };

    const joinRoom = (roomId) => {
        if (socket && name) {
            socket.emit('join_room', roomId, { name: name, peerId });
        }
    };

    const leaveRoom = (roomId) => {
        if (socket) {
            socket.emit('leave_room', roomId);
        }
    };

    const joinChat = (userName) => {
        if (userName.trim()) {
            setName(userName);
            if (socket) {
                socket.emit('send_message', {
                    text: `${userName} has joined the chat`,
                    sender: userName
                });
            }
        }
    };

    const leaveChat = () => {
        if (socket && name) {
            socket.emit('send_message', {
                text: `${name} has left the chat`,
                sender: name
            });
        }
        setName('');
    };

    const value = {
        peerId,
        peer,
        socket,
        name,
        chatLog,
        rooms,
        isConnected,
        navbarHeight,
        chatContainerRef,
        sendMessage,
        joinChat,
        leaveChat,
        setChatLog,
        scrollToBottom,
        createRoom,
        joinRoom,
        leaveRoom,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};