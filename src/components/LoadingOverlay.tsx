import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        className="glass-card p-8 flex flex-col items-center space-y-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
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

export default LoadingOverlay;
