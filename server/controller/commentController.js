import Comment from '../models/Comment.js';
import Blog from '../models/Blogs.js';
import cacheService from '../services/cacheService.js';

// Create comment
export const createComment = async (req, res) => {
    try {
        const { content, parentComment } = req.body;
        const postId = req.params.postId;

        // Check if post exists
        const post = await Blog.findOne({ _id: postId, isDeleted: false });
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog post not found' 
            });
        }

        // If replying to a comment, check if parent exists
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (!parent || parent.post.toString() !== postId) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Parent comment not found' 
                });
            }
        }

        const comment = await Comment.create({
            content,
            author: req.user._id,
            post: postId,
            parentComment: parentComment || null
        });

        await comment.populate('author', 'username name avatar');

        // Invalidate cache
        cacheService.invalidateCache([
            `cache:/api/blogs/${postId}`,
            `cache:/api/comments/post/${postId}`
        ]);

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating comment', 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get comments for a post
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Check if post exists
        const post = await Blog.findOne({ _id: postId, isDeleted: false });
        if (!post) {
            return res.status(404).json({ 
                success: false, 
                message: 'Blog post not found' 
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get top-level comments (not replies)
        const comments = await Comment.find({ 
            post: postId, 
            parentComment: null 
        })
        .populate('author', 'username name avatar')
        .populate({
            path: 'replies',
            populate: { path: 'author', select: 'username name avatar' },
            options: { sort: { createdAt: 1 } }
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

        const total = await Comment.countDocuments({ 
            post: postId, 
            parentComment: null 
        });

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

// Get single comment
export const getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('author', 'username name avatar')
            .populate({
                path: 'replies',
                populate: { path: 'author', select: 'username name avatar' }
            });

        if (!comment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Comment not found' 
            });
        }

        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching comment', 
            error: error.message 
        });
    }
};

// Update comment
export const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Comment not found' 
            });
        }

        // Check ownership
        if (req.user._id.toString() !== comment.author.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only edit your own comments.' 
            });
        }

        const { content } = req.body;
        
        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        await comment.save();

        await comment.populate('author', 'username name avatar');

        // Invalidate cache
        cacheService.invalidateCache([
            `cache:/api/blogs/${comment.post}`,
            `cache:/api/comments/post/${comment.post}`
        ]);

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating comment', 
            error: error.message 
        });
    }
};

// Delete comment
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Comment not found' 
            });
        }

        // Check ownership
        if (req.user._id.toString() !== comment.author.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only delete your own comments.' 
            });
        }

        const postId = comment.post;

        // Delete all replies first
        await Comment.deleteMany({ parentComment: comment._id });
        
        // Delete the comment
        await comment.deleteOne();

        // Invalidate cache
        cacheService.invalidateCache([
            `cache:/api/blogs/${postId}`,
            `cache:/api/comments/post/${postId}`
        ]);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting comment', 
            error: error.message 
        });
    }
};

// Get user's comments
export const getMyComments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const comments = await Comment.find({ author: req.user._id })
            .populate('author', 'username name avatar')
            .populate('post', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Comment.countDocuments({ author: req.user._id });

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
            message: 'Error fetching your comments', 
            error: error.message 
        });
    }
};
