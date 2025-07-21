"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError('Error loading blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <section className="px-4 container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-12">Latest Blog Posts</h1>
      
      {blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No blog posts available yet.
        </div>
      ) : (
        <div className="grid gap-8">
          {blogs.map((blog) => (
            <article 
              key={blog._id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link href={`/blogs/${blog._id}`} className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative h-64 md:h-auto">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600">
                      {blog.description}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {/* <span>·</span>
                      <span className="ml-3">
                        {Math.ceil((blog.paragraphOne.length + blog.paragraphTwo.length + blog.paragraphThree.length) / 1000)} min read
                      </span> */}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
