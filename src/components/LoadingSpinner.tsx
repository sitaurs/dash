import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center">
      <motion.div
        className="glass-card p-8 flex flex-col items-center space-y-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-purple-300 rounded-full animate-spin"></div>
        </div>
        <p className="text-white/80 text-lg font-medium">Loading...</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;