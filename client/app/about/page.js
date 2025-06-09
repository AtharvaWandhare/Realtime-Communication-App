

'use client';
import { useChat, useNavbarOffset } from '@/contexts/ChatContext';

export default function About() {
    const { name, isConnected, chatLog } = useChat();
    const navbarOffset = useNavbarOffset();

    return (
        <section className="w-full p-4" style={{ height: navbarOffset.height }}>
            <div className="flex items-center justify-center h-full flex-col">
                <h1 className="text-4xl font-bold mb-8">About This Chat App</h1>

                <div className="bg-gray-100 p-6 rounded-lg max-w-md w-full">
                    <h2 className="text-2xl font-semibold mb-4">Chat Status</h2>
                    <div className="space-y-2">
                        <p><strong>Connection Status:</strong>
                            <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </p>
                        <p><strong>Your Name:</strong> {name || 'Not set'}</p>
                        <p><strong>Total Messages:</strong> {chatLog.length}</p>
                    </div>
                </div>

                <p className="mt-6 text-center text-gray-600 max-w-lg">
                    This chat app uses WebSockets for real-time communication and PeerJS for peer-to-peer connections.
                    Your connection persists across all pages!
                </p>
            </div>
        </section>
    );
}