import User from '../models/Users.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Generate refresh token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Register new user
export const register = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken' 
            });
        }

        // Create new user
        const user = await User.create({
            username,
            name,
            email,
            password,
            role: 'user'
        });

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toPublicJSON(),
                token,
                refreshToken
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error registering user', 
            error: error.message 
        });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ 
                success: false, 
                message: 'Account is deactivated. Please contact admin.' 
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toPublicJSON(),
                token,
                refreshToken
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error logging in', 
            error: error.message 
        });
    }
};

// Logout user
export const logout = async (req, res) => {
    try {
        // Clear refresh token
        req.user.refreshToken = null;
        await req.user.save();

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error logging out', 
            error: error.message 
        });
    }
};

// Refresh access token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ 
                success: false, 
                message: 'Refresh token required' 
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        // Find user
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid refresh token' 
            });
        }

        // Generate new access token
        const newToken = generateToken(user._id);

        res.json({
            success: true,
            data: {
                token: newToken
            }
        });
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired refresh token' 
        });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.user.toPublicJSON()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user data', 
            error: error.message 
        });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, username, avatar } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (username) {
            // Check if username is taken
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: req.user._id } 
            });
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username already taken' 
                });
            }
            updates.username = username;
        }
        if (avatar) updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user.toPublicJSON()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isPasswordValid = await req.user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error changing password', 
            error: error.message 
        });
    }
};

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            let user = await User.findOne({ googleId: profile.id });
            
            if (!user) {
                // Check if email exists
                user = await User.findOne({ email: profile.emails[0].value });
                
                if (user) {
                    // Link Google account
                    user.googleId = profile.id;
                    if (!user.avatar && profile.photos?.[0]?.value) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
                        avatar: profile.photos?.[0]?.value || '',
                        role: 'user'
                    });
                }
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
}

// Configure Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'photos']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            let user = await User.findOne({ facebookId: profile.id });
            
            if (!user) {
                // Check if email exists
                user = await User.findOne({ email: profile.emails?.[0]?.value });
                
                if (user) {
                    // Link Facebook account
                    user.facebookId = profile.id;
                    if (!user.avatar && profile.photos?.[0]?.value) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        facebookId: profile.id,
                        email: profile.emails?.[0]?.value || `facebook_${profile.id}@temp.com`,
                        name: `${profile.name.givenName} ${profile.name.familyName}`,
                        username: (profile.emails?.[0]?.value?.split('@')[0] || 'fb_user') + '_' + Date.now(),
                        avatar: profile.photos?.[0]?.value || '',
                        role: 'user'
                    });
                }
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
}

// Social auth callback handler
export const socialAuthCallback = async (req, res) => {
    try {
        // Generate tokens
        const token = generateToken(req.user._id);
        const refreshToken = generateRefreshToken(req.user._id);

        // Save refresh token
        req.user.refreshToken = refreshToken;
        await req.user.save();

        // Redirect to frontend with token
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendURL}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendURL}/auth/error?message=Authentication failed`);
    }
};
