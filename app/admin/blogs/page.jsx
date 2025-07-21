"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BlogManagement() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    paragraphOne: '',
    paragraphTwo: '',
    paragraphThree: '',
    coverImage: '' // This will now store the URL or be empty
  });
  const [coverFile, setCoverFile] = useState(null); // NEW: State to store the selected file object
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (res.ok) {
        setBlogs(data.blogs);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (error) {
      setError('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "coverImage" && files && files[0]) {
      setCoverFile(files[0]); // Set the file object
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const url = editingId 
        ? `/api/admin/blog/${editingId}`
        : '/api/admin/blog';
      
      const method = editingId ? 'PUT' : 'POST';
      
      // NEW: Use FormData for file uploads
      const formToSend = new FormData();
      formToSend.append('title', formData.title);
      formToSend.append('description', formData.description);
      formToSend.append('paragraphOne', formData.paragraphOne);
      formToSend.append('paragraphTwo', formData.paragraphTwo);
      formToSend.append('paragraphThree', formData.paragraphThree);

      if (coverFile) {
        formToSend.append('coverImage', coverFile); // Append the actual file
      } else if (editingId && formData.coverImage) {
        // If editing and no new file, but there's an existing URL, send it
        formToSend.append('existingCoverImage', formData.coverImage);
      } else if (!editingId) {
        // If creating a new post, cover image is required
        setError('Cover image is required for new blog posts.');
        setLoading(false);
        return;
      }

      const res = await fetch(url, {
        method,
        // Do NOT set 'Content-Type': 'application/json' when sending FormData
        body: formToSend,
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          paragraphOne: '',
          paragraphTwo: '',
          paragraphThree: '',
          coverImage: ''
        });
        setCoverFile(null); // Clear selected file
        setEditingId(null);
        fetchBlogs();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save blog');
      }
    } catch (error) {
      setError('Error saving blog');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      description: blog.description,
      paragraphOne: blog.paragraphOne,
      paragraphTwo: blog.paragraphTwo,
      paragraphThree: blog.paragraphThree,
      coverImage: blog.coverImage // Populate existing URL for display
    });
    setCoverFile(null); // Clear any pre-selected file when editing
    setEditingId(blog._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchBlogs();
      } else {
        setError('Failed to delete blog');
      }
    } catch (error) {
      setError('Error deleting blog');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div> */}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Blog Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              paragraphOne: '',
              paragraphTwo: '',
              paragraphThree: '',
              coverImage: ''
            });
            setCoverFile(null); // Clear file on form toggle
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add New Blog'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              maxLength={500}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paragraph One
            </label>
            <textarea
              name="paragraphOne"
              value={formData.paragraphOne}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paragraph Two
            </label>
            <textarea
              name="paragraphTwo"
              value={formData.paragraphTwo}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paragraph Three
            </label>
            <textarea
              name="paragraphThree"
              value={formData.paragraphThree}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-primary focus:border-primary"
              required
              rows={4}
            />
          </div>

          {/* NEW: File input for cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image
            </label>
            <input
              type="file"
              name="coverImage"
              accept="image/*"
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0 file:text-sm file:font-semibold
                         file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {coverFile && (
              <p className="text-sm text-gray-500 mt-1">Selected: {coverFile.name}</p>
            )}
            {editingId && !coverFile && formData.coverImage && (
              <p className="text-sm text-gray-500 mt-1">
                Current image: <a href={formData.coverImage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Current Image</a>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editingId ? 'Update Blog' : 'Create Blog')}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map(blog => (
          <div key={blog._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-48">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{blog.description}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleEdit(blog)}
                  className="text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No blogs found. Create your first blog post!
        </div>
      )}
    </div>
  );
}