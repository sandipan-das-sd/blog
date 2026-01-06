import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBlog, FaUsers, FaComments, FaRocket } from 'react-icons/fa';

const Home = () => {
    const { user } = useAuth();

    const features = [
        {
            icon: FaBlog,
            title: 'Create & Share Blogs',
            description: 'Write and publish your thoughts, stories, and knowledge with the world.'
        },
        {
            icon: FaUsers,
            title: 'Build Community',
            description: 'Connect with like-minded people and grow your audience.'
        },
        {
            icon: FaComments,
            title: 'Engage & Discuss',
            description: 'Comment on posts, reply to others, and participate in meaningful discussions.'
        },
        {
            icon: FaRocket,
            title: 'Easy to Use',
            description: 'Simple and intuitive interface to get you writing in minutes.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
                        Welcome to <span className="text-blue-600">BlogSystem</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        A modern platform to share your ideas, connect with readers, and build your online presence.
                    </p>
                    <div className="flex justify-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    to="/create-blog"
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold shadow-lg"
                                >
                                    Create Your First Blog
                                </Link>
                                <Link
                                    to="/blogs"
                                    className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 text-lg font-semibold shadow-lg"
                                >
                                    Browse Blogs
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold shadow-lg"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/blogs"
                                    className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 text-lg font-semibold shadow-lg"
                                >
                                    Explore Blogs
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                    Why Choose BlogSystem?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <feature.icon className="text-blue-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            {!user && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-blue-600 rounded-2xl shadow-2xl p-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to Start Your Blogging Journey?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of writers sharing their stories on BlogSystem
                        </p>
                        <Link
                            to="/register"
                            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 text-lg font-semibold shadow-lg"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
                        <div className="text-gray-600">Active Writers</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
                        <div className="text-gray-600">Blog Posts</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-4xl font-bold text-blue-600 mb-2">10000+</div>
                        <div className="text-gray-600">Comments</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
