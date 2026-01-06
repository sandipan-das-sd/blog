# API Testing Guide

Use this guide to test the API with Postman, Thunder Client, or any HTTP client.

## Base URL
```
http://localhost:8000/api
```

---

## 📝 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Body (JSON):**
```json
{
  "username": "testuser",
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "username": "testuser", "email": "...", "role": "user" },
    "token": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### 2. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Response:** Same as register

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "createdAt": "..."
  }
}
```

### 4. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

### 5. Update Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Updated Name",
  "username": "newusername",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 6. Change Password
**PUT** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

---

## 📰 Blog Endpoints

### 1. Get All Blogs (Public)
**GET** `/blogs?page=1&limit=10&search=keyword&tag=javascript&status=published`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in title/content
- `tag` (optional): Filter by tag
- `status` (optional): Filter by status (draft/published)
- `author` (optional): Filter by author ID
- `sortBy` (optional): Sort field (default: createdAt)
- `order` (optional): asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Blog Title",
      "content": "...",
      "excerpt": "...",
      "author": { "username": "...", "name": "..." },
      "tags": ["tag1", "tag2"],
      "views": 10,
      "commentCount": 5,
      "createdAt": "...",
      "status": "published"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### 2. Get Single Blog
**GET** `/blogs/:id`

**Response:** Includes full blog with comments

### 3. Get Trending Blogs
**GET** `/blogs/trending?limit=5`

### 4. Create Blog (Auth Required)
**POST** `/blogs`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "My New Blog Post",
  "content": "This is the full content of my blog post...",
  "excerpt": "Short description",
  "tags": ["javascript", "react", "tutorial"],
  "coverImage": "https://example.com/image.jpg",
  "status": "published"
}
```

### 5. Update Blog (Auth Required - Owner/Admin)
**PUT** `/blogs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** Same as create (all fields optional)

### 6. Delete Blog (Auth Required - Owner/Admin)
**DELETE** `/blogs/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### 7. Get My Blogs
**GET** `/blogs/my/posts?page=1&limit=10&status=draft`

**Headers:**
```
Authorization: Bearer <token>
```

---

## 💬 Comment Endpoints

### 1. Get Comments for Post
**GET** `/comments/post/:postId?page=1&limit=20`

### 2. Create Comment (Auth Required)
**POST** `/comments/post/:postId`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "content": "Great post! Very informative.",
  "parentComment": null
}
```

For replies, include parent comment ID:
```json
{
  "content": "Thanks for the feedback!",
  "parentComment": "parent_comment_id_here"
}
```

### 3. Update Comment (Auth Required - Owner/Admin)
**PUT** `/comments/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "content": "Updated comment text"
}
```

### 4. Delete Comment (Auth Required - Owner/Admin)
**DELETE** `/comments/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### 5. Get My Comments
**GET** `/comments/my/comments?page=1&limit=20`

**Headers:**
```
Authorization: Bearer <token>
```

---

## 👑 Admin Endpoints

**All admin endpoints require admin role**

### 1. Get Dashboard Statistics
**GET** `/admin/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 100,
      "totalBlogs": 500,
      "totalComments": 1500,
      "activeUsers": 95,
      "publishedBlogs": 450,
      "draftBlogs": 50
    },
    "today": {
      "users": 5,
      "blogs": 10,
      "comments": 25
    },
    "topAuthors": [...],
    "recentActivities": [...],
    "monthlyBlogStats": [...],
    "cacheStats": {...}
  }
}
```

### 2. Get All Users
**GET** `/admin/users?page=1&limit=20&role=user&isActive=true&search=john`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: Filter by role (user/admin)
- `isActive`: Filter by active status (true/false)
- `search`: Search in username/name/email
- `sortBy`: Field to sort by
- `order`: asc/desc

### 3. Get User by ID
**GET** `/admin/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### 4. Update User
**PUT** `/admin/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Updated Name",
  "role": "admin",
  "isActive": false
}
```

### 5. Delete User
**DELETE** `/admin/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

### 6. Get All Blogs (Admin View)
**GET** `/admin/blogs?page=1&limit=20&isDeleted=true`

**Headers:**
```
Authorization: Bearer <token>
```

### 7. Permanently Delete Blog
**DELETE** `/admin/blogs/:id/permanent`

**Headers:**
```
Authorization: Bearer <token>
```

### 8. Get All Comments (Admin View)
**GET** `/admin/comments?page=1&limit=50&author=userId&post=postId`

**Headers:**
```
Authorization: Bearer <token>
```

### 9. Get Activity Logs
**GET** `/admin/activity-logs?userId=...&action=login&page=1&limit=50`

**Headers:**
```
Authorization: Bearer <token>
```

### 10. Clear Cache
**POST** `/admin/cache/clear`

**Headers:**
```
Authorization: Bearer <token>
```

---

## 🧪 Testing Workflow

### 1. Setup
1. Start backend server
2. Seed database: `npm run seed` in server directory
3. Use provided credentials or create new account

### 2. Get Authentication Token
```bash
# Login as admin
POST /api/auth/login
{
  "email": "admin@blog.com",
  "password": "Admin123!"
}

# Save the token from response
```

### 3. Test Public Endpoints (No Auth)
- GET /api/blogs
- GET /api/blogs/:id
- GET /api/blogs/trending
- GET /api/comments/post/:postId

### 4. Test Protected Endpoints (With Token)
- POST /api/blogs (create blog)
- PUT /api/blogs/:id (update own blog)
- POST /api/comments/post/:postId (create comment)
- GET /api/blogs/my/posts

### 5. Test Admin Endpoints (Admin Token)
- GET /api/admin/dashboard
- GET /api/admin/users
- PUT /api/admin/users/:id
- DELETE /api/admin/blogs/:id/permanent

---

## 📋 Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Blog System API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Password123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8000/api/auth/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["api", "auth", "register"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## ✅ Response Status Codes

- `200` - OK (Successful GET, PUT, DELETE)
- `201` - Created (Successful POST)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Missing/invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `500` - Internal Server Error

---

## 🔐 Authentication Flow

1. Register or Login → Get token
2. Store token securely
3. Include in Authorization header for protected routes:
   ```
   Authorization: Bearer <your_token>
   ```
4. Token expires in 7 days
5. Use refresh token to get new access token:
   ```
   POST /api/auth/refresh-token
   Body: { "refreshToken": "..." }
   ```

---

## 💡 Tips

1. Use environment variables in Postman for `baseUrl` and `token`
2. Create a "Login" request and save token to environment
3. Use Postman's "Tests" tab to auto-save tokens
4. Test error cases (invalid data, missing auth, etc.)
5. Verify pagination works correctly
6. Test with different user roles

---

Happy Testing! 🚀
