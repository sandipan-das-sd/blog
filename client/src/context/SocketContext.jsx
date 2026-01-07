import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000', {
            transports: ['websocket', 'polling'],
            autoConnect: true
        });

        newSocket.on('connect', () => {
            console.log('🔌 Connected to Socket.io');
            setConnected(true);

            // Join with user ID if authenticated
            if (user) {
                newSocket.emit('join', user.id);
            }
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from Socket.io');
            setConnected(false);
        });

        // Listen for new blog posts
        newSocket.on('new-blog', (data) => {
            console.log('📢 New blog posted:', data);
            toast.info(`New blog: ${data.data.title}`, {
                position: 'bottom-right',
                autoClose: 5000
            });
            addNotification(data);
        });

        // Listen for blog updates
        newSocket.on('blog-updated', (data) => {
            console.log('📝 Blog updated:', data);
        });

        // Listen for blog deletions
        newSocket.on('blog-deleted', (data) => {
            console.log('🗑️ Blog deleted:', data);
        });

        // Listen for new comments
        newSocket.on('new-comment', (data) => {
            console.log('💬 New comment:', data);
        });

        // Listen for comment updates
        newSocket.on('comment-updated', (data) => {
            console.log('✏️ Comment updated:', data);
        });

        // Listen for comment deletions
        newSocket.on('comment-deleted', (data) => {
            console.log('🗑️ Comment deleted:', data);
        });

        // Listen for personal notifications
        newSocket.on('notification', (data) => {
            console.log('🔔 Notification:', data);
            toast.info(data.data.message, {
                position: 'top-right',
                autoClose: 5000
            });
            addNotification(data);
        });

        // Listen for user actions
        newSocket.on('user-action', (data) => {
            console.log('👤 User action:', data);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, [user]);

    const addNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const joinBlogRoom = (blogId) => {
        if (socket) {
            socket.emit('join-blog', blogId);
            console.log(`📝 Joined blog room: ${blogId}`);
        }
    };

    const leaveBlogRoom = (blogId) => {
        if (socket) {
            socket.emit('leave-blog', blogId);
            console.log(`📝 Left blog room: ${blogId}`);
        }
    };

    const value = {
        socket,
        connected,
        notifications,
        clearNotifications,
        joinBlogRoom,
        leaveBlogRoom
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
