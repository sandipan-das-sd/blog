# Blog System - MERN Stack

A full-featured blog platform built with MongoDB, Express.js, React, and Node.js (MERN stack) featuring user authentication, role-based access control, post management, commenting system, and admin dashboard.

## 🚀 Features

### 1. User Authentication & Authorization
- ✅ User registration and login with JWT
- ✅ Password hashing with bcryptjs
- ✅ Social authentication (Google & Facebook OAuth)
- ✅ Refresh token mechanism
- ✅ Role-based access control (Admin & Regular User)
- ✅ Secure password change functionality

### 2. User Roles & Permissions
- **Admin**: Full access to manage users, posts, and comments
- **Regular User**: Can create, edit, and delete their own posts and comments

### 3. Post Management
- ✅ CRUD operations for blog posts
- ✅ Soft delete functionality (posts can be restored)
- ✅ Rich post data (title, content, excerpt, tags, cover image)
- ✅ Draft and published status
- ✅ View counter
- ✅ Post ownership validation
- ✅ Search and filter functionality
- ✅ Pagination support

### 4. Comment System
- ✅ Create, read, update, and delete comments
- ✅ Nested comments (replies)
- ✅ Comment ownership validation
- ✅ Edit tracking (shows if comment was edited)

### 5. Admin Panel
- ✅ Dashboard with statistics
  - Total users, posts, and comments
  - Daily statistics
  - Top authors
  - Monthly post trends
- ✅ User management (view, update, delete users)
- ✅ Post management (view all posts including deleted ones)
- ✅ Comment moderation
- ✅ Activity log viewing
- ✅ Cache management

### 6. Advanced Routing
- ✅ Route grouping (auth, blogs, comments, admin)
- ✅ Middleware chaining
- ✅ Protected routes
- ✅ Role-based route access

### 7. Middleware
- ✅ Authentication middleware (JWT verification)
- ✅ Role checking middleware (admin, owner)
- ✅ Activity logging middleware
- ✅ Validation middleware (express-validator)
- ✅ Rate limiting
- ✅ Error handling

### 8. Performance Optimization
- ✅ Caching with node-cache
  - Blog list caching (5 minutes)
  - Comment caching (5 minutes)
  - Trending posts caching (10 minutes)
- ✅ Database indexing
- ✅ Eager loading with Mongoose populate
- ✅ Query optimization
- ✅ Pagination to reduce data load

### 9. Additional Features
- ✅ Activity logging for user actions
- ✅ Social login integration
- ✅ Comprehensive API error handling
- ✅ Input validation
- ✅ RESTful API design
- ✅ CORS configuration
- ✅ Environment-based configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd blog
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Environment Setup

#### Backend (.env file in server directory)
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/blog-system

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
JWT_EXPIRES_IN=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Facebook OAuth (Optional)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:8000/api/auth/facebook/callback
```

#### Frontend (.env file in client directory)
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
mongod
```

Or use MongoDB Atlas (cloud):
- Create a cluster at https://www.mongodb.com/cloud/atlas
- Update MONGODB_URI in your .env file

## 🚀 Running the Application

### Development Mode

#### Start Backend
```bash
cd server
npm run dev
```
Backend runs on http://localhost:8000

#### Start Frontend
```bash
cd client
npm run dev
```
Frontend runs on http://localhost:5173

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| GET | `/api/auth/google` | Google OAuth | No |
| GET | `/api/auth/facebook` | Facebook OAuth | No |

### Blog Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/blogs` | Get all blogs (paginated) | No |
| GET | `/api/blogs/:id` | Get blog by ID | No |
| GET | `/api/blogs/trending` | Get trending blogs | No |
| GET | `/api/blogs/my/posts` | Get user's blogs | Yes |
| POST | `/api/blogs` | Create new blog | Yes |
| PUT | `/api/blogs/:id` | Update blog | Yes (Owner/Admin) |
| DELETE | `/api/blogs/:id` | Soft delete blog | Yes (Owner/Admin) |
| POST | `/api/blogs/:id/restore` | Restore deleted blog | Yes (Admin) |

### Comment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments/post/:postId` | Get comments for post | No |
| GET | `/api/comments/:id` | Get comment by ID | No |
| GET | `/api/comments/my/comments` | Get user's comments | Yes |
| POST | `/api/comments/post/:postId` | Create comment | Yes |
| PUT | `/api/comments/:id` | Update comment | Yes (Owner/Admin) |
| DELETE | `/api/comments/:id` | Delete comment | Yes (Owner/Admin) |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | Get dashboard stats | Yes (Admin) |
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| GET | `/api/admin/users/:id` | Get user by ID | Yes (Admin) |
| PUT | `/api/admin/users/:id` | Update user | Yes (Admin) |
| DELETE | `/api/admin/users/:id` | Delete user | Yes (Admin) |
| GET | `/api/admin/blogs` | Get all blogs (including deleted) | Yes (Admin) |
| DELETE | `/api/admin/blogs/:id/permanent` | Permanently delete blog | Yes (Admin) |
| GET | `/api/admin/comments` | Get all comments | Yes (Admin) |
| GET | `/api/admin/activity-logs` | Get activity logs | Yes (Admin) |
| POST | `/api/admin/cache/clear` | Clear cache | Yes (Admin) |

## 🗂️ Project Structure

```
blog/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utilities (API client)
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
│
└── server/                # Node.js backend
    ├── controller/        # Route controllers
    │   ├── authController.js
    │   ├── blogController.js
    │   ├── commentController.js
    │   └── adminController.js
    ├── middleware/        # Custom middleware
    │   ├── authMiddleware.js
    │   ├── activityLogger.js
    │   └── validators.js
    ├── models/           # Mongoose models
    │   ├── Users.js
    │   ├── Blogs.js
    │   ├── Comment.js
    │   └── ActivityLog.js
    ├── routes/           # API routes
    │   ├── authRoutes.js
    │   ├── blogRoutes.js
    │   ├── commentRoutes.js
    │   └── adminRoutes.js
    ├── services/         # Business logic
    │   └── cacheService.js
    ├── server.js         # Server entry point
    └── package.json
```

## 🔐 Security Features

1. **Password Security**: Bcryptjs hashing with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Refresh Tokens**: Long-lived refresh tokens for session management
4. **Role-Based Access**: Middleware-enforced role checks
5. **Input Validation**: Express-validator for request validation
6. **Rate Limiting**: Protection against brute force attacks
7. **CORS**: Configured cross-origin resource sharing
8. **SQL Injection Protection**: Mongoose sanitization

## 🧪 Testing

```bash
# Backend tests (to be implemented)
cd server
npm test

# Frontend tests (to be implemented)
cd client
npm test
```

## 📦 Database Models

### User Model
- username, name, email, password
- role (user/admin)
- googleId, facebookId (for social auth)
- avatar, isActive, refreshToken
- timestamps

### Blog Model
- title, content, excerpt
- author (ref: User)
- tags, coverImage
- isDeleted, deletedAt (soft delete)
- views, status (draft/published)
- timestamps

### Comment Model
- content
- author (ref: User)
- post (ref: Blog)
- parentComment (for nested comments)
- isEdited, editedAt
- timestamps

### Activity Log Model
- user (ref: User)
- action, details
- resourceType, resourceId
- ipAddress, userAgent
- timestamps

## 🎯 Future Enhancements

- [ ] Real-time notifications (Socket.io or Pusher)
- [ ] Image upload functionality
- [ ] Rich text editor for posts
- [ ] Email notifications
- [ ] Post categories
- [ ] Bookmarking posts
- [ ] User following system
- [ ] Advanced analytics
- [ ] SEO optimization
- [ ] Unit and integration tests
- [ ] API documentation with Swagger
- [ ] Docker containerization

## 👥 Default Admin Account

After first deployment, create an admin user manually in MongoDB or through registration, then update the role:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 📝 License

MIT License

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!
