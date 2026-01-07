import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI, blogAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FaUsers, FaBlog, FaComments, FaEye, FaTrash, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getDashboard();
            setStats(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex gap-4">
                    <Link
                        to="/admin"
                        className={`px-4 py-2 border-b-2 font-medium ${
                            location.pathname === '/admin'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Overview
                    </Link>
                    <Link
                        to="/admin/users"
                        className={`px-4 py-2 border-b-2 font-medium ${
                            location.pathname === '/admin/users'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Users
                    </Link>
                    <Link
                        to="/admin/blogs"
                        className={`px-4 py-2 border-b-2 font-medium ${
                            location.pathname === '/admin/blogs'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Blogs
                    </Link>
                    <Link
                        to="/admin/activity"
                        className={`px-4 py-2 border-b-2 font-medium ${
                            location.pathname === '/admin/activity'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Activity
                    </Link>
                </nav>
            </div>

            <Routes>
                <Route path="/" element={<Overview stats={stats} />} />
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/blogs" element={<BlogsManagement />} />
                <Route path="/activity" element={<ActivityLogs />} />
            </Routes>
        </div>
    );
};

// Overview Component
const Overview = ({ stats }) => {
    if (!stats) return null;

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: FaUsers,
            color: 'blue',
            details: `${stats.activeUsers} active`
        },
        {
            title: 'Total Blogs',
            value: stats.totalBlogs,
            icon: FaBlog,
            color: 'green',
            details: `${stats.publishedBlogs} published`
        },
        {
            title: 'Total Comments',
            value: stats.totalComments,
            icon: FaComments,
            color: 'purple',
            details: 'All time'
        },
        {
            title: 'Total Views',
            value: stats.totalViews || 0,
            icon: FaEye,
            color: 'orange',
            details: 'All blogs'
        }
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                                <stat.icon className={`text-${stat.color}-600 text-2xl`} />
                            </div>
                            <FaChartLine className="text-gray-400" />
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <p className="text-gray-400 text-sm mt-1">{stat.details}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                        {stats.recentUsers && stats.recentUsers.map((user) => (
                            <div key={user._id} className="flex items-center justify-between py-2 border-b">
                                <div>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Blogs</h3>
                    <div className="space-y-3">
                        {stats.recentBlogs && stats.recentBlogs.map((blog) => (
                            <div key={blog._id} className="py-2 border-b">
                                <Link to={`/blogs/${blog.slug || blog._id}`} className="font-medium text-blue-600 hover:underline">
                                    {blog.title}
                                </Link>
                                <p className="text-sm text-gray-500">By {blog.author.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Users Management Component
const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await adminAPI.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">@{user.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Blogs Management Component
const BlogsManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await adminAPI.getBlogs();
            setBlogs(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;

        try {
            await adminAPI.deleteBlog(blogId);
            toast.success('Blog deleted successfully');
            fetchBlogs();
        } catch (error) {
            toast.error('Failed to delete blog');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {blogs.map((blog) => (
                        <tr key={blog._id}>
                            <td className="px-6 py-4">
                                <Link to={`/blogs/${blog._id}`} className="text-blue-600 hover:underline">
                                    {blog.title}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {blog.author.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {blog.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(blog.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-3">
                                    <Link to={`/blogs/${blog._id}`} className="text-blue-600 hover:text-blue-900">
                                        <FaEye />
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteBlog(blog._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Activity Logs Component
const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await adminAPI.getActivityLogs({ limit: 50 });
            setLogs(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch activity logs');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resource
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {log.user?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.action}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {log.resourceType}: {log.resourceId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
