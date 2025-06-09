'use client';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';
import Link from 'next/link';
import { useState } from 'react';


export default function CreateVideoChatPage() {
    const router = useRouter();
    const { name, isConnected } = useChat();
    const [joinChatId, setJoinChatId] = useState('');
    const [isValidUuid, setIsValidUuid] = useState(true);    const handleCreateVideoChat = (e) => {
        e.preventDefault();
        
        if (!name) {
            alert('Please set your name first in the global chat before creating a video chat.');
            router.push('/global');
            return;
        }
        
        if (!isConnected) {
            alert('Please wait for connection to be established.');
            return;
        }
        
        const videoChatId = uuidv4();
        console.log('Creating video chat with ID:', videoChatId);
        router.push(`/chat/video-chat/${videoChatId}`);
    };

    const validateUuid = (uuid) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    const handleJoinChatIdChange = (e) => {
        const value = e.target.value;
        setJoinChatId(value);
        
        if (value.trim() === '') {
            setIsValidUuid(true);
        } else {
            setIsValidUuid(validateUuid(value.trim()));
        }
    };

    const handleJoinVideoChat = (e) => {
        e.preventDefault();
        
        if (!name) {
            alert('Please set your name first in the global chat before joining a video chat.');
            router.push('/global');
            return;
        }
        
        if (!isConnected) {
            alert('Please wait for connection to be established.');
            return;
        }

        const trimmedId = joinChatId.trim();
        if (!trimmedId) {
            alert('Please enter a video chat ID.');
            return;
        }

        if (!validateUuid(trimmedId)) {
            alert('Please enter a valid video chat ID (UUID format).');
            return;
        }

        console.log('Joining video chat with ID:', trimmedId);
        router.push(`/chat/video-chat/${trimmedId}`);
    };    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    {/* User Status */}
                    {name ? (
                        <div className="mb-6 text-center">
                            <p className="text-sm text-gray-600 mb-2">Logged in as:</p>
                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-block">
                                {name}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded text-center">
                            <p className="text-yellow-800 text-sm">
                                ⚠️ You need to set your name first. 
                                <button 
                                    onClick={() => router.push('/global')} 
                                    className="text-blue-600 underline ml-1"
                                >
                                    Go to Global Chat
                                </button>
                            </p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Create Video Chat */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                Create Video Chat
                            </h2>
                            
                            <form onSubmit={handleCreateVideoChat}>
                                <button 
                                    type="submit"
                                    disabled={!name || !isConnected}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                        name && isConnected
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {!isConnected ? 'Connecting...' : 'Create New Video Chat'}
                                </button>
                            </form>
                            
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Create a new video chat room and get a shareable link
                                </p>
                            </div>
                        </div>

                        {/* Join Video Chat */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                Join Video Chat
                            </h2>
                            
                            <form onSubmit={handleJoinVideoChat}>
                                <div className="mb-4">
                                    <label htmlFor="joinChatId" className="block text-sm font-medium text-gray-700 mb-2">
                                        Video Chat ID
                                    </label>
                                    <input
                                        type="text"
                                        id="joinChatId"
                                        value={joinChatId}
                                        onChange={handleJoinChatIdChange}
                                        placeholder="Paste video chat ID here..."
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            !isValidUuid && joinChatId.trim() !== ''
                                                ? 'border-red-400 bg-red-50'
                                                : 'border-gray-300'
                                        }`}
                                        disabled={!name || !isConnected}
                                    />
                                    {!isValidUuid && joinChatId.trim() !== '' && (
                                        <p className="text-red-500 text-xs mt-1">
                                            Please enter a valid video chat ID
                                        </p>
                                    )}
                                </div>
                                
                                <button 
                                    type="submit"
                                    disabled={!name || !isConnected || !joinChatId.trim() || !isValidUuid}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                        name && isConnected && joinChatId.trim() && isValidUuid
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {!isConnected ? 'Connecting...' : 'Join Video Chat'}
                                </button>
                            </form>
                            
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Enter the video chat ID shared by someone else
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Alternative using Link component */}
                    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                            Quick Join with Link
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <input
                                type="text"
                                value={joinChatId}
                                onChange={handleJoinChatIdChange}
                                placeholder="Enter video chat ID..."
                                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    !isValidUuid && joinChatId.trim() !== ''
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-300'
                                }`}
                                disabled={!name || !isConnected}
                            />
                            {joinChatId.trim() && isValidUuid && name && isConnected ? (
                                <Link 
                                    href={`/chat/video-chat/${joinChatId.trim()}`}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Join via Link
                                </Link>
                            ) : (
                                <button 
                                    disabled 
                                    className="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg font-medium cursor-not-allowed"
                                >
                                    Join via Link
                                </button>
                            )}
                        </div>
                        {!isValidUuid && joinChatId.trim() !== '' && (
                            <p className="text-red-500 text-xs mt-2 text-center">
                                Please enter a valid video chat ID (UUID format)
                            </p>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Video chat IDs are in UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}