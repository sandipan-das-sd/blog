import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed', 
            errors: errors.array() 
        });
    }
    next();
};

// User validation rules
export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 100 })
        .withMessage('Name must not exceed 100 characters'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate
];

export const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

// Blog validation rules
export const createBlogValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must not exceed 200 characters'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Excerpt must not exceed 300 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    validate
];

export const updateBlogValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title must not exceed 200 characters'),
    body('content')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Excerpt must not exceed 300 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('status')
        .optional()
        .isIn(['draft', 'published'])
        .withMessage('Status must be either draft or published'),
    validate
];

// Comment validation rules
export const createCommentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),
    body('parentComment')
        .optional()
        .isMongoId()
        .withMessage('Invalid parent comment ID'),
    validate
];

export const updateCommentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),
    validate
];

// ID validation
export const mongoIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),
    validate
];

// ID or Slug validation (for blog routes)
export const idOrSlugValidation = [
    param('id')
        .custom((value) => {
            // Allow MongoDB ObjectId format or slug format
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(value);
            const isSlug = /^[a-z0-9-]+$/.test(value);
            if (!isMongoId && !isSlug) {
                throw new Error('Invalid ID or slug format');
            }
            return true;
        }),
    validate
];

// Pagination validation
export const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    validate
];
