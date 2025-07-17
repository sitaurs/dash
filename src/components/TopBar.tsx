import React from 'react';
import { Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlog } from '../contexts/BlogContext';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { logout, user } = useAuth();
  const { blogs, currentBlog, setCurrentBlog } = useBlog();

  return (
    <div className="h-16 backdrop-blur-md backdrop-saturate-150 bg-white/10 border-b border-white/20">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Blog selector */}
          {blogs.length > 1 && (
            <div className="relative">
              <select
                value={currentBlog?.id || ''}
                onChange={(e) => {
                  const blog = blogs.find(b => b.id === e.target.value);
                  if (blog) setCurrentBlog(blog);
                }}
                className="glass-button px-4 py-2 text-white appearance-none cursor-pointer pr-8"
              >
                {blogs.map((blog) => (
                  <option key={blog.id} value={blog.id} className="bg-gray-800 text-white">
                    {blog.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-medium hidden sm:block">
              {user?.username || 'Admin'}
            </span>
            <button
              onClick={logout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;