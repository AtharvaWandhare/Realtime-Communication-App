'use client';
import { useChat } from '@/contexts/ChatContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatePrivateOrGroupChat() {
    const router = useRouter();
    const { name, sendMessage, isConnected, createRoom, joinRoom, rooms, navbarHeight } = useChat();

    return (
        <div
            className="bg-gradient-to-br from-blue-50 via-white to-purple-50"
        >
            <div className="flex h-full">

                {/* Sidebar */}
                <div className="w-80 h-full bg-white shadow-xl border-l border-gray-200 relative z-10">
                    <div className="sticky top-0">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Your Chat Rooms</h2>
                                    <p className="text-purple-100 text-sm">Quick access to your rooms</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="p-4 overflow-y-auto"
                            style={{ height: `calc(100vh - ${navbarHeight}px - 140px)` }}
                        >
                            {rooms.length > 0 ? (
                                <div className="space-y-3">
                                    {rooms.map((room, index) => (
                                        <Link
                                            key={index}
                                            href={`/chat/${room.id}`}
                                            className="group block p-3 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors text-sm truncate">
                                                        {room.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        ID: {room.id}
                                                    </p>
                                                </div>
                                                <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm">No chat rooms yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Create your first room!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 h-full overflow-y-auto">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                Create & Join Chats
                            </h1>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Start a new conversation or join an existing chat room to connect with others
                            </p>
                        </div>

                        {!name && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
                                <div className="flex items-center justify-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-red-800 font-medium">Please set your name first</p>
                                            <Link href="/" className="text-red-600 hover:text-red-800 underline text-sm">
                                                Go to Home Page →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isConnected && (
                            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="animate-spin w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                                    <p className="text-yellow-800 font-medium">Connecting to server...</p>
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Create New Chat</h2>
                                    </div>
                                    <p className="text-blue-100 mt-2">Start a fresh conversation</p>
                                </div>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const chatName = e.target.chatName.value;
                                    if (chatName.trim() && name) {
                                        const room = createRoom(chatName);
                                        if (room) {
                                            sendMessage(`${name} created a new chat Room: "${room.name}"`);
                                        }
                                        e.target.reset();
                                    }
                                }} className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chat Room Name
                                            </label>
                                            <input
                                                name="chatName"
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                                                placeholder="Enter a name for your chat room..."
                                                required
                                                disabled={!name || !isConnected}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${name && isConnected
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            disabled={!name || !isConnected}
                                        >
                                            Create Chat Room
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Join Existing Chat</h2>
                                    </div>
                                    <p className="text-green-100 mt-2">Enter a room ID to join</p>
                                </div>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const joinChatId = e.target.joinChatId.value;
                                    if (joinChatId.trim() && name) {
                                        joinRoom(joinChatId);
                                        router.push(`/chat/${joinChatId}`);
                                        sendMessage(`${name} is trying to join chat: "${joinChatId}"`);
                                        e.target.reset();
                                    }
                                }} className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chat Room ID
                                            </label>
                                            <input
                                                name="joinChatId"
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder-gray-400"
                                                placeholder="Enter room ID to join..."
                                                required
                                                disabled={!name || !isConnected}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${name && isConnected
                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            disabled={!name || !isConnected}
                                        >
                                            Join Chat Room
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}