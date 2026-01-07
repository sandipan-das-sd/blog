import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogAPI } from '../utils/api';
import { toast } from 'react-toastify';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';

    useEffect(() => {
        fetchBlogs();
    }, [page, search]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await blogAPI.getAll({ page, limit: 10, search });
            setBlogs(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const searchValue = formData.get('search');
        setSearchParams({ search: searchValue, page: 1 });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">All Blog Posts</h1>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Search blogs..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                    <Link 
                        key={blog._id} 
                        to={`/blogs/${blog.slug || blog._id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block"
                    >
                        {blog.coverImage && (
                            <img
                                src={blog.coverImage}
                                alt={blog.title}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                                {blog.title}
                            </h2>
                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {blog.excerpt || blog.content.substring(0, 150)}...
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center">
                                    <span className="font-medium">{blog.author.name}</span>
                                </div>
                                <span>{formatDate(blog.createdAt)}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                <span>👁 {blog.views} views</span>
                                <span>💬 {blog.commentCount} comments</span>
                            </div>
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {blog.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {blogs.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No blogs found</p>
                </div>
            )}

            {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    <button
                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page - 1 })}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 bg-white border border-gray-300 rounded-md">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: page + 1 })}
                        disabled={page === pagination.pages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogList;
