import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogAPI, commentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaReply, FaArrowLeft } from 'react-icons/fa';

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);

    useEffect(() => {
        fetchBlog();
        fetchComments();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const response = await blogAPI.getById(id);
            setBlog(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch blog');
            navigate('/blogs');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await commentAPI.getByBlog(id);
            setComments(response.data.data);
        } catch (error) {
            console.error('Failed to fetch comments');
        }
    };

    const handleDeleteBlog = async () => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
        
        try {
            await blogAPI.delete(id);
            toast.success('Blog deleted successfully');
            navigate('/blogs');
        } catch (error) {
            toast.error('Failed to delete blog');
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to comment');
            navigate('/login');
            return;
        }

        try {
            if (editingComment) {
                await commentAPI.update(editingComment._id, { content: commentText });
                toast.success('Comment updated');
                setEditingComment(null);
            } else {
                await commentAPI.create({
                    blog: id,
                    content: commentText,
                    parentComment: replyTo
                });
                toast.success('Comment added');
                setReplyTo(null);
            }
            setCommentText('');
            fetchComments();
        } catch (error) {
            toast.error('Failed to post comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        
        try {
            await commentAPI.delete(commentId);
            toast.success('Comment deleted');
            fetchComments();
        } catch (error) {
            toast.error('Failed to delete comment');
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setCommentText(comment.content);
        setReplyTo(null);
    };

    const handleReply = (comment) => {
        setReplyTo(comment._id);
        setEditingComment(null);
        setCommentText('');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderComment = (comment, depth = 0) => {
        const isOwner = user && comment.author._id === user.id;
        const canDelete = isOwner || isAdmin;

        return (
            <div key={comment._id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="font-semibold text-gray-900">{comment.author.name}</span>
                            <span className="text-sm text-gray-500 ml-2">{formatDate(comment.createdAt)}</span>
                            {comment.isEdited && (
                                <span className="text-xs text-gray-400 ml-2">(edited)</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {isOwner && (
                                <button
                                    onClick={() => handleEditComment(comment)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <FaEdit />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <FaTrash />
                                </button>
                            )}
                            {user && (
                                <button
                                    onClick={() => handleReply(comment)}
                                    className="text-green-600 hover:text-green-800"
                                >
                                    <FaReply />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                </div>
                {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!blog) return null;

    const isOwner = user && blog.author._id === user.id;
    const canEdit = isOwner || isAdmin;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
                <FaArrowLeft className="mr-2" /> Back
            </button>

            <article className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                {blog.coverImage && (
                    <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-96 object-cover"
                    />
                )}
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-4xl font-bold text-gray-900">{blog.title}</h1>
                        {canEdit && (
                            <div className="flex gap-2">
                                <Link
                                    to={`/blogs/${blog._id}/edit`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <FaEdit /> Edit
                                </Link>
                                <button
                                    onClick={handleDeleteBlog}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 mb-6">
                        <span className="font-medium">{blog.author.name}</span>
                        <span>•</span>
                        <span>{formatDate(blog.createdAt)}</span>
                        <span>•</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {blog.status}
                        </span>
                    </div>

                    {blog.excerpt && (
                        <p className="text-xl text-gray-600 mb-6 italic">{blog.excerpt}</p>
                    )}

                    <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                        {blog.content}
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                        <div className="flex gap-2 mt-6">
                            {blog.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </article>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Comments ({comments.length})
                </h2>

                {user ? (
                    <form onSubmit={handleSubmitComment} className="mb-8">
                        {replyTo && (
                            <div className="mb-2 text-sm text-gray-600">
                                Replying to comment{' '}
                                <button
                                    type="button"
                                    onClick={() => setReplyTo(null)}
                                    className="text-blue-600 hover:underline"
                                >
                                    (cancel)
                                </button>
                            </div>
                        )}
                        {editingComment && (
                            <div className="mb-2 text-sm text-gray-600">
                                Editing comment{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingComment(null);
                                        setCommentText('');
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    (cancel)
                                </button>
                            </div>
                        )}
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {editingComment ? 'Update Comment' : 'Post Comment'}
                        </button>
                    </form>
                ) : (
                    <div className="mb-8 p-4 bg-gray-100 rounded-md text-center">
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Login to comment
                        </Link>
                    </div>
                )}

                <div className="space-y-4">
                    {comments.map(comment => renderComment(comment))}
                    {comments.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
