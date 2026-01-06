import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'logout', 'create_post', 'update_post', 'delete_post', 
               'create_comment', 'update_comment', 'delete_comment', 
               'view_post', 'admin_action', 'other']
    },
    details: {
        type: String
    },
    resourceType: {
        type: String,
        enum: ['blog', 'comment', 'user', 'auth', 'other']
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Index for querying logs
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
