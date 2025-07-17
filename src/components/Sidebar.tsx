import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  File,
  MessageCircle,
  BarChart3,
  FolderOpen,
  Settings,
  X,
  Layers
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/posts', icon: FileText, label: 'Postingan' },
  { path: '/pages', icon: File, label: 'Halaman' },
  { path: '/comments', icon: MessageCircle, label: 'Komentar' },
  { path: '/stats', icon: BarChart3, label: 'Statistik' },
  { path: '/content', icon: FolderOpen, label: 'Pustaka Konten' },
  { path: '/settings', icon: Settings, label: 'Pengaturan' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full lg:h-screen w-80 sidebar-glass z-50 lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto"
      >
        <div className="p-6 h-full lg:h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Pusat Kendali</h1>
                <p className="text-sm text-white/60">Blogger</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              © 2024 Pusat Kendali Blogger
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;