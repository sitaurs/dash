import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, X, Tag, Calendar, Globe } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { useCreatePost, useUpdatePost, usePost } from '../hooks/useApi';

interface PostEditorProps {
  postId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ postId, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [isDraft, setIsDraft] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const { data: existingPost, isLoading: loadingPost } = usePost(postId || '');
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title || '');
      setContent(existingPost.content || '');
      setLabels(existingPost.labels || []);
      setIsDraft(existingPost.status !== 'LIVE');
    } else if (!postId) {
      // Reset form for new post
      setTitle('');
      setContent('');
      setLabels([]);
      setIsDraft(true);
    }
  }, [existingPost, postId]);

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      alert('Judul postingan tidak boleh kosong');
      return;
    }

    if (!content.trim()) {
      alert('Konten postingan tidak boleh kosong');
      return;
    }

    const postData = {
      title: title.trim(),
      content: content,
      labels: labels,
      isDraft: !publish
    };

    try {
      if (postId) {
        await updatePostMutation.mutateAsync({ postId, postData });
        alert(publish ? 'Postingan berhasil dipublikasi' : 'Postingan berhasil disimpan');
      } else {
        await createPostMutation.mutateAsync(postData);
        alert(publish ? 'Postingan berhasil dipublikasi' : 'Draf berhasil disimpan');
      }
      
      onSave?.();
      onClose();
    } catch (error: any) {
      alert('Gagal menyimpan postingan: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {postId ? 'Edit Postingan' : 'Buat Postingan Baru'}
            </h2>
            <p className="text-white/60 mt-1">
              {isDraft ? 'Mode Draft' : 'Mode Publish'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="glass-button px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </button>
            
            <button
              onClick={() => handleSave(false)}
              disabled={createPostMutation.isPending || updatePostMutation.isPending}
              className="glass-button px-4 py-2 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>
            
            <button
              onClick={() => handleSave(true)}
              disabled={createPostMutation.isPending || updatePostMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Publikasi</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {/* Title Input */}
            <div className="p-6 border-b border-white/10">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul postingan..."
                className="w-full text-2xl font-bold bg-transparent text-white placeholder-white/40 border-none outline-none"
              />
            </div>

            {/* Editor/Preview */}
            <div className="flex-1 overflow-hidden">
              {isPreview ? (
                <div className="h-full overflow-y-auto p-6">
                  <div className="prose prose-lg max-w-none">
                    <h1 className="text-white text-3xl font-bold mb-6">{title || 'Untitled'}</h1>
                    <div 
                      className="text-white/90 leading-relaxed prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full p-6">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    height={600}
                    placeholder="Mulai menulis postingan Anda..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-white/10 p-6 overflow-y-auto">
            {/* Status */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Status
              </h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isDraft}
                    onChange={() => setIsDraft(true)}
                    className="text-purple-500"
                  />
                  <span className="text-white/80">Draft</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isDraft}
                    onChange={() => setIsDraft(false)}
                    className="text-purple-500"
                  />
                  <span className="text-white/80">Publish</span>
                </label>
              </div>
            </div>

            {/* Labels */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Label
              </h3>
              
              {/* Add Label */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tambah label..."
                  className="flex-1 glass-button px-3 py-2 text-white placeholder-white/40 text-sm"
                />
                <button
                  onClick={handleAddLabel}
                  className="glass-button px-3 py-2 text-white hover:bg-white/20 text-sm"
                >
                  Tambah
                </button>
              </div>

              {/* Label List */}
              <div className="space-y-2">
                {labels.map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-between bg-purple-500/20 px-3 py-2 rounded-lg"
                  >
                    <span className="text-purple-200 text-sm">{label}</span>
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="text-purple-300 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Post Info */}
            {existingPost && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Informasi</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className={`${existingPost.status === 'LIVE' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {existingPost.status}
                    </span>
                  </div>
                  {existingPost.published && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Dipublikasi:</span>
                      <span className="text-white/80">
                        {new Date(existingPost.published).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                  {existingPost.updated && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Diperbarui:</span>
                      <span className="text-white/80">
                        {new Date(existingPost.updated).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">💡 Tips</h4>
              <ul className="text-blue-200/80 text-sm space-y-1">
                <li>• Gunakan heading (H1-H6) untuk struktur yang baik</li>
                <li>• Upload gambar langsung dengan drag & drop</li>
                <li>• Tambahkan label untuk kategorisasi</li>
                <li>• Preview sebelum publikasi</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostEditor;