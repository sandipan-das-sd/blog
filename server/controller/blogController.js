import Blog from '../models/Blogs.js';
import Comment from '../models/Comment.js';
import cacheService from '../services/cacheService.js';

// Create new blog post
export const createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, tags, coverImage, status } = req.body;

        const blog = await Blog.create({
            title,
            content,
            excerpt: excerpt || content.substring(0, 200),
            tags: tags || [],
            coverImage: coverImage || '',
            status: status || 'published',
            author: req.user._id
        });

        await blog.populate('author', 'username name avatar');

        // Invalidate blog list cache
        cacheService.invalidateCache(['cache:/api/blogs']);

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: blog
        });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating blog post', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get all blogs with pagination and filters
export const getAllBlogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            author, 
            tag, 
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = { isDeleted: false };

        // Filters
        if (status) query.status = status;
        if (author) query.author = author;
        if (tag) query.tags = tag;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // Only show published posts to non-authors
        if (!req.user || req.user.role !== 'admin') {
            if (!author || (req.user && author !== req.user._id.toString())) {
                query.status = 'published';
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'asc' ? 1 : -1;

        const blogs = await Blog.find(query)
            .populate('author', 'username name avatar')
            .sort({ [sortBy]: sortOrder })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get comment count for each blog
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

// Get single blog by ID
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        })
        .populate('author', 'username name avatar email')
        .populate({
            path: 'comments',
            match: { parentComment: null },
            populate: [
                { path: 'author', select: 'username name avatar' },
                { 
                    path: 'replies',
                    populate: { path: 'author', select: 'username name avatar' }
                }
            ],
            options: { sort: { createdAt: -1 } }
        });

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog post not found' 
            });
        }

        // Check if user can view draft posts
        if (blog.status === 'draft') {
            if (!req.user || 
                (req.user._id.toString() !== blog.author._id.toString() && 
                 req.user.role !== 'admin')) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Access denied' 
                });
            }
        }

        // Increment view count
        blog.views += 1;
        await blog.save();

        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching blog post', 
            error: error.message 
        });
    }
};

// Update blog post
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        });

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog post not found' 
            });
        }

        // Check ownership
        if (req.user._id.toString() !== blog.author.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only edit your own posts.' 
            });
        }

        const { title, content, excerpt, tags, coverImage, status } = req.body;
        const updates = {};

        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (excerpt !== undefined) updates.excerpt = excerpt;
        if (tags !== undefined) updates.tags = tags;
        if (coverImage !== undefined) updates.coverImage = coverImage;
        if (status !== undefined) updates.status = status;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('author', 'username name avatar');

        // Invalidate cache
        cacheService.invalidateCache(['cache:/api/blogs']);

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating blog post', 
            error: error.message 
        });
    }
};

// Soft delete blog post
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            _id: req.params.id, 
            isDeleted: false 
        });

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog post not found' 
            });
        }

        // Check ownership
        if (req.user._id.toString() !== blog.author.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only delete your own posts.' 
            });
        }

        await blog.softDelete();

        // Invalidate cache
        cacheService.invalidateCache(['cache:/api/blogs']);

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting blog post', 
            error: error.message 
        });
    }
};

// Restore soft deleted blog post (Admin only)
export const restoreBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            _id: req.params.id, 
            isDeleted: true 
        });

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Deleted blog post not found' 
            });
        }

        await blog.restore();

        // Invalidate cache
        cacheService.invalidateCache(['cache:/api/blogs']);

        res.json({
            success: true,
            message: 'Blog post restored successfully',
            data: blog
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error restoring blog post', 
            error: error.message 
        });
    }
};

// Get user's own blogs
export const getMyBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = { 
            author: req.user._id, 
            isDeleted: false 
        };

        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const blogs = await Blog.find(query)
            .populate('author', 'username name avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            data: blogs,
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
            message: 'Error fetching your blogs', 
            error: error.message 
        });
    }
};

// Get trending/popular blogs
export const getTrendingBlogs = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const blogs = await Blog.find({ 
            isDeleted: false, 
            status: 'published' 
        })
        .populate('author', 'username name avatar')
        .sort({ views: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .lean();

        const blogsWithComments = await Promise.all(
            blogs.map(async (blog) => {
                const commentCount = await Comment.countDocuments({ post: blog._id });
                return { ...blog, commentCount };
            })
        );

        res.json({
            success: true,
            data: blogsWithComments
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching trending blogs', 
            error: error.message 
        });
    }
};
