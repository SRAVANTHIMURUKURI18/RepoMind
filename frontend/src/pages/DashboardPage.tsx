import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, GitBranch, FileCode2, Loader2 } from 'lucide-react';
import { UploadCard } from '../components/upload/UploadCard';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { getHistory } from '../lib/api';
import { formatRelative } from '../lib/utils';
import type { HistoryItem } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    getHistory(10)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleStarted = (id: string, _name: string) => {
    navigate(`/results/${id}`);
  };

  const statusColor: Record<string, string> = {
    completed: 'text-green-400 bg-green-500/10 border-green-500/20',
    running:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    failed:    'text-red-400 bg-red-500/10 border-red-500/20',
    pending:   'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-black text-white mb-1">Dashboard</h1>
              <p className="text-slate-400">Upload a repository and let 8 AI agents analyze it for you.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Upload card – wider */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-3"
              >
                <UploadCard onStarted={handleStarted} />
              </motion.div>

              {/* Stats panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-4"
              >
                <div className="card">
                  <h3 className="font-semibold text-slate-300 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Analyses',  value: history.length.toString(), color: 'text-primary-400' },
                      { label: 'Completed', value: history.filter(h => h.status === 'completed').length.toString(), color: 'text-green-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl bg-bg p-3 border border-white/5">
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-slate-500 mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick tips */}
                <div className="card space-y-3">
                  <h3 className="font-semibold text-slate-300">Tips</h3>
                  {[
                    'ZIP files up to 50MB are supported',
                    'Enable MOCK_AI=false for real Ollama analysis',
                    'Results are saved and accessible from History',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />{tip}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent analyses */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock size={18} className="text-primary-400" /> Recent Analyses
                </h2>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-primary-400" />
                </div>
              ) : history.length === 0 ? (
                <div className="card text-center py-10 text-slate-500">
                  <GitBranch size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No analyses yet. Upload a repository to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card flex items-center gap-4 cursor-pointer hover:border-white/15"
                      onClick={() => navigate(`/results/${item.id}`)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <FileCode2 size={18} className="text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-200 truncate">{item.repo_name}</h4>
                          {item.language && <span className="badge badge-info text-xs">{item.language}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{formatRelative(item.created_at)}</p>
                      </div>
                      {item.overall_score != null && (
                        <span className="text-lg font-bold text-gradient-primary">{item.overall_score}/10</span>
                      )}
                      <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[item.status] ?? ''}`}>
                        {item.status}
                      </span>
                      <ArrowRight size={16} className="text-slate-600 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
