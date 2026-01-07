import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    restoreBlog,
    getMyBlogs,
    getTrendingBlogs
} from '../controller/blogController.js';
import { authenticate, optionalAuth, isAdmin } from '../middleware/authMiddleware.js';
import { 
    createBlogValidation, 
    updateBlogValidation, 
    mongoIdValidation,
    idOrSlugValidation,
    paginationValidation 
} from '../middleware/validators.js';
import { logActivity } from '../middleware/activityLogger.js';
import cacheService from '../services/cacheService.js';

const router = express.Router();

// Public routes (with optional auth for user-specific content)
router.get('/', 
    optionalAuth, 
    paginationValidation,
    cacheService.cacheMiddleware(300), // Cache for 5 minutes
    getAllBlogs
);

router.get('/trending', 
    cacheService.cacheMiddleware(600), // Cache for 10 minutes
    getTrendingBlogs
);

router.get('/:id', 
    optionalAuth, 
    idOrSlugValidation,
    getBlogById
);

// Protected routes
router.post('/', 
    authenticate, 
    createBlogValidation,
    logActivity('create_post', 'blog'),
    createBlog
);

router.get('/my/posts', 
    authenticate,
    paginationValidation,
    getMyBlogs
);

router.put('/:id', 
    authenticate, 
    idOrSlugValidation,
    updateBlogValidation,
    logActivity('update_post', 'blog'),
    updateBlog
);

router.delete('/:id', 
    authenticate, 
    idOrSlugValidation,
    logActivity('delete_post', 'blog'),
    deleteBlog
);

// Admin only routes
router.post('/:id/restore', 
    authenticate,
    isAdmin,
    idOrSlugValidation,
    logActivity('admin_action', 'blog'),
    restoreBlog
);

export default router;
