import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllBlogsAdmin,
    permanentlyDeleteBlog,
    getAllCommentsAdmin,
    clearCache
} from '../controller/adminController.js';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import { mongoIdValidation, paginationValidation } from '../middleware/validators.js';
import { getUserActivityLogs, logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', paginationValidation, getAllUsers);
router.get('/users/:id', mongoIdValidation, getUserById);
router.put('/users/:id', mongoIdValidation, logActivity('admin_action', 'user'), updateUser);
router.delete('/users/:id', mongoIdValidation, logActivity('admin_action', 'user'), deleteUser);

// Blog management
router.get('/blogs', paginationValidation, getAllBlogsAdmin);
router.delete('/blogs/:id/permanent', 
    mongoIdValidation, 
    logActivity('admin_action', 'blog'),
    permanentlyDeleteBlog
);

// Comment management
router.get('/comments', paginationValidation, getAllCommentsAdmin);

// Activity logs
router.get('/activity-logs', getUserActivityLogs);

// Cache management
router.post('/cache/clear', logActivity('admin_action', 'other'), clearCache);

export default router;
