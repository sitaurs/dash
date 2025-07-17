import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = "Mulai menulis..."
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey="qagffr3pkuv17a8on1afax661irst1hbr4e6tbv888sz91jc" // Free TinyMCE API key
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking',
            'toc', 'imagetools', 'textpattern', 'noneditable', 'quickbars',
            'powerpaste', 'advcode', 'visualchars', 'wordcount', 'autosave'
          ],
          toolbar: [
            'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor',
            'alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist',
            'link image media table | code codesample | emoticons charmap | insertdatetime hr pagebreak',
            'searchreplace visualblocks visualchars | fullscreen preview print | help'
          ].join(' | '),
          content_style: `
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              font-size: 14px;
              line-height: 1.6;
              color: #333;
              max-width: none;
            }
            h1, h2, h3, h4, h5, h6 {
              font-weight: 600;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              color: #1a1a1a;
            }
            h1 { font-size: 2.5em; }
            h2 { font-size: 2em; }
            h3 { font-size: 1.5em; }
            h4 { font-size: 1.25em; }
            h5 { font-size: 1.1em; }
            h6 { font-size: 1em; }
            p { margin-bottom: 1em; }
            blockquote {
              border-left: 4px solid #e5e7eb;
              margin: 1.5em 0;
              padding-left: 1em;
              font-style: italic;
              color: #6b7280;
              background: #f9fafb;
              padding: 1em;
              border-radius: 4px;
            }
            code {
              background-color: #f3f4f6;
              padding: 0.2em 0.4em;
              border-radius: 0.25em;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 0.9em;
              color: #d63384;
            }
            pre {
              background-color: #1f2937;
              color: #f9fafb;
              padding: 1em;
              border-radius: 0.5em;
              overflow-x: auto;
              margin: 1em 0;
            }
            pre code {
              background: none;
              color: inherit;
              padding: 0;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5em;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              margin: 1em 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
              border: 1px solid #e5e7eb;
            }
            table th, table td {
              border: 1px solid #e5e7eb;
              padding: 0.75em;
              text-align: left;
            }
            table th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            ul, ol {
              padding-left: 1.5em;
              margin: 1em 0;
            }
            li {
              margin-bottom: 0.5em;
            }
            a {
              color: #3b82f6;
              text-decoration: underline;
            }
            a:hover {
              color: #1d4ed8;
            }
            hr {
              border: none;
              border-top: 2px solid #e5e7eb;
              margin: 2em 0;
            }
          `,
          placeholder: placeholder,
          branding: false,
          promotion: false,
          resize: true,
          elementpath: false,
          statusbar: true,
          paste_data_images: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          
          // Enhanced image upload configuration
          file_picker_callback: (callback, value, meta) => {
            if (meta.filetype === 'image') {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              
              input.addEventListener('change', (e: any) => {
                const file = e.target.files[0];
                if (file) {
                  // Show loading state
                  const loadingImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxwYXRoIGQ9Im0yMCAyIDAgMTYiIHN0cm9rZT0iIzM3NDE1MSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIHZhbHVlcz0iMCAyMCAyMDszNjAgMjAgMjAiIGR1cj0iMXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+Cjwvc3ZnPgo=';
                  
                  // Upload file to server
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  fetch('/api/content/upload', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: formData
                  })
                  .then(response => response.json())
                  .then(result => {
                    if (result.success) {
                      callback(result.data.url, {
                        alt: file.name,
                        title: file.name
                      });
                    } else {
                      alert('Upload failed: ' + result.message);
                    }
                  })
                  .catch(error => {
                    alert('Upload failed: ' + error.message);
                  });
                }
              });
              
              input.click();
            }
          },
          
          // Enhanced image upload handler for drag & drop
          images_upload_handler: async (blobInfo, progress) => {
            return new Promise((resolve, reject) => {
              const formData = new FormData();
              formData.append('file', blobInfo.blob(), blobInfo.filename());
              
              const xhr = new XMLHttpRequest();
              
              xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                  progress((e.loaded / e.total) * 100);
                }
              });
              
              xhr.addEventListener('load', () => {
                if (xhr.status === 200 || xhr.status === 201) {
                  const result = JSON.parse(xhr.responseText);
                  if (result.success) {
                    resolve(result.data.url);
                  } else {
                    reject(result.message || 'Upload failed');
                  }
                } else {
                  reject('HTTP Error: ' + xhr.status);
                }
              });
              
              xhr.addEventListener('error', () => {
                reject('Upload failed: Network error');
              });
              
              xhr.open('POST', '/api/content/upload');
              xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('auth_token')}`);
              xhr.send(formData);
            });
          },
          
          // Image tools configuration
          imagetools_cors_hosts: ['localhost', '127.0.0.1'],
          imagetools_proxy: '/api/imageproxy',
          
          // Auto-save configuration
          autosave_ask_before_unload: true,
          autosave_interval: '30s',
          autosave_prefix: 'blogger-post-',
          autosave_restore_when_empty: true,
          
          // Word count
          wordcount_countregex: /[\w\u2019\'-]+/g,
          
          // Advanced paste options
          powerpaste_word_import: 'clean',
          powerpaste_html_import: 'clean',
          
          setup: (editor) => {
            // Custom button for inserting code blocks
            editor.ui.registry.addButton('customcode', {
              text: 'Code Block',
              onAction: () => {
                editor.insertContent('<pre><code>// Your code here</code></pre>');
              }
            });
            
            // Custom button for inserting alerts/callouts
            editor.ui.registry.addMenuButton('alerts', {
              text: 'Alerts',
              fetch: (callback) => {
                const items = [
                  {
                    type: 'menuitem',
                    text: 'Info Alert',
                    onAction: () => {
                      editor.insertContent('<div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1em; margin: 1em 0; border-radius: 4px;"><strong>ℹ️ Info:</strong> Your information here</div>');
                    }
                  },
                  {
                    type: 'menuitem',
                    text: 'Warning Alert',
                    onAction: () => {
                      editor.insertContent('<div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1em; margin: 1em 0; border-radius: 4px;"><strong>⚠️ Warning:</strong> Your warning here</div>');
                    }
                  },
                  {
                    type: 'menuitem',
                    text: 'Success Alert',
                    onAction: () => {
                      editor.insertContent('<div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 1em; margin: 1em 0; border-radius: 4px;"><strong>✅ Success:</strong> Your success message here</div>');
                    }
                  },
                  {
                    type: 'menuitem',
                    text: 'Error Alert',
                    onAction: () => {
                      editor.insertContent('<div style="background: #ffebee; border-left: 4px solid #f44336; padding: 1em; margin: 1em 0; border-radius: 4px;"><strong>❌ Error:</strong> Your error message here</div>');
                    }
                  }
                ];
                callback(items);
              }
            });
            
            editor.on('init', () => {
              // Custom styling untuk dark theme compatibility
              const iframe = editor.getDoc();
              if (iframe) {
                const style = iframe.createElement('style');
                style.textContent = `
                  .mce-content-body {
                    background-color: white;
                    color: #333;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                  }
                  .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                    color: #999;
                    font-style: italic;
                  }
                `;
                iframe.head.appendChild(style);
              }
            });
            
            // Handle paste events for better formatting
            editor.on('paste', (e) => {
              // Custom paste handling if needed
            });
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor;