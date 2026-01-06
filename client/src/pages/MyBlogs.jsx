import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

const MyBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMyBlogs();
    }, []);

    const fetchMyBlogs = async () => {
        setLoading(true);
        try {
            const response = await blogAPI.getMyBlogs();
            setBlogs(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch your blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;

        try {
            await blogAPI.delete(id);
            toast.success('Blog deleted successfully');
            fetchMyBlogs();
        } catch (error) {
            toast.error('Failed to delete blog');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredBlogs = filter === 'all' 
        ? blogs 
        : blogs.filter(blog => blog.status === filter);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Blogs</h1>
                <Link
                    to="/create-blog"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <FaPlus /> Create New Blog
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex gap-4">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 border-b-2 font-medium ${
                            filter === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        All ({blogs.length})
                    </button>
                    <button
                        onClick={() => setFilter('published')}
                        className={`px-4 py-2 border-b-2 font-medium ${
                            filter === 'published'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Published ({blogs.filter(b => b.status === 'published').length})
                    </button>
                    <button
                        onClick={() => setFilter('draft')}
                        className={`px-4 py-2 border-b-2 font-medium ${
                            filter === 'draft'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Drafts ({blogs.filter(b => b.status === 'draft').length})
                    </button>
                </nav>
            </div>

            {filteredBlogs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500 mb-4">No blogs found</p>
                    <Link
                        to="/create-blog"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <FaPlus /> Create Your First Blog
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBlogs.map((blog) => (
                        <div
                            key={blog._id}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {blog.title}
                                        </h2>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                blog.status === 'published'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {blog.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {blog.excerpt || blog.content.substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>Created: {formatDate(blog.createdAt)}</span>
                                        {blog.updatedAt !== blog.createdAt && (
                                            <span>Updated: {formatDate(blog.updatedAt)}</span>
                                        )}
                                        <span>Views: {blog.views || 0}</span>
                                        {blog.tags && blog.tags.length > 0 && (
                                            <div className="flex gap-1">
                                                {blog.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-gray-100 rounded text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Link
                                        to={`/blogs/${blog._id}`}
                                        className="p-2 text-gray-600 hover:text-blue-600"
                                        title="View"
                                    >
                                        <FaEye size={18} />
                                    </Link>
                                    <Link
                                        to={`/blogs/${blog._id}/edit`}
                                        className="p-2 text-gray-600 hover:text-blue-600"
                                        title="Edit"
                                    >
                                        <FaEdit size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(blog._id)}
                                        className="p-2 text-gray-600 hover:text-red-600"
                                        title="Delete"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBlogs;
