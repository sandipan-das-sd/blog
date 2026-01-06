import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import BlogList from './pages/BlogList';
// import BlogDetail from './pages/BlogDetail';
// import CreateBlog from './pages/CreateBlog';
// import MyBlogs from './pages/MyBlogs';
// import AdminDashboard from './pages/AdminDashboard';
// import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<BlogList />} />
              <Route path="/blogs" element={<BlogList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes - Uncomment when components are created */}
              {/* <Route path="/blogs/:id" element={<BlogDetail />} /> */}
              {/* <Route path="/create-blog" element={<PrivateRoute><CreateBlog /></PrivateRoute>} /> */}
              {/* <Route path="/my-blogs" element={<PrivateRoute><MyBlogs /></PrivateRoute>} /> */}
              {/* <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /> */}
              {/* <Route path="/admin/*" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} /> */}
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
