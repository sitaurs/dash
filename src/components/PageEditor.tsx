import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, X, Calendar, Globe } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { useCreatePage, useUpdatePage, usePage } from '../hooks/useApi';

interface PageEditorProps {
  pageId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDraft, setIsDraft] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  const { data: existingPage } = usePage(pageId || '');
  const createPageMutation = useCreatePage();
  const updatePageMutation = useUpdatePage();

  useEffect(() => {
    if (existingPage) {
      setTitle(existingPage.title || '');
      setContent(existingPage.content || '');
      setIsDraft(existingPage.status !== 'LIVE');
    } else if (!pageId) {
      setTitle('');
      setContent('');
      setIsDraft(true);
    }
  }, [existingPage, pageId]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      alert('Judul halaman tidak boleh kosong');
      return;
    }

    if (!content.trim()) {
      alert('Konten halaman tidak boleh kosong');
      return;
    }

    const pageData = {
      title: title.trim(),
      content: content,
      isDraft: !publish
    };

    try {
      if (pageId) {
        await updatePageMutation.mutateAsync({ pageId, pageData });
        alert(publish ? 'Halaman berhasil dipublikasi' : 'Halaman berhasil disimpan');
      } else {
        await createPageMutation.mutateAsync(pageData);
        alert(publish ? 'Halaman berhasil dipublikasi' : 'Draf halaman berhasil disimpan');
      }

      onSave?.();
      onClose();
    } catch (error: any) {
      alert('Gagal menyimpan halaman: ' + (error.message || 'Unknown error'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {pageId ? 'Edit Halaman' : 'Buat Halaman Baru'}
            </h2>
            <p className="text-white/60 text-sm">
              {isDraft ? 'Mode Draft' : 'Mode Publish'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="glass-button px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-1 text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              onClick={() => setIsHtmlMode(!isHtmlMode)}
              className="glass-button px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              {isHtmlMode ? 'Visual' : 'HTML'}
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={createPageMutation.isPending || updatePageMutation.isPending}
              className="glass-button px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-1 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Draft</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={createPageMutation.isPending || updatePageMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-2 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors flex items-center space-x-1 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Publish</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {/* Title Input */}
            <div className="p-4 border-b border-white/10">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul halaman..."
                className="w-full text-xl font-bold bg-transparent text-white placeholder-white/40 border-none outline-none"
              />
            </div>

            {/* Editor/Preview */}
            <div className="flex-1 overflow-hidden">
              {isPreview ? (
                <div className="h-full overflow-y-auto p-4">
                  <div className="prose prose-lg max-w-none">
                    <h1 className="text-white text-2xl font-bold mb-4">{title || 'Untitled'}</h1>
                    <div
                      className="text-white/90 leading-relaxed prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full p-4">
                  {isHtmlMode ? (
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="w-full h-full bg-gray-800 text-white p-3 font-mono border border-white/20 rounded text-sm"
                    />
                  ) : (
                    <RichTextEditor
                      value={content}
                      onChange={setContent}
                      height={window.innerHeight - 300}
                      placeholder="Mulai menulis halaman Anda..."
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-56 border-l border-white/10 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-white font-medium mb-2 flex items-center text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                Status
              </h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    checked={isDraft}
                    onChange={() => setIsDraft(true)}
                    className="text-purple-500 w-3 h-3"
                  />
                  <span className="text-white/80">Draft</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    checked={!isDraft}
                    onChange={() => setIsDraft(false)}
                    className="text-purple-500 w-3 h-3"
                  />
                  <span className="text-white/80">Publish</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PageEditor;
