import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, X, Tag, Calendar, Globe } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { useCreatePost, useUpdatePost, usePost } from '../hooks/useApi';
import { useLoading } from '../contexts/LoadingContext';

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
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  const { data: existingPost, isLoading: loadingPost } = usePost(postId || '');
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const { show, hide } = useLoading();

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
      show();
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
    } finally {
      hide();
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
        className="glass-card w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {postId ? 'Edit Postingan' : 'Buat Postingan Baru'}
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
              disabled={createPostMutation.isPending || updatePostMutation.isPending}
              className="glass-button px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-1 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Draft</span>
            </button>
            
            <button
              onClick={() => handleSave(true)}
              disabled={createPostMutation.isPending || updatePostMutation.isPending}
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
                placeholder="Judul postingan..."
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
                      placeholder="Mulai menulis postingan Anda..."
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l border-white/10 p-4 overflow-y-auto">
            {/* Status */}
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

            {/* Labels */}
            <div className="mb-4">
              <h3 className="text-white font-medium mb-2 flex items-center text-sm">
                <Tag className="w-3 h-3 mr-1" />
                Label
              </h3>
              
              {/* Add Label */}
              <div className="flex space-x-1 mb-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tambah label..."
                  className="flex-1 glass-button px-2 py-1 text-white placeholder-white/40 text-xs"
                />
                <button
                  onClick={handleAddLabel}
                  className="glass-button px-2 py-1 text-white hover:bg-white/20 text-xs"
                >
                  +
                </button>
              </div>

              {/* Label List */}
              <div className="space-y-1">
                {labels.map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-between bg-purple-500/20 px-2 py-1 rounded text-xs"
                  >
                    <span className="text-purple-200">{label}</span>
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="text-purple-300 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Post Info */}
            {existingPost && (
              <div className="mb-4">
                <h3 className="text-white font-medium mb-2 text-sm">Info</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Status:</span>
                    <span className={`${existingPost.status === 'LIVE' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {existingPost.status}
                    </span>
                  </div>
                  {existingPost.published && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Dipublikasi:</span>
                      <span className="text-white/80 text-xs">
                        {new Date(existingPost.published).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                  {existingPost.updated && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Diperbarui:</span>
                      <span className="text-white/80 text-xs">
                        {new Date(existingPost.updated).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
              <h4 className="text-blue-300 font-medium mb-1 text-xs">💡 Tips</h4>
              <ul className="text-blue-200/80 text-xs space-y-0.5">
                <li>• Gunakan heading untuk struktur</li>
                <li>• Upload gambar drag & drop</li>
                <li>• Tambahkan label</li>
                <li>• Preview sebelum publish</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PostEditor;