import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import blogRoutes from '../routes/blogRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import User from '../models/Users.js';
import Blog from '../models/Blogs.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

describe('Blog API', () => {
  let authToken;
  let userId;
  let adminToken;
  let adminId;

  beforeEach(async () => {
    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

    authToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin'
    });

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!'
      });

    adminToken = adminLoginResponse.body.data.token;
    adminId = adminUser._id;
  });

  describe('POST /api/blogs', () => {
    it('should create a new blog post', async () => {
      const blogData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post content that is long enough.',
        excerpt: 'Short excerpt',
        tags: ['test', 'jest'],
        status: 'published'
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Test Blog Post');
      expect(response.body.data).toHaveProperty('slug');
      expect(response.body.data.slug).toContain('test-blog-post');
      expect(response.body.data.author.username).toBe('testuser');
    });

    it('should fail without authentication', async () => {
      const blogData = {
        title: 'Test Blog Post',
        content: 'This is a test blog post content.',
      };

      const response = await request(app)
        .post('/api/blogs')
        .send(blogData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const blogData = {
        title: '',
        content: 'Short'
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/blogs', () => {
    beforeEach(async () => {
      // Create test blogs
      await Blog.create([
        {
          title: 'Blog 1',
          content: 'Content 1 with sufficient length for testing purposes.',
          author: userId,
          status: 'published'
        },
        {
          title: 'Blog 2',
          content: 'Content 2 with sufficient length for testing purposes.',
          author: userId,
          status: 'published'
        },
        {
          title: 'Draft Blog',
          content: 'Draft content with sufficient length for testing.',
          author: userId,
          status: 'draft'
        }
      ]);
    });

    it('should get all published blogs', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2); // Only published
      expect(response.body.pagination).toHaveProperty('total', 2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/blogs?page=1&limit=1')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/blogs?search=Blog 1')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain('Blog 1');
    });
  });

  describe('GET /api/blogs/:id', () => {
    let blogId;
    let blogSlug;

    beforeEach(async () => {
      const blog = await Blog.create({
        title: 'Test Blog for Retrieval',
        content: 'This is the content for testing blog retrieval functionality.',
        author: userId,
        status: 'published'
      });
      blogId = blog._id.toString();
      blogSlug = blog.slug;
    });

    it('should get blog by ID', async () => {
      const response = await request(app)
        .get(`/api/blogs/${blogId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Blog for Retrieval');
    });

    it('should get blog by slug', async () => {
      const response = await request(app)
        .get(`/api/blogs/${blogSlug}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Blog for Retrieval');
    });

    it('should increment view count', async () => {
      await request(app).get(`/api/blogs/${blogId}`);
      await request(app).get(`/api/blogs/${blogId}`);

      const blog = await Blog.findById(blogId);
      expect(blog.views).toBe(2);
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/blogs/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/blogs/:id', () => {
    let blogId;

    beforeEach(async () => {
      const blog = await Blog.create({
        title: 'Original Title',
        content: 'Original content for testing update functionality.',
        author: userId,
        status: 'published'
      });
      blogId = blog._id.toString();
    });

    it('should update own blog post', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should fail to update another user\'s blog', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!'
      });

      const otherBlog = await Blog.create({
        title: 'Other User Blog',
        content: 'Content by other user for testing permissions.',
        author: otherUser._id,
        status: 'published'
      });

      const response = await request(app)
        .put(`/api/blogs/${otherBlog._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should allow admin to update any blog', async () => {
      const updates = {
        title: 'Admin Updated Title'
      };

      const response = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Admin Updated Title');
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    let blogId;

    beforeEach(async () => {
      const blog = await Blog.create({
        title: 'Blog to Delete',
        content: 'Content for blog that will be deleted during testing.',
        author: userId,
        status: 'published'
      });
      blogId = blog._id.toString();
    });

    it('should soft delete own blog post', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const blog = await Blog.findById(blogId);
      expect(blog.isDeleted).toBe(true);
      expect(blog.deletedAt).toBeTruthy();
    });

    it('should fail to delete another user\'s blog', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!'
      });

      const otherBlog = await Blog.create({
        title: 'Other User Blog',
        content: 'Content by other user.',
        author: otherUser._id,
        status: 'published'
      });

      const response = await request(app)
        .delete(`/api/blogs/${otherBlog._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/blogs/trending', () => {
    beforeEach(async () => {
      await Blog.create([
        {
          title: 'Popular Blog',
          content: 'This blog is very popular.',
          author: userId,
          views: 100,
          status: 'published'
        },
        {
          title: 'Less Popular Blog',
          content: 'This blog is less popular.',
          author: userId,
          views: 10,
          status: 'published'
        }
      ]);
    });

    it('should get trending blogs sorted by views', async () => {
      const response = await request(app)
        .get('/api/blogs/trending?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].title).toBe('Popular Blog');
      expect(response.body.data[0].views).toBeGreaterThan(response.body.data[1].views);
    });
  });
});
