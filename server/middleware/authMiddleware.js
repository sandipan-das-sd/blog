import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

// Authenticate user with JWT
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header, cookie, or query
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies?.token || 
                     req.query.token;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id).select('-password -refreshToken');
        
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token or user not found.' 
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired.' 
            });
        }
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
    }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin privileges required.' 
        });
    }
};

// Check if user owns the resource or is admin
export const isOwnerOrAdmin = (resourceField = 'author') => {
    return (req, res, next) => {
        const resourceOwnerId = req.resource?.[resourceField]?.toString() || 
                               req.params?.userId;
        
        if (req.user.role === 'admin' || 
            req.user._id.toString() === resourceOwnerId) {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You do not have permission to perform this action.' 
            });
        }
    };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies?.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password -refreshToken');
            if (user && user.isActive) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently fail for optional auth
    }
    next();
};
