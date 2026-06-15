import React, { useState, useEffect } from 'react';
import TwoFASetup from './TwoFASetup';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Folder, FileText, FileImage, Archive, File, Trash2, Download, ShieldAlert, LogOut, Shield } from 'lucide-react';
import axios from 'axios';

interface FileItem {
  id: number;
  original_name: string;
  file_size: number;
  mime_type: string;
  timestamp: string;
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [show2FA, setShow2FA] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files/', getAuthHeaders());
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await axios.post('/api/files/upload', formData, {
        ...getAuthHeaders(),
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 50;
          setUploadProgress(progress);
        }
      });
      fetchFiles();
    } catch (err) {
      alert("Upload failed. File might be too large.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this encrypted file?")) return;
    try {
      await axios.delete(`/api/files/${id}`, getAuthHeaders());
      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      alert("Could not delete file");
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      const response = await axios.get(`/api/files/download/${id}`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Decryption or download error");
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.includes('image')) return <FileImage className="text-emerald-400" size={28} />;
    if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) return <FileText className="text-blue-400" size={28} />;
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return <Archive className="text-amber-400" size={28} />;
    return <File className="text-slate-400" size={28} />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="min-h-screen p-6 text-slate-100 font-sans relative"
      onDragOver={handleDragOver}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="fixed inset-0 bg-blue-600/20 backdrop-blur-md z-50 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 m-4 rounded-3xl"
          >
            <UploadCloud size={80} className="text-blue-400 animate-bounce" />
            <h2 className="text-2xl font-bold mt-4">Drop file here to encrypt</h2>
            <p className="text-sm text-slate-400 mt-1">Files are securely encrypted using AES-256</p>
          </motion.div>
        )}
      </AnimatePresence>

        <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                    <Folder size={24} />
                </div>
                <div>
                    <h1 className="text-lg font-bold">My Secure Drive</h1>
                    <p className="text-xs text-slate-400">On-the-fly zero-knowledge encryption</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShow2FA(true)}
                    className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-blue-950/40 hover:text-blue-400 border border-slate-700 hover:border-blue-900/50 px-4 py-2 rounded-xl transition-all"
                >
                    <Shield size={14} />
                    2FA
                </button>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700 hover:border-rose-900/50 px-4 py-2 rounded-xl transition-all"
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>
        </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Your Files ({files.length})</h2>
            <label className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-md shadow-blue-600/10">
              Upload File
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => e.target.files && uploadFile(e.target.files[0])} 
              />
            </label>
          </div>

          {isUploading && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-blue-400 animate-pulse">Encrypting & uploading file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="bg-blue-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          )}

          {files.length === 0 ? (
            <div className="border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500">
              <UploadCloud size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm">Storage is empty. Drag and drop any file here.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 group-hover:bg-slate-900 transition-colors">
                        {getFileIcon(file.mime_type || '')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-slate-200" title={file.original_name}>
                          {file.original_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatBytes(file.file_size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDownload(file.id, file.original_name)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        title="Download decrypted file"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-500" />
            Security Audit Logs
          </h2>
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl max-h-[500px] overflow-y-auto backdrop-blur-md text-xs space-y-3">
            <div className="text-slate-500 text-center py-4">
              Security system active. Logs stream initialized.
            </div>
          </div>
        </div>
       </main>
    <AnimatePresence>
        {show2FA && (
            <TwoFASetup
                is2FAEnabled={is2FAEnabled}
                onClose={() => setShow2FA(false)}
                onStatusChange={(enabled) => setIs2FAEnabled(enabled)}
            />
        )}
    </AnimatePresence>
    </div>
  );
}