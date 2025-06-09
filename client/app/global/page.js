'use client';
import { useChat, useNavbarOffset } from '@/contexts/ChatContext';
import { useEffect, useRef } from 'react';

export default function GlobalChat() {
  const { name, chatLog, chatContainerRef, joinChat, sendMessage, scrollToBottom } = useChat();
  const navbarOffset = useNavbarOffset();
  const messageInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatLog.length, scrollToBottom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInputRef.current && messageInputRef.current.value.trim() !== '') {
      sendMessage(messageInputRef.current.value);
      messageInputRef.current.value = ''; // Clear the input field
    }
  };
  return (
    <section className="flex flex-col bg-gray-100 antialiased" style={{ height: navbarOffset.height }}>
      <div className="flex justify-between items-center p-4 bg-white shadow-md z-10">
        <h2 className="text-3xl font-extrabold text-gray-800">Global Chat</h2>
        <div className="text-lg font-medium text-gray-600">
          <span className="font-semibold">Name:</span> {name || 'Guest'}
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chatLog.length === 0 && (
          <div className="text-center text-gray-500 text-lg mt-10">
            No messages yet. Say hello!
          </div>
        )}
        {chatLog.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === name ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-md break-words ${msg.sender === name
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none'
                }`}
            >
              <strong className="block text-sm font-semibold mb-1">
                {msg.sender === name ? 'You' : msg.sender}:
              </strong>
              <p className="text-base">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {name && (
        <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              ref={messageInputRef}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="Type your message here..."
              aria-label="Type your message"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  );
}