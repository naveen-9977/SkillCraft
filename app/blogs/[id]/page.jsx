"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BlogPost({ params }) {
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const resolvedParams = React.use(params);

  

  useEffect(() => {
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/admin/blog/${resolvedParams.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setBlog(data.blog);
      } else {
        setError('Failed to fetch blog post');
        if (res.status === 404) {
          router.push('/blogs');
        }
      }
    } catch (error) {
      setError('Error loading blog post');
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

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <p>{error}</p>
        <Link href="/blogs" className="mt-4 text-primary hover:underline">
          Return to Blogs
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href="/blogs" 
        className="inline-flex items-center text-primary hover:underline mb-8"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
            clipRule="evenodd" 
          />
        </svg>
        Back to Blogs
      </Link>

      {/* Blog header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>
        <div className="flex items-center text-sm text-gray-500">
          <time dateTime={blog.createdAt}>
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {/* <span className="mx-2">·</span>
          <span>
            {Math.ceil((blog.paragraphOne.length + blog.paragraphTwo.length + blog.paragraphThree.length) / 1000)} min read
          </span> */}
        </div>
      </header>

      {/* Cover image */}
      <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
        <Image
          src={blog.coverImage}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Blog description */}
      <div className="prose max-w-none">
        <div className="text-xl text-gray-600 mb-8 leading-relaxed">
          {blog.description}
        </div>

        {/* Blog content */}
        <div className="space-y-6 text-gray-800">
          <p className="leading-relaxed">
            {blog.paragraphOne}
          </p>
          <p className="leading-relaxed">
            {blog.paragraphTwo}
          </p>
          <p className="leading-relaxed">
            {blog.paragraphThree}
          </p>
        </div>
      </div>

      {/* Share and navigation */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <Link 
            href="/blogs" 
            className="text-primary hover:underline"
          >
            ← Back to Blogs
          </Link>
          <button
            onClick={() => {
              navigator.share({
                title: blog.title,
                text: blog.description,
                url: window.location.href,
              }).catch(() => {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              });
            }}
            className="text-primary hover:underline"
          >
            Share Article
          </button>
        </div>
      </div>
    </article>
  );
}
