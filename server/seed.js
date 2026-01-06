import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/Users.js';
import Blog from './models/Blogs.js';
import Comment from './models/Comment.js';

dotenv.config();

const sampleUsers = [
    {
        username: 'admin',
        name: 'Admin User',
        email: 'admin@blog.com',
        password: 'Admin123!',
        role: 'admin'
    },
    {
        username: 'john_doe',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user'
    },
    {
        username: 'jane_smith',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123!',
        role: 'user'
    }
];

const sampleBlogs = [
    {
        title: 'Getting Started with MERN Stack',
        content: 'The MERN stack is a popular choice for building modern web applications. It consists of MongoDB, Express.js, React, and Node.js. In this post, we\'ll explore each component and how they work together...',
        excerpt: 'Learn the basics of MERN stack development',
        tags: ['mern', 'javascript', 'web-development'],
        status: 'published'
    },
    {
        title: 'Understanding MongoDB Aggregation',
        content: 'MongoDB aggregation framework is a powerful tool for data processing and analysis. This comprehensive guide will walk you through various aggregation stages and operators...',
        excerpt: 'Master MongoDB aggregation pipeline',
        tags: ['mongodb', 'database', 'tutorial'],
        status: 'published'
    },
    {
        title: 'React Hooks Best Practices',
        content: 'React Hooks have revolutionized how we write React components. In this article, we\'ll discuss best practices for using hooks like useState, useEffect, useContext, and custom hooks...',
        excerpt: 'Write better React code with hooks',
        tags: ['react', 'hooks', 'frontend'],
        status: 'published'
    },
    {
        title: 'Building RESTful APIs with Express',
        content: 'Express.js makes it easy to build robust RESTful APIs. We\'ll cover routing, middleware, error handling, and security best practices for production-ready APIs...',
        excerpt: 'Create professional APIs with Express.js',
        tags: ['express', 'nodejs', 'api'],
        status: 'draft'
    }
];

const sampleComments = [
    {
        content: 'Great article! Very helpful for beginners.',
    },
    {
        content: 'Thanks for sharing this. Looking forward to more content.',
    },
    {
        content: 'Could you elaborate more on the security aspects?',
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-system');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Blog.deleteMany({});
        await Comment.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users
        const users = await User.create(sampleUsers);
        console.log(`✅ Created ${users.length} users`);

        // Create blogs (assign to different users)
        const blogsToCreate = sampleBlogs.map((blog, index) => ({
            ...blog,
            author: users[index % users.length]._id
        }));
        const blogs = await Blog.create(blogsToCreate);
        console.log(`✅ Created ${blogs.length} blogs`);

        // Create comments (assign to different users and blogs)
        const commentsToCreate = sampleComments.map((comment, index) => ({
            ...comment,
            author: users[(index + 1) % users.length]._id,
            post: blogs[index % blogs.length]._id
        }));
        const comments = await Comment.create(commentsToCreate);
        console.log(`✅ Created ${comments.length} comments`);

        console.log('\n📊 Sample Data Summary:');
        console.log('------------------------');
        console.log('Users:');
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.role})`);
            console.log(`    Password: Password123! (or Admin123! for admin)`);
        });
        
        console.log('\n✨ Database seeded successfully!');
        console.log('\n🔐 Login Credentials:');
        console.log('Admin: admin@blog.com / Admin123!');
        console.log('User: john@example.com / Password123!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
