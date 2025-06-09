'use client';
import { useChat } from "@/contexts/ChatContext";
import Link from "next/link";

export default function Navbar() {
    const { isConnected, name, leaveChat, navbarHeight } = useChat();

    return (
        <>
            <nav className="p-4 bg-black border-b fixed top-0 w-full">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-white text-lg font-semibold">
                        Chat App
                    </div>
                    <div>
                        <Link href="#" className="hover:text-white px-3 py-2 rounded-md text-sm font-medium">{!isConnected ? (<span className="text-red-500">🔴 Connecting</span>) : (<span className="text-green-500">🟢 Connected</span>)}</Link>
                        <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                        <Link href="/chat/video-chat" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Video Chat</Link>
                        <Link href="/create" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Create</Link>
                        <Link href="/global" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Global Chat</Link>
                        <Link href="/about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</Link>
                        {isConnected && name ? (
                            <>
                                <Link href="#" onClick={leaveChat} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Logout</Link>
                                <Link href={'#'} className="px-4 py-1 bg-white rounded-md text-sm font-medium text-sky-500 hover:bg-gray-300">{name}</Link>
                            </>
                        ) : (
                            <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                        )}
                    </div>
                </div>
            </nav>
            <div className="spacer" style={{ height: `${navbarHeight}px` }}></div>
        </>
    );
}