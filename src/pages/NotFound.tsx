import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertTriangle className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-8xl font-bold gradient-text error-glitch mb-4"
          >
            404
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-semibold text-white mb-4"
          >
            Halaman Tidak Ditemukan
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-lg mb-8 max-w-md mx-auto"
          >
            Oops! Halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah dipindahkan atau tidak ada.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Link
            to="/"
            className="glass-button px-8 py-4 text-white font-medium rounded-xl hover:scale-105 transition-all duration-200 inline-flex items-center space-x-3"
          >
            <Home className="w-5 h-5" />
            <span>Kembali ke Dashboard</span>
          </Link>
          
          <div className="text-white/60 text-sm">
            <p>Atau coba salah satu link ini:</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <Link to="/posts" className="hover:text-white transition-colors">
                Postingan
              </Link>
              <span>•</span>
              <Link to="/pages" className="hover:text-white transition-colors">
                Halaman
              </Link>
              <span>•</span>
              <Link to="/stats" className="hover:text-white transition-colors">
                Statistik
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;