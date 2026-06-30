import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, XCircle, Loader2,
  ScanSearch, BookOpen, Code2, ShieldAlert,
  Zap, FileText, MessageSquareText, BarChart3,
} from 'lucide-react';
import type { AgentProgress } from '../../types';

const AGENT_ICONS: Record<string, React.ElementType> = {
  repository:    ScanSearch,
  architecture:  BookOpen,
  review:        Code2,
  security:      ShieldAlert,
  performance:   Zap,
  documentation: FileText,
  interview:     MessageSquareText,
  scoring:       BarChart3,
};

const AGENT_COLORS: Record<string, string> = {
  repository:    'from-violet-500 to-purple-500',
  architecture:  'from-blue-500 to-cyan-500',
  review:        'from-orange-500 to-amber-500',
  security:      'from-red-500 to-rose-500',
  performance:   'from-yellow-500 to-amber-400',
  documentation: 'from-green-500 to-emerald-500',
  interview:     'from-pink-500 to-rose-400',
  scoring:       'from-primary to-accent',
};

interface AgentProgressPanelProps {
  agents: AgentProgress[];
}

export function AgentProgressPanel({ agents }: AgentProgressPanelProps) {
  const completed = agents.filter((a) => a.status === 'completed').length;
  const total = agents.length;
  const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">Agent Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">{completed} of {total} agents completed</p>
        </div>
        <span className="text-2xl font-bold text-gradient-primary">{overallPct}%</span>
      </div>

      {/* Overall bar */}
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          animate={{ width: `${overallPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Individual agents */}
      <div className="space-y-2">
        <AnimatePresence>
          {agents.map((agent, i) => {
            const Icon = AGENT_ICONS[agent.agent_id] ?? Zap;
            const grad = AGENT_COLORS[agent.agent_id] ?? 'from-primary to-accent';
            const isRunning = agent.status === 'running';
            const isDone = agent.status === 'completed';
            const isFailed = agent.status === 'failed';

            return (
              <motion.div
                key={agent.agent_id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300
                  ${isRunning ? 'border-primary/30 bg-primary/5' : isDone ? 'border-white/5 bg-bg-secondary/50' : 'border-white/5 bg-bg-secondary/30'}`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 ${isRunning ? 'animate-pulse' : ''}`}>
                  <Icon size={14} className="text-white" />
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium truncate ${isDone ? 'text-slate-300' : isRunning ? 'text-white' : 'text-slate-500'}`}>
                      {agent.agent_name}
                    </span>
                    <span className="text-xs text-slate-600 ml-2 flex-shrink-0">
                      {isRunning && <Loader2 size={12} className="animate-spin text-primary-400" />}
                    </span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                      animate={{ width: isDone ? '100%' : isRunning ? '60%' : '0%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {isDone  && <CheckCircle2 size={16} className="text-green-400" />}
                  {isFailed && <XCircle size={16} className="text-red-400" />}
                  {!isDone && !isFailed && !isRunning && <Circle size={16} className="text-slate-700" />}
                  {isRunning && <Loader2 size={16} className="animate-spin text-primary-400" />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
