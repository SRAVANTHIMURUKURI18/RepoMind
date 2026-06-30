import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, LayoutDashboard, BookOpen, Code2, ShieldAlert,
  Zap, FileText, MessageSquareText, BarChart3, Loader2, AlertCircle, Download,
} from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import { AgentProgressPanel } from '../components/agents/AgentProgressPanel';
import { OverviewTab }     from '../components/results/OverviewTab';
import { ArchitectureTab } from '../components/results/ArchitectureTab';
import { ReviewTab }       from '../components/results/ReviewTab';
import { SecurityTab }     from '../components/results/SecurityTab';
import { PerformanceTab }  from '../components/results/PerformanceTab';
import { DocsTab }         from '../components/results/DocsTab';
import { InterviewTab }    from '../components/results/InterviewTab';
import { ScoreTab }        from '../components/results/ScoreTab';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { AgentSkeleton } from '../components/ui/LoadingSkeleton';
import { markdownReportUrl } from '../lib/api';

const TABS = [
  { key: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { key: 'architecture',  label: 'Architecture',  icon: BookOpen },
  { key: 'review',        label: 'Code Review',   icon: Code2 },
  { key: 'security',      label: 'Security',      icon: ShieldAlert },
  { key: 'performance',   label: 'Performance',   icon: Zap },
  { key: 'documentation', label: 'Docs',          icon: FileText },
  { key: 'interview',     label: 'Interview',     icon: MessageSquareText },
  { key: 'scoring',       label: 'Score',         icon: BarChart3 },
] as const;

type TabKey = typeof TABS[number]['key'];

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { status, results, loading, error, isRunning, isDone } = useAnalysis(id ?? null);

  const repoName = status?.repo_name ?? results?.repo_name ?? 'Repository';

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {/* Sub-header */}
          <div className="sticky top-0 z-20 border-b border-white/5 bg-bg/90 backdrop-blur-sm px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button id="back-btn" onClick={() => navigate('/dashboard')} className="btn-ghost rounded-lg p-2">
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h1 className="font-bold text-white text-lg leading-none">{repoName}</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRunning ? (
                      <span className="flex items-center gap-1 text-primary-400">
                        <Loader2 size={10} className="animate-spin" /> Analyzing…
                      </span>
                    ) : isDone ? 'Analysis complete' : ''}
                  </p>
                </div>
              </div>
              {isDone && id && (
                <a href={markdownReportUrl(id)} target="_blank" rel="noopener noreferrer" className="btn-secondary py-2 text-sm">
                  <Download size={14} /> Download Report
                </a>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Error state */}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Running – show progress */}
            {isRunning && status && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
                <AgentProgressPanel agents={status.agents} />
              </motion.div>
            )}

            {/* Loading agents skeleton */}
            {loading && !status && <AgentSkeleton />}

            {/* Results tabs */}
            {isDone && results && (
              <div className="space-y-6">
                {/* Tab bar */}
                <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/5">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      id={`tab-${key}`}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                        ${activeTab === key ? 'bg-primary/20 text-primary-400 border border-primary/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                      <Icon size={14} />{label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'overview'      && results.results.repository    && <OverviewTab     repo={results.results.repository}  repoName={repoName} fileCount={results.file_count} />}
                    {activeTab === 'architecture'  && results.results.architecture  && <ArchitectureTab  arch={results.results.architecture} />}
                    {activeTab === 'review'        && results.results.review        && <ReviewTab        review={results.results.review} />}
                    {activeTab === 'security'      && results.results.security      && <SecurityTab      security={results.results.security} />}
                    {activeTab === 'performance'   && results.results.performance   && <PerformanceTab   performance={results.results.performance} />}
                    {activeTab === 'documentation' && results.results.documentation && <DocsTab          docs={results.results.documentation} analysisId={id!} />}
                    {activeTab === 'interview'     && results.results.interview     && <InterviewTab     interview={results.results.interview} />}
                    {activeTab === 'scoring'       && results.results.scoring       && <ScoreTab         scoring={results.results.scoring} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
