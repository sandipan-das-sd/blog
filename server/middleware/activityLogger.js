import ActivityLog from '../models/ActivityLog.js';

// Log user activities
export const logActivity = (action, resourceType = 'other') => {
    return async (req, res, next) => {
        // Save original res.json to intercept response
        const originalJson = res.json.bind(res);

        res.json = async function(data) {
            // Only log successful operations
            if (req.user && res.statusCode < 400) {
                try {
                    const logEntry = {
                        user: req.user._id,
                        action,
                        resourceType,
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.headers['user-agent']
                    };

                    // Add resource ID if available
                    if (req.params?.id) {
                        logEntry.resourceId = req.params.id;
                    } else if (data?.data?._id) {
                        logEntry.resourceId = data.data._id;
                    }

                    // Add details
                    if (req.method && req.originalUrl) {
                        logEntry.details = `${req.method} ${req.originalUrl}`;
                    }

                    await ActivityLog.create(logEntry);
                } catch (error) {
                    console.error('Activity logging error:', error.message);
                    // Don't fail the request if logging fails
                }
            }

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

// Get user activity logs (admin only)
export const getUserActivityLogs = async (req, res) => {
    try {
        const { userId, action, limit = 50, page = 1 } = req.query;
        
        const query = {};
        if (userId) query.user = userId;
        if (action) query.action = action;

        const logs = await ActivityLog.find(query)
            .populate('user', 'username name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await ActivityLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching activity logs', 
            error: error.message 
        });
    }
};
