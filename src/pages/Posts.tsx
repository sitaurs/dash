import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Edit, Trash2, Eye, Calendar, AlertCircle } from 'lucide-react';
import { usePosts, useDeletePost } from '../hooks/useApi';
import PostEditor from '../components/PostEditor';

const Posts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>();
  const postsPerPage = 10;

  const { data: postsData, isLoading, error, refetch } = usePosts({
    page: currentPage,
    limit: postsPerPage,
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  const deletePostMutation = useDeletePost();

  const handleDelete = async (postId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      try {
        await deletePostMutation.mutateAsync(postId);
        alert('Postingan berhasil dihapus');
      } catch (error) {
        alert('Gagal menghapus postingan');
      }
    }
  };

  const handleCreatePost = () => {
    setEditingPostId(undefined);
    setIsEditorOpen(true);
  };

  const handleEditPost = (postId: string) => {
    setEditingPostId(postId);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingPostId(undefined);
  };

  const handleSavePost = () => {
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return 'bg-green-500/20 text-green-300';
      case 'draft':
        return 'bg-gray-500/20 text-gray-300';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          <p className="text-white/80 text-lg font-medium">Loading Posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400" />
          <p className="text-red-200 text-lg font-medium">Failed to load posts</p>
          <p className="text-red-200/80 text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="glass-button px-4 py-2 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Postingan</h1>
          <p className="text-white/60 mt-2">Kelola semua postingan blog Anda</p>
          {pagination.totalItems > 0 && (
            <p className="text-white/40 text-sm mt-1">
              {pagination.totalItems} total postingan ditemukan
            </p>
          )}
        </div>
        <button 
          onClick={handleCreatePost}
          className="glass-button px-4 py-2 text-white rounded-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Postingan</span>
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Cari postingan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-button w-full pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-white/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-button px-4 py-2 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="all" className="bg-gray-800">Semua Status</option>
              <option value="live" className="bg-gray-800">Published</option>
              <option value="draft" className="bg-gray-800">Draft</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        {posts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/80 font-medium py-3">Judul</th>
                    <th className="text-left text-white/80 font-medium py-3">Status</th>
                    <th className="text-left text-white/80 font-medium py-3">Tanggal</th>
                    <th className="text-left text-white/80 font-medium py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post: any) => (
                    <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div>
                          <h3 className="text-white font-medium line-clamp-2">{post.title}</h3>
                          {post.labels && post.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.labels.slice(0, 3).map((label: string) => (
                                <span key={label} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                                  {label}
                                </span>
                              ))}
                              {post.labels.length > 3 && (
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                                  +{post.labels.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2 text-white/60">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {post.published ? formatDate(post.published) : 'Belum dipublikasi'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          {post.url && (
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="View Post"
                            >
                              <Eye className="w-4 h-4 text-white/60" />
                            </a>
                          )}
                          <button 
                            onClick={() => handleEditPost(post.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-white/60" />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors" 
                            title="Delete"
                            disabled={deletePostMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="glass-button px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-purple-500 text-white'
                            : 'glass-button text-white hover:bg-white/20'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 3 ||
                    pageNum === currentPage + 3
                  ) {
                    return (
                      <span key={pageNum} className="px-2 text-white/60">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  className="glass-button px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Tidak ada postingan ditemukan</h3>
            <p className="text-white/60 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian' 
                : 'Belum ada postingan yang dibuat'
              }
            </p>
            <button 
              onClick={handleCreatePost}
              className="glass-button px-4 py-2 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Postingan Pertama</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Post Editor Modal */}
      <PostEditor
        postId={editingPostId}
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSave={handleSavePost}
      />
    </div>
  );
};

export default Posts;