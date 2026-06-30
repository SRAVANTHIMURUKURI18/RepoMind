import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, FileCode2 } from 'lucide-react';
import { SeverityBadge } from '../ui/SeverityBadge';
import type { ReviewResult } from '../../types';

interface ReviewTabProps { review: ReviewResult; }

export function ReviewTab({ review }: ReviewTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const severities = ['all', 'critical', 'high', 'medium', 'low'];
  const filtered = filter === 'all' ? review.issues : review.issues.filter((i) => i.severity === filter);

  const counts = {
    all:      review.total_issues,
    critical: review.critical_count,
    high:     review.high_count,
    medium:   review.medium_count,
    low:      review.low_count,
  };

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-lg">Code Quality: <span className={`
              ${review.overall_quality === 'Excellent' ? 'text-green-400' :
                review.overall_quality === 'Good' ? 'text-blue-400' :
                review.overall_quality === 'Fair' ? 'text-yellow-400' : 'text-red-400'}`}>
              {review.overall_quality}
            </span></h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">{review.summary}</p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'Critical', val: review.critical_count, color: 'text-red-400' },
              { label: 'High',     val: review.high_count,     color: 'text-orange-400' },
              { label: 'Medium',   val: review.medium_count,   color: 'text-yellow-400' },
              { label: 'Low',      val: review.low_count,      color: 'text-green-400' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className={`text-2xl font-bold ${color}`}>{val}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {severities.map((s) => (
          <button
            key={s}
            id={`filter-${s}`}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border
              ${filter === s ? 'bg-primary/20 border-primary/40 text-primary-400' : 'border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="opacity-60">({counts[s as keyof typeof counts]})</span>
          </button>
        ))}
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {filtered.map((issue, i) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card cursor-pointer hover:border-white/15 transition-all"
            onClick={() => setExpanded(expanded === issue.id ? null : issue.id)}
          >
            <div className="flex items-start gap-3">
              <SeverityBadge severity={issue.severity} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-200 text-sm">{issue.title}</h4>
                  {expanded === issue.id ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />}
                </div>
                {issue.file_path && (
                  <div className="flex items-center gap-1 mt-1">
                    <FileCode2 size={11} className="text-slate-600" />
                    <code className="text-xs text-slate-500 font-mono">{issue.file_path}{issue.line_number ? `:${issue.line_number}` : ''}</code>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {expanded === issue.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-3 border-t border-white/5 mt-3">
                    <p className="text-sm text-slate-400 leading-relaxed">{issue.description}</p>
                    <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
                      <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide">Suggestion</span>
                      <p className="text-sm text-slate-300 mt-1">{issue.suggestion}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">No issues found for this filter.</div>
      )}
    </div>
  );
}
