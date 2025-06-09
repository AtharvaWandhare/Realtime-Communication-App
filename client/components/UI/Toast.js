'use client';
import React, { useState, useEffect } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };
        
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast 
                    key={toast.id} 
                    toast={toast} 
                    onClose={() => onRemove(toast.id)} 
                />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }) {
    const { message, type } = toast;
    
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500 text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-blue-500 text-white';
        }
    };

    return (
        <div className={`${getTypeStyles()} px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-72 animate-slide-in`}>
            <span>{message}</span>
            <button 
                onClick={onClose}
                className="ml-4 text-white hover:text-gray-200 font-bold"
            >
                ×
            </button>
        </div>
    );
}
