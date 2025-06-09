'use client';
import { useChat, useNavbarOffset } from '@/contexts/ChatContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const { name, joinChat, isConnected } = useChat();
  const [activeRooms, setActiveRooms] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Simple Chat</h1>
          <p className="text-xl mb-8">Connect instantly with friends in real-time chat rooms</p>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-200' : 'bg-red-200'
              }`}></div>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {!name ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-black">Get Started</h2>
            <form
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const inputName = document.getElementById('name').value;
                joinChat(inputName);
                document.getElementById('name').value = '';
              }}
            >
              <input
                id='name'
                type="text"
                className='flex-1 border border-gray-300 text-black p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your name...'
                required
              />
              <button
                type="submit"
                className='bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors'
              >
                Join Chat
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Welcome, {name}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/global"
                className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                <h3 className="text-xl font-semibold mb-2">Global Chat</h3>
                <p>Join the public chat room</p>
              </Link>
              <Link
                href="/create"
                className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600 transition-colors text-center"
              >
                <h3 className="text-xl font-semibold mb-2">Create Room</h3>
                <p>Start your own private room</p>
              </Link>
              <Link
                href="/about"
                className="bg-purple-500 text-white p-6 rounded-lg hover:bg-purple-600 transition-colors text-center"
              >
                <h3 className="text-xl font-semibold mb-2">About</h3>
                <p>Learn more about this app</p>
              </Link>
            </div>
          </div>
        )}

        {/* Active Rooms */}
        {name && activeRooms.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Active Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2">{room.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {room.participants} participant{room.participants !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}