import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Filter, Check, X, Flag, Calendar, User, AlertCircle } from 'lucide-react';
import { useComments, useUpdateCommentStatus, useDeleteComment } from '../hooks/useApi';

const Comments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  const { data: comments, isLoading, error, refetch } = useComments({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined
  });

  const updateCommentMutation = useUpdateCommentStatus();
  const deleteCommentMutation = useDeleteComment();

  const handleCommentAction = async (commentId: string, action: 'approve' | 'spam' | 'delete') => {
    const comment = comments?.find((c: any) => c.id === commentId);
    if (!comment) return;

    try {
      if (action === 'delete') {
        await deleteCommentMutation.mutateAsync({
          commentId,
          blogId: comment.blogId,
          postId: comment.postId
        });
        alert('Komentar berhasil dihapus');
      } else {
        await updateCommentMutation.mutateAsync({
          commentId,
          status: action === 'approve' ? 'approved' : 'spam',
          blogId: comment.blogId,
          postId: comment.postId
        });
        alert(`Komentar berhasil ${action === 'approve' ? 'disetujui' : 'ditandai sebagai spam'}`);
      }
    } catch (error) {
      alert('Gagal memproses komentar');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'spam' | 'delete') => {
    if (selectedComments.length === 0) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${action === 'approve' ? 'menyetujui' : action === 'spam' ? 'menandai sebagai spam' : 'menghapus'} ${selectedComments.length} komentar?`
    );

    if (!confirmed) return;

    try {
      for (const commentId of selectedComments) {
        await handleCommentAction(commentId, action);
      }
      setSelectedComments([]);
      alert(`${selectedComments.length} komentar berhasil diproses`);
    } catch (error) {
      alert('Gagal memproses beberapa komentar');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'live':
        return 'bg-green-500/20 text-green-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'spam':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'live':
        return <Check className="w-4 h-4" />;
      case 'pending':
        return <MessageCircle className="w-4 h-4" />;
      case 'spam':
        return <Flag className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          <p className="text-white/80 text-lg font-medium">Loading Comments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400" />
          <p className="text-red-200 text-lg font-medium">Failed to load comments</p>
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

  const filteredComments = comments?.filter((comment: any) => {
    const matchesSearch = 
      comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Komentar</h1>
          <p className="text-white/60 mt-2">Moderasi dan kelola komentar blog Anda</p>
          {comments && comments.length > 0 && (
            <p className="text-white/40 text-sm mt-1">
              {comments.length} komentar ditemukan
            </p>
          )}
        </div>
        
        {/* Bulk Actions */}
        {selectedComments.length > 0 && (
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <span className="text-white/60 text-sm">{selectedComments.length} dipilih</span>
            <button
              onClick={() => handleBulkAction('approve')}
              className="glass-button px-3 py-1 text-green-300 text-sm hover:bg-green-500/20"
              disabled={updateCommentMutation.isPending}
            >
              Setujui
            </button>
            <button
              onClick={() => handleBulkAction('spam')}
              className="glass-button px-3 py-1 text-red-300 text-sm hover:bg-red-500/20"
              disabled={updateCommentMutation.isPending}
            >
              Spam
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="glass-button px-3 py-1 text-red-400 text-sm hover:bg-red-500/20"
              disabled={deleteCommentMutation.isPending}
            >
              Hapus
            </button>
          </div>
        )}
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
              placeholder="Cari komentar..."
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
              <option value="pending" className="bg-gray-800">Pending</option>
              <option value="approved" className="bg-gray-800">Approved</option>
              <option value="spam" className="bg-gray-800">Spam</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment: any, index: number) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-6 ${selectedComments.includes(comment.id) ? 'ring-2 ring-purple-400' : ''}`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedComments.includes(comment.id)}
                  onChange={() => toggleCommentSelection(comment.id)}
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-400"
                />

                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium">{comment.author}</h3>
                      <p className="text-white/60 text-sm">{comment.email}</p>
                      {comment.website && (
                        <a
                          href={comment.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          {comment.website}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs flex items-center space-x-1 ${getStatusColor(comment.status)}`}>
                        {getStatusIcon(comment.status)}
                        <span>{comment.status}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-white/80 mb-3">{comment.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-white/60 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(comment.date)}</span>
                      </div>
                      <span>on {comment.postTitle}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {comment.status === 'pending' && (
                        <button
                          onClick={() => handleCommentAction(comment.id, 'approve')}
                          className="glass-button px-3 py-1 text-green-300 text-sm hover:bg-green-500/20"
                          disabled={updateCommentMutation.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleCommentAction(comment.id, 'spam')}
                        className="glass-button px-3 py-1 text-red-300 text-sm hover:bg-red-500/20"
                        disabled={updateCommentMutation.isPending}
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCommentAction(comment.id, 'delete')}
                        className="glass-button px-3 py-1 text-red-400 text-sm hover:bg-red-500/20"
                        disabled={deleteCommentMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Tidak ada komentar ditemukan</h3>
            <p className="text-white/60">
              {searchTerm || statusFilter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian' 
                : 'Belum ada komentar pada blog Anda'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Comments;