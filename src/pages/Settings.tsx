import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, User, Shield, RefreshCw, CheckCircle, AlertCircle, ExternalLink, type LucideIcon } from 'lucide-react';
import { useBlog } from '../contexts/BlogContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useModal } from '../contexts/ModalContext';

interface OAuthStatus {
  isAuthorized: boolean;
  tokenInfo?: {
    expiresAt: string;
    lastRefreshed: string;
    needsRefresh: boolean;
    scope: string;
  };
}

const Settings: React.FC = () => {
  const { currentBlog } = useBlog();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'blog' | 'oauth' | 'admin'>('blog');
  const [oauthStatus, setOAuthStatus] = useState<OAuthStatus | null>(null);
  const [loadingOAuth, setLoadingOAuth] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const { alert } = useModal();

  interface Tab {
    id: 'blog' | 'oauth' | 'admin';
    label: string;
    icon: LucideIcon;
  }

  const tabs: Tab[] = [
    { id: 'blog', label: 'Blog Info', icon: Globe },
    { id: 'oauth', label: 'OAuth Status', icon: Shield },
    { id: 'admin', label: 'Admin', icon: User },
  ];

  // Load OAuth status on component mount
  useEffect(() => {
    loadOAuthStatus();
  }, []);

  const loadOAuthStatus = async () => {
    try {
      const response = await axios.get('/api/admin/oauth/status');
      setOAuthStatus(response.data);
    } catch (error) {
      console.error('Failed to load OAuth status:', error);
      setOAuthStatus({ isAuthorized: false });
    }
  };

  const handleGetAuthUrl = async () => {
    setLoadingOAuth(true);
    try {
      const response = await axios.get('/api/admin/oauth/url');
      setAuthUrl(response.data.authUrl);
    } catch (error: any) {
      await alert('Failed to generate authorization URL: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingOAuth(false);
    }
  };

  const handleReauthorize = () => {
    if (authUrl) {
      window.open(authUrl, '_blank', 'width=600,height=600');
      // Refresh status after a delay to check if authorization was completed
      setTimeout(() => {
        loadOAuthStatus();
      }, 3000);
    } else {
      handleGetAuthUrl();
    }
  };

  const handleChangePassword = async () => {
    // This would open a password change modal
    await alert('Password change functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text">Pengaturan</h1>
        <p className="text-white/60 mt-2">Kelola konfigurasi aplikasi dan akun Anda</p>
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

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8"
      >
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Informasi Blog</h2>
            
            {currentBlog ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Nama Blog
                    </label>
                    <input
                      type="text"
                      value={currentBlog.name}
                      readOnly
                      className="glass-button w-full px-4 py-3 text-white bg-white/5 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      URL Blog
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={currentBlog.url}
                        readOnly
                        className="glass-button flex-1 px-4 py-3 text-white bg-white/5 cursor-not-allowed"
                      />
                      <a
                        href={currentBlog.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-button p-3 text-white hover:bg-white/20 transition-colors"
                        title="Open Blog"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={currentBlog.description || 'Tidak ada deskripsi'}
                    readOnly
                    rows={4}
                    className="glass-button w-full px-4 py-3 text-white bg-white/5 cursor-not-allowed resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        currentBlog.status === 'LIVE' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-white">{currentBlog.status}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Total Postingan
                    </label>
                    <span className="text-white text-lg font-semibold">
                      {currentBlog.posts?.totalItems || 0}
                    </span>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Total Halaman
                    </label>
                    <span className="text-white text-lg font-semibold">
                      {currentBlog.pages?.totalItems || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-200 font-medium">Info</p>
                      <p className="text-blue-200/80 text-sm mt-1">
                        Informasi blog ini diambil langsung dari Blogger API dan tidak dapat diubah melalui dashboard ini.
                        Untuk mengubah informasi blog, gunakan dashboard Blogger resmi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60">
                <p>Tidak ada blog yang terhubung. Pastikan Anda sudah melakukan otorisasi OAuth.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'oauth' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Status OAuth 2.0</h2>
            
            <div className="space-y-6">
              {oauthStatus?.isAuthorized ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-green-200 font-medium text-lg">Koneksi Aktif</h3>
                      <p className="text-green-200/80 mt-1">
                        Aplikasi berhasil terhubung dengan akun Google Anda dan dapat mengakses Blogger API.
                      </p>
                      {oauthStatus.tokenInfo && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-green-200/80 text-sm">Scope:</span>
                            <span className="text-green-200 font-medium text-sm">
                              {oauthStatus.tokenInfo.scope}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-200/80 text-sm">Token Expires:</span>
                            <span className="text-green-200 font-medium text-sm">
                              {new Date(oauthStatus.tokenInfo.expiresAt).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-200/80 text-sm">Last Refresh:</span>
                            <span className="text-green-200 font-medium text-sm">
                              {new Date(oauthStatus.tokenInfo.lastRefreshed).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-200/80 text-sm">Needs Refresh:</span>
                            <span className={`font-medium text-sm ${
                              oauthStatus.tokenInfo.needsRefresh ? 'text-yellow-300' : 'text-green-200'
                            }`}>
                              {oauthStatus.tokenInfo.needsRefresh ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-red-200 font-medium text-lg">Tidak Terotorisasi</h3>
                      <p className="text-red-200/80 mt-1">
                        Aplikasi belum memiliki akses ke Blogger API. Anda perlu melakukan otorisasi terlebih dahulu.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-white font-medium text-lg">Aksi OAuth</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleReauthorize}
                    disabled={loadingOAuth}
                    className="glass-button px-6 py-3 text-white hover:bg-white/20 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {loadingOAuth ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>
                      {oauthStatus?.isAuthorized ? 'Otorisasi Ulang' : 'Mulai Otorisasi'}
                    </span>
                  </button>
                  <p className="text-white/60 text-sm">
                    {oauthStatus?.isAuthorized 
                      ? 'Gunakan ini jika Anda mengalami masalah koneksi atau ingin mengganti akun Google yang terhubung.'
                      : 'Klik untuk memulai proses otorisasi dengan Google dan mendapatkan akses ke Blogger API.'
                    }
                  </p>
                  
                  {/* Blog ID Information */}
                  <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <h4 className="text-blue-200 font-medium mb-2">📝 Cara Mendapatkan Blog ID</h4>
                    <div className="text-blue-200/80 text-sm space-y-2">
                      <p><strong>Metode 1 - Dari URL Blog:</strong></p>
                      <p>• Buka blog Anda di browser</p>
                      <p>• Lihat source code (Ctrl+U)</p>
                      <p>• Cari "blogId" atau "data-blog-id"</p>
                      
                      <p className="mt-3"><strong>Metode 2 - Otomatis (Recommended):</strong></p>
                      <p>• Setelah OAuth berhasil, aplikasi akan otomatis mendeteksi semua blog Anda</p>
                      <p>• Blog ID akan ditampilkan di dashboard</p>
                      
                      <p className="mt-3"><strong>Format Blog ID:</strong></p>
                      <p>• Berupa angka panjang (contoh: 1234567890123456789)</p>
                      <p>• Bukan URL blog, tapi ID unik dari Google</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 font-medium">Penting</p>
                    <p className="text-yellow-200/80 text-sm mt-1">
                      Proses otorisasi akan membuka jendela baru untuk login ke Google. Pastikan popup tidak diblokir
                      oleh browser Anda. Setelah otorisasi selesai, refresh halaman ini untuk melihat status terbaru.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Pengaturan Admin</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user?.username || 'admin'}
                    readOnly
                    className="glass-button w-full px-4 py-3 text-white bg-white/5 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || 'admin@blogger-dashboard.com'}
                    readOnly
                    className="glass-button w-full px-4 py-3 text-white bg-white/5 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || 'Administrator'}
                    readOnly
                    className="glass-button w-full px-4 py-3 text-white bg-white/5 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Last Login
                  </label>
                  <input
                    type="text"
                    value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString('id-ID') : 'Never'}
                    readOnly
                    className="glass-button w-full px-4 py-3 text-white bg-white/5 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-medium text-lg">Keamanan</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleChangePassword}
                    className="glass-button px-6 py-3 text-white hover:bg-white/20 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Ubah Password</span>
                  </button>
                  <p className="text-white/60 text-sm">
                    Ubah password untuk meningkatkan keamanan akun admin Anda.
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-200 font-medium">Info Akun</p>
                    <p className="text-blue-200/80 text-sm mt-1">
                      Data akun admin disimpan dalam database MongoDB. Untuk mengubah informasi akun,
                      gunakan fitur yang tersedia atau hubungi administrator sistem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;