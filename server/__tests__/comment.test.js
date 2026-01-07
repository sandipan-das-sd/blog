import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import commentRoutes from '../routes/commentRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import User from '../models/Users.js';
import Blog from '../models/Blogs.js';
import Comment from '../models/Comment.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);

describe('Comment API', () => {
  let authToken;
  let userId;
  let blogId;

  beforeEach(async () => {
    // Create user
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

    // Create blog post
    const blog = await Blog.create({
      title: 'Test Blog',
      content: 'This is a test blog post for comment testing.',
      author: userId,
      status: 'published'
    });

    blogId = blog._id.toString();
  });

  describe('POST /api/comments/post/:postId', () => {
    it('should create a comment on a blog post', async () => {
      const commentData = {
        content: 'This is a test comment.'
      };

      const response = await request(app)
        .post(`/api/comments/post/${blogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('This is a test comment.');
      expect(response.body.data.author.username).toBe('testuser');
    });

    it('should create a reply to a comment', async () => {
      const parentComment = await Comment.create({
        content: 'Parent comment',
        author: userId,
        post: blogId
      });

      const replyData = {
        content: 'This is a reply.',
        parentComment: parentComment._id.toString()
      };

      const response = await request(app)
        .post(`/api/comments/post/${blogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.parentComment).toBe(parentComment._id.toString());
    });

    it('should fail without authentication', async () => {
      const commentData = {
        content: 'This is a test comment.'
      };

      const response = await request(app)
        .post(`/api/comments/post/${blogId}`)
        .send(commentData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with empty content', async () => {
      const commentData = {
        content: ''
      };

      const response = await request(app)
        .post(`/api/comments/post/${blogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent blog post', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';
      const commentData = {
        content: 'Comment on non-existent post.'
      };

      const response = await request(app)
        .post(`/api/comments/post/${fakePostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/comments/post/:postId', () => {
    beforeEach(async () => {
      await Comment.create([
        {
          content: 'First comment',
          author: userId,
          post: blogId
        },
        {
          content: 'Second comment',
          author: userId,
          post: blogId
        }
      ]);
    });

    it('should get all comments for a blog post', async () => {
      const response = await request(app)
        .get(`/api/comments/post/${blogId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/comments/post/${blogId}?page=1&limit=1`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe('PUT /api/comments/:id', () => {
    let commentId;

    beforeEach(async () => {
      const comment = await Comment.create({
        content: 'Original comment content',
        author: userId,
        post: blogId
      });
      commentId = comment._id.toString();
    });

    it('should update own comment', async () => {
      const updates = {
        content: 'Updated comment content'
      };

      const response = await request(app)
        .put(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('Updated comment content');
      expect(response.body.data.isEdited).toBe(true);
    });

    it('should fail to update another user\'s comment', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!'
      });

      const otherComment = await Comment.create({
        content: 'Comment by other user',
        author: otherUser._id,
        post: blogId
      });

      const response = await request(app)
        .put(`/api/comments/${otherComment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Hacked content' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let commentId;

    beforeEach(async () => {
      const comment = await Comment.create({
        content: 'Comment to delete',
        author: userId,
        post: blogId
      });
      commentId = comment._id.toString();
    });

    it('should delete own comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const comment = await Comment.findById(commentId);
      expect(comment).toBeNull();
    });

    it('should delete comment with nested replies', async () => {
      const reply = await Comment.create({
        content: 'Reply to comment',
        author: userId,
        post: blogId,
        parentComment: commentId
      });

      await request(app)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedReply = await Comment.findById(reply._id);
      expect(deletedReply).toBeNull();
    });

    it('should fail to delete another user\'s comment', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!'
      });

      const otherComment = await Comment.create({
        content: 'Comment by other user',
        author: otherUser._id,
        post: blogId
      });

      const response = await request(app)
        .delete(`/api/comments/${otherComment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
