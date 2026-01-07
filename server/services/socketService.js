import { Server } from 'socket.io';

class SocketService {
    constructor() {
        this.io = null;
        this.users = new Map(); // Map of userId to socketId
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            console.log('🔌 New client connected:', socket.id);

            // User joins with their ID
            socket.on('join', (userId) => {
                if (userId) {
                    this.users.set(userId, socket.id);
                    socket.userId = userId;
                    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
                }
            });

            // Join blog room for real-time comments
            socket.on('join-blog', (blogId) => {
                socket.join(`blog-${blogId}`);
                console.log(`📝 Socket ${socket.id} joined blog room: ${blogId}`);
            });

            // Leave blog room
            socket.on('leave-blog', (blogId) => {
                socket.leave(`blog-${blogId}`);
                console.log(`📝 Socket ${socket.id} left blog room: ${blogId}`);
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                if (socket.userId) {
                    this.users.delete(socket.userId);
                    console.log(`👤 User ${socket.userId} disconnected`);
                }
                console.log('🔌 Client disconnected:', socket.id);
            });
        });

        return this.io;
    }

    // Emit new blog post to all connected users
    emitNewBlog(blog) {
        if (this.io) {
            this.io.emit('new-blog', {
                type: 'new-blog',
                data: blog,
                message: `New blog post: ${blog.title}`,
                timestamp: new Date()
            });
            console.log('📢 Emitted new blog:', blog.title);
        }
    }

    // Emit new comment to users in blog room
    emitNewComment(blogId, comment) {
        if (this.io) {
            this.io.to(`blog-${blogId}`).emit('new-comment', {
                type: 'new-comment',
                data: comment,
                blogId,
                message: 'New comment on this post',
                timestamp: new Date()
            });
            console.log(`💬 Emitted new comment for blog ${blogId}`);
        }
    }

    // Emit comment update
    emitCommentUpdate(blogId, comment) {
        if (this.io) {
            this.io.to(`blog-${blogId}`).emit('comment-updated', {
                type: 'comment-updated',
                data: comment,
                blogId,
                timestamp: new Date()
            });
        }
    }

    // Emit comment deletion
    emitCommentDelete(blogId, commentId) {
        if (this.io) {
            this.io.to(`blog-${blogId}`).emit('comment-deleted', {
                type: 'comment-deleted',
                commentId,
                blogId,
                timestamp: new Date()
            });
        }
    }

    // Emit blog update to all users
    emitBlogUpdate(blog) {
        if (this.io) {
            this.io.emit('blog-updated', {
                type: 'blog-updated',
                data: blog,
                message: `Blog updated: ${blog.title}`,
                timestamp: new Date()
            });
            this.io.to(`blog-${blog._id}`).emit('blog-updated', {
                type: 'blog-updated',
                data: blog,
                timestamp: new Date()
            });
        }
    }

    // Emit blog deletion
    emitBlogDelete(blogId) {
        if (this.io) {
            this.io.emit('blog-deleted', {
                type: 'blog-deleted',
                blogId,
                timestamp: new Date()
            });
        }
    }

    // Send notification to specific user
    notifyUser(userId, notification) {
        const socketId = this.users.get(userId.toString());
        if (socketId && this.io) {
            this.io.to(socketId).emit('notification', {
                type: 'notification',
                data: notification,
                timestamp: new Date()
            });
            console.log(`🔔 Sent notification to user ${userId}`);
        }
    }

    // Broadcast user action (login, logout, etc.)
    broadcastUserAction(action, user) {
        if (this.io) {
            this.io.emit('user-action', {
                type: 'user-action',
                action,
                user: {
                    id: user._id,
                    username: user.username,
                    name: user.name
                },
                timestamp: new Date()
            });
        }
    }

    getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized');
        }
        return this.io;
    }
}

export default new SocketService();
