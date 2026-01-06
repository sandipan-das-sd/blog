import User from '../models/Users.js';
import Blog from '../models/Blogs.js';
import Comment from '../models/Comment.js';
import ActivityLog from '../models/ActivityLog.js';
import cacheService from '../services/cacheService.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalBlogs,
            totalComments,
            activeUsers,
            publishedBlogs,
            draftBlogs,
            deletedBlogs,
            todayUsers,
            todayBlogs,
            todayComments
        ] = await Promise.all([
            User.countDocuments(),
            Blog.countDocuments({ isDeleted: false }),
            Comment.countDocuments(),
            User.countDocuments({ isActive: true }),
            Blog.countDocuments({ status: 'published', isDeleted: false }),
            Blog.countDocuments({ status: 'draft', isDeleted: false }),
            Blog.countDocuments({ isDeleted: true }),
            User.countDocuments({ 
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
            }),
            Blog.countDocuments({ 
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                isDeleted: false 
            }),
            Comment.countDocuments({ 
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
            })
        ]);

        // Get recent activities
        const recentActivities = await ActivityLog.find()
            .populate('user', 'username name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get top authors
        const topAuthors = await Blog.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$author', postCount: { $sum: 1 } } },
            { $sort: { postCount: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'author'
            }},
            { $unwind: '$author' },
            { $project: {
                _id: '$author._id',
                username: '$author.username',
                name: '$author.name',
                avatar: '$author.avatar',
                postCount: 1
            }}
        ]);

        // Get monthly stats for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyBlogStats = await Blog.aggregate([
            { $match: { 
                createdAt: { $gte: sixMonthsAgo },
                isDeleted: false 
            }},
            { $group: {
                _id: { 
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalBlogs,
                    totalComments,
                    activeUsers,
                    publishedBlogs,
                    draftBlogs,
                    deletedBlogs
                },
                today: {
                    users: todayUsers,
                    blogs: todayBlogs,
                    comments: todayComments
                },
                topAuthors,
                recentActivities,
                monthlyBlogStats,
                cacheStats: cacheService.getStats()
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching dashboard statistics', 
            error: error.message 
        });
    }
};

// Get all users (with filters)
export const getAllUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            role, 
            isActive, 
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = {};

        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ [sortBy]: sortOrder })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get post count for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const postCount = await Blog.countDocuments({ 
                    author: user._id, 
                    isDeleted: false 
                });
                const commentCount = await Comment.countDocuments({ author: user._id });
                return { ...user, postCount, commentCount };
            })
        );

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: usersWithStats,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users', 
            error: error.message 
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Get user stats
        const [postCount, commentCount, recentPosts, recentComments] = await Promise.all([
            Blog.countDocuments({ author: user._id, isDeleted: false }),
            Comment.countDocuments({ author: user._id }),
            Blog.find({ author: user._id, isDeleted: false })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('title status createdAt views'),
            Comment.find({ author: user._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('post', 'title')
        ]);

        res.json({
            success: true,
            data: {
                ...user.toObject(),
                stats: {
                    postCount,
                    commentCount
                },
                recentPosts,
                recentComments
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user', 
            error: error.message 
        });
    }
};

// Update user (admin)
export const updateUser = async (req, res) => {
    try {
        const { name, username, email, role, isActive } = req.body;
        const updates = {};

        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (role !== undefined) updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive;
        
        if (username !== undefined) {
            // Check if username is taken
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: req.params.id } 
            });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username already taken' 
                });
            }
            updates.username = username;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating user', 
            error: error.message 
        });
    }
};

// Delete user (admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Prevent self-deletion
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }

        // Soft delete user's posts
        await Blog.updateMany(
            { author: user._id },
            { isDeleted: true, deletedAt: new Date() }
        );

        // Delete user
        await user.deleteOne();

        res.json({
            success: true,
            message: 'User and their posts deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting user', 
            error: error.message 
        });
    }
};

// Get all blogs (admin view - includes deleted)
export const getAllBlogsAdmin = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            author, 
            isDeleted,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = {};

        if (status) query.status = status;
        if (author) query.author = author;
        if (isDeleted !== undefined) query.isDeleted = isDeleted === 'true';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        const blogs = await Blog.find(query)
            .populate('author', 'username name email avatar')
            .sort({ [sortBy]: sortOrder })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const blogsWithComments = await Promise.all(
            blogs.map(async (blog) => {
                const commentCount = await Comment.countDocuments({ post: blog._id });
                return { ...blog, commentCount };
            })
        );

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            data: blogsWithComments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching blogs', 
            error: error.message 
        });
    }
};

// Permanently delete blog (admin)
export const permanentlyDeleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog post not found' 
            });
        }

        // Delete all comments
        await Comment.deleteMany({ post: blog._id });

        // Delete blog
        await blog.deleteOne();

        // Invalidate cache
        cacheService.invalidateCache(['cache:/api/blogs']);

        res.json({
            success: true,
            message: 'Blog post and its comments permanently deleted'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting blog post', 
            error: error.message 
        });
    }
};

// Get all comments (admin view)
export const getAllCommentsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 50, author, post } = req.query;

        const query = {};
        if (author) query.author = author;
        if (post) query.post = post;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const comments = await Comment.find(query)
            .populate('author', 'username name email')
            .populate('post', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Comment.countDocuments(query);

        res.json({
            success: true,
            data: comments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching comments', 
            error: error.message 
        });
    }
};

// Clear cache (admin)
export const clearCache = async (req, res) => {
    try {
        cacheService.flush();
        
        res.json({
            success: true,
            message: 'Cache cleared successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing cache', 
            error: error.message 
        });
    }
};
