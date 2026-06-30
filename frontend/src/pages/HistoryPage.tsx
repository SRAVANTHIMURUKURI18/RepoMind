import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, ArrowRight, FileCode2, Loader2, RotateCcw } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { getHistory } from '../lib/api';
import { formatDate, formatRelative } from '../lib/utils';
import type { HistoryItem } from '../types';

export function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getHistory(50).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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
          <div className="max-w-5xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
                  <History size={28} className="text-primary-400" /> Analysis History
                </h1>
                <p className="text-slate-400">{items.length} analyses recorded</p>
              </div>
              <button id="refresh-btn" onClick={load} className="btn-ghost rounded-xl p-2.5" aria-label="Refresh">
                <RotateCcw size={16} />
              </button>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary-400" /></div>
            ) : items.length === 0 ? (
              <div className="card text-center py-16 text-slate-500">
                <History size={40} className="mx-auto mb-4 opacity-20" />
                <p>No analyses yet. Go to the dashboard to analyze a repository.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="card flex items-center gap-4 cursor-pointer hover:border-white/15 transition-all"
                    onClick={() => navigate(`/results/${item.id}`)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <FileCode2 size={18} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-200 truncate">{item.repo_name}</h4>
                        {item.language && <span className="badge badge-info text-xs">{item.language}</span>}
                        {item.framework && <span className="badge badge-info text-xs">{item.framework}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
                        <p className="text-xs text-slate-600">({formatRelative(item.created_at)})</p>
                        <span className="text-xs text-slate-600 capitalize">{item.source_type}</span>
                      </div>
                    </div>
                    {item.overall_score != null && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-gradient-primary">{item.overall_score}/10</div>
                        <div className="text-xs text-slate-500">Overall</div>
                      </div>
                    )}
                    <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[item.status] ?? ''}`}>
                      {item.status}
                    </span>
                    <ArrowRight size={16} className="text-slate-600 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
