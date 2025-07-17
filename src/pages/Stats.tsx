import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Eye, Users, BarChart3, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useStats, useOverallStats } from '../hooks/useApi';

const Stats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: chartData, isLoading: chartLoading, error: chartError } = useStats(activeTab);
  const { data: overallStats, isLoading: overallLoading, error: overallError } = useOverallStats();

  const tabs = [
    { id: 'daily' as const, label: 'Harian', icon: Calendar },
    { id: 'weekly' as const, label: 'Mingguan', icon: BarChart3 },
    { id: 'monthly' as const, label: 'Bulanan', icon: TrendingUp },
  ];

  // Mock data for charts since Blogger API doesn't provide detailed analytics
  const mockLabelStats = [
    { name: 'React', value: 35, color: '#61DAFB' },
    { name: 'TypeScript', value: 25, color: '#3178C6' },
    { name: 'JavaScript', value: 20, color: '#F7DF1E' },
    { name: 'CSS', value: 15, color: '#1572B6' },
    { name: 'Other', value: 5, color: '#8B5CF6' },
  ];

  const mockTopPosts = [
    { title: 'Getting Started with React', views: 3500 },
    { title: 'TypeScript Best Practices', views: 2800 },
    { title: 'CSS Grid Tutorial', views: 2400 },
    { title: 'JavaScript ES6 Features', views: 2100 },
    { title: 'Building Modern UIs', views: 1900 },
  ];

  if (chartLoading || overallLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          <p className="text-white/80 text-lg font-medium">Loading Statistics...</p>
        </div>
      </div>
    );
  }

  if (chartError || overallError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400" />
          <p className="text-red-200 text-lg font-medium">Failed to load statistics</p>
          <p className="text-red-200/80 text-sm">{chartError?.message || overallError?.message}</p>
        </div>
      </div>
    );
  }

  const chartStats = chartData?.stats || [];
  const dateKey = activeTab === 'weekly' ? 'week' : activeTab === 'monthly' ? 'month' : 'date';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text">Statistik</h1>
        <p className="text-white/60 mt-2">Analisis performa blog Anda</p>
        {chartData?.note && (
          <p className="text-yellow-400/80 text-sm mt-2 bg-yellow-500/10 p-3 rounded-lg">
            💡 {chartData.note}
          </p>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-500/30 text-white'
                    : 'glass-button text-white/70 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="chart-container"
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          Traffic {tabs.find(tab => tab.id === activeTab)?.label}
        </h2>
        {chartStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey={dateKey} stroke="rgba(255,255,255,0.6)" />
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
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                name="Visitors"
              />
              <Line 
                type="monotone" 
                dataKey="pageviews" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="Page Views"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 text-white/60">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4" />
              <p>Tidak ada data statistik tersedia</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Label Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-container"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Distribusi Label (Estimasi)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockLabelStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockLabelStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chart-container"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Postingan Terpopuler (Estimasi)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTopPosts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.6)" />
              <YAxis dataKey="title" type="category" stroke="rgba(255,255,255,0.6)" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }} 
              />
              <Bar dataKey="views" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {overallStats?.estimatedViews?.toLocaleString() || '0'}
          </h3>
          <p className="text-white/60 mt-1">Estimated Views</p>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {overallStats?.totalPosts?.toLocaleString() || '0'}
          </h3>
          <p className="text-white/60 mt-1">Total Posts</p>
        </div>

        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            +{overallStats?.growthRate || 0}%
          </h3>
          <p className="text-white/60 mt-1">Growth Rate</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Stats;