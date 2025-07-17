import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useBlogs } from '../hooks/useApi';

interface Blog {
  id: string;
  blogId: string;
  name: string;
  description: string;
  url: string;
  status: string;
  posts: {
    totalItems: number;
  };
  pages: {
    totalItems: number;
  };
}

interface BlogContextType {
  blogs: Blog[];
  currentBlog: Blog | null;
  setCurrentBlog: (blog: Blog) => void;
  loading: boolean;
  error: any;
  refreshBlogs: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const { isAuthenticated } = useAuth();

  const { data: blogs = [], isLoading: loading, error, refetch } = useBlogs();

  useEffect(() => {
    if (blogs.length > 0 && !currentBlog) {
      setCurrentBlog(blogs[0]);
    }
  }, [blogs, currentBlog]);

  const refreshBlogs = () => {
    refetch();
  };

  return (
    <BlogContext.Provider value={{
      blogs,
      currentBlog,
      setCurrentBlog,
      loading,
      error,
      refreshBlogs
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};