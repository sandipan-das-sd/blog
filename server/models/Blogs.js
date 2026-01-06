import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    excerpt: {
        type: String,
        maxlength: 300
    },
    tags: [{
        type: String,
        trim: true
    }],
    coverImage: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    }
}, {
    timestamps: true
});

// Index for better query performance
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ isDeleted: 1, status: 1 });
blogSchema.index({ tags: 1 });

// Virtual for comments
blogSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

// Soft delete method
blogSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

// Restore method
blogSchema.methods.restore = function() {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
};

// Query helper to exclude deleted posts
blogSchema.query.notDeleted = function() {
    return this.where({ isDeleted: false });
};

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
