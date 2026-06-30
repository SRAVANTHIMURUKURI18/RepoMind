import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Github, ArrowRight, X, FileArchive, Loader2, AlertCircle } from 'lucide-react';
import { uploadZip, analyzeGithub } from '../../lib/api';
import toast from 'react-hot-toast';

interface UploadCardProps {
  onStarted: (id: string, name: string) => void;
}

export function UploadCard({ onStarted }: UploadCardProps) {
  const [mode, setMode] = useState<'zip' | 'github'>('zip');
  const [githubUrl, setGithubUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    setError(null);
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (r) => setError(r[0]?.errors[0]?.message ?? 'File rejected'),
  });

  const handleSubmit = async () => {
    setError(null);
    setUploading(true);
    try {
      if (mode === 'zip') {
        if (!file) { setError('Please select a ZIP file'); setUploading(false); return; }
        const { analysis_id, repo_name } = await uploadZip(file, setProgress);
        toast.success(`Analysis started for ${repo_name}`);
        onStarted(analysis_id, repo_name);
      } else {
        if (!githubUrl.trim()) { setError('Please enter a GitHub URL'); setUploading(false); return; }
        const { analysis_id, repo_name } = await analyzeGithub(githubUrl.trim());
        toast.success(`Cloning ${repo_name}…`);
        onStarted(analysis_id, repo_name);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Analyze a Repository</h2>
        <p className="text-sm text-slate-400">Upload a ZIP file or paste a GitHub URL to start your AI analysis.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-bg border border-white/5">
        {(['zip', 'github'] as const).map((m) => (
          <button
            key={m}
            id={`mode-${m}`}
            onClick={() => { setMode(m); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === m ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-white'}`}
          >
            {m === 'zip' ? <FileArchive size={15} /> : <Github size={15} />}
            {m === 'zip' ? 'Upload ZIP' : 'GitHub URL'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'zip' ? (
          <motion.div
            key="zip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div
              {...getRootProps()}
              id="dropzone"
              className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200
                ${isDragActive ? 'border-primary bg-primary/10' : file ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-primary/40 hover:bg-primary/5'}`}
            >
              <input {...getInputProps()} id="file-input" />
              <AnimatePresence>
                {file ? (
                  <motion.div key="file" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <FileArchive size={24} className="text-green-400" />
                    </div>
                    <p className="font-semibold text-green-400">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      id="clear-file"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={12} /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="empty" className="space-y-3">
                    <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                      ${isDragActive ? 'bg-primary/20' : 'bg-bg-tertiary'}`}>
                      <Upload size={26} className={isDragActive ? 'text-primary-400' : 'text-slate-500'} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">
                        {isDragActive ? 'Drop it here!' : 'Drag & drop your ZIP'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">or click to browse · Max 50 MB</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="github"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <div className="relative">
              <Github size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="github-url-input"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="https://github.com/owner/repository"
                className="input pl-11"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['https://github.com/fastapi/fastapi', 'https://github.com/vitejs/vite'].map((url) => (
                <button
                  key={url}
                  onClick={() => setGithubUrl(url)}
                  className="text-xs text-slate-500 hover:text-primary-400 border border-white/5 rounded-lg px-2 py-1 hover:border-primary/20 transition-all"
                >
                  {url.split('/').slice(-2).join('/')}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3"
          >
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress */}
      {uploading && progress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Uploading…</span><span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-fill" animate={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        id="analyze-btn"
        onClick={handleSubmit}
        disabled={uploading}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
        ) : (
          <><ArrowRight size={16} /> Start Analysis</>
        )}
      </button>
    </div>
  );
}
