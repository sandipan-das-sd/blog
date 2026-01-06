import express from 'express';
import {
    createComment,
    getCommentsByPost,
    getCommentById,
    updateComment,
    deleteComment,
    getMyComments
} from '../controller/commentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
    createCommentValidation, 
    updateCommentValidation,
    mongoIdValidation,
    paginationValidation 
} from '../middleware/validators.js';
import { logActivity } from '../middleware/activityLogger.js';
import cacheService from '../services/cacheService.js';

const router = express.Router();

// Get comments for a post (public)
router.get('/post/:postId', 
    paginationValidation,
    cacheService.cacheMiddleware(300), // Cache for 5 minutes
    getCommentsByPost
);

// Get single comment (public)
router.get('/:id', 
    mongoIdValidation,
    getCommentById
);

// Protected routes
router.post('/post/:postId', 
    authenticate, 
    createCommentValidation,
    logActivity('create_comment', 'comment'),
    createComment
);

router.get('/my/comments', 
    authenticate,
    paginationValidation,
    getMyComments
);

router.put('/:id', 
    authenticate,
    mongoIdValidation,
    updateCommentValidation,
    logActivity('update_comment', 'comment'),
    updateComment
);

router.delete('/:id', 
    authenticate,
    mongoIdValidation,
    logActivity('delete_comment', 'comment'),
    deleteComment
);

export default router;
