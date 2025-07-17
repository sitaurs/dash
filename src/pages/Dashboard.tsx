import React from 'react';
import { motion } from 'framer-motion';
import { FileText, File, MessageCircle, Eye, Users, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOverallStats, usePosts, useComments, useStats } from '../hooks/useApi';

const Dashboard: React.FC = () => {
  const { data: overallStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useOverallStats();
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = usePosts({ limit: 5 });
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useComments({ limit: 5 });
  const { data: chartData, isLoading: chartLoading, refetch: refetchChart } = useStats('daily');

  const handleRefreshAll = () => {
    refetchStats();
    refetchPosts();
    refetchComments();
    refetchChart();
  };

  if (statsLoading || postsLoading || commentsLoading || chartLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          <p className="text-white/80 text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400" />
          <p className="text-red-200 text-lg font-medium">Failed to load dashboard</p>
          <p className="text-red-200/80 text-sm text-center">
            {statsError.message || 'Please check your connection and try again'}
          </p>
          <button
            onClick={handleRefreshAll}
            className="glass-button px-4 py-2 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Total Postingan',
      value: overallStats?.totalPosts || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      published: overallStats?.publishedPosts || 0,
      draft: overallStats?.draftPosts || 0
    },
    {
      label: 'Total Halaman',
      value: overallStats?.totalPages || 0,
      icon: File,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Komentar Pending',
      value: overallStats?.pendingComments || 0,
      icon: MessageCircle,
      color: 'from-yellow-500 to-yellow-600',
      total: overallStats?.totalComments || 0
    },
    {
      label: 'Estimated Views',
      value: overallStats?.estimatedViews || 0,
      icon: Eye,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentPosts = postsData?.posts?.slice(0, 5) || [];
  const recentComments = commentsData?.slice(0, 5) || [];
  const chartStats = chartData?.stats || [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-white/60 mt-2">Selamat datang di Pusat Kendali Blogger</p>
          {overallStats?.lastUpdated && (
            <p className="text-white/40 text-sm mt-1">
              Terakhir diperbarui: {new Date(overallStats.lastUpdated).toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <button
          onClick={handleRefreshAll}
          className="glass-button px-4 py-2 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  {stat.published !== undefined && (
                    <p className="text-white/40 text-xs mt-1">
                      {stat.published} published, {stat.draft} draft
                    </p>
                  )}
                  {stat.total !== undefined && (
                    <p className="text-white/40 text-xs mt-1">
                      {stat.total} total comments
                    </p>
                  )}
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Growth Rate */}
      {overallStats?.growthRate !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Growth Rate</h3>
              <p className="text-white/60 text-sm">Posts published in the last month</p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">
                +{overallStats.growthRate}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      {chartStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="chart-container"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Views dalam 7 Hari Terakhir</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Posts and Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">5 Postingan Terbaru</h2>
          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex-1">
                    <h3 className="text-white font-medium line-clamp-1">{post.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.status === 'LIVE' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {post.status}
                      </span>
                      {post.published && (
                        <span className="text-white/60 text-xs">
                          {new Date(post.published).toLocaleDateString('id-ID')}
                        </span>
                      )}
                      {post.labels && post.labels.length > 0 && (
                        <span className="text-white/40 text-xs">
                          {post.labels.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <FileText className="w-4 h-4 text-white/40 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">Belum ada postingan</p>
            </div>
          )}
        </motion.div>

        {/* Recent Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Komentar Terbaru</h2>
          {recentComments.length > 0 ? (
            <div className="space-y-3">
              {recentComments.map((comment: any) => (
                <div key={comment.id} className="p-3 hover:bg-white/5 rounded-lg transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium text-sm">{comment.author}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          comment.status === 'approved' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {comment.status}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mt-1 line-clamp-2">{comment.content}</p>
                      <p className="text-white/40 text-xs mt-1">on {comment.postTitle}</p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-white/40 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">Belum ada komentar</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Labels */}
      {overallStats?.topLabels && overallStats.topLabels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Label Terpopuler</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {overallStats.topLabels.map((labelData: any, index: number) => (
              <div key={labelData.label} className="text-center">
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <p className="text-purple-300 font-medium">{labelData.label}</p>
                  <p className="text-purple-200 text-sm mt-1">{labelData.count} posts</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;