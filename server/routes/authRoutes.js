import express from 'express';
import passport from 'passport';
import {
    register,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    updateProfile,
    changePassword,
    socialAuthCallback
} from '../controller/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { registerValidation, loginValidation } from '../middleware/validators.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, logActivity('login', 'auth'), register);
router.post('/login', loginValidation, logActivity('login', 'auth'), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logActivity('logout', 'auth'), logout);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, logActivity('other', 'user'), updateProfile);
router.put('/change-password', authenticate, logActivity('other', 'auth'), changePassword);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/error' }),
    socialAuthCallback
);

// Facebook OAuth routes
router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);
router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/auth/error' }),
    socialAuthCallback
);

export default router;
