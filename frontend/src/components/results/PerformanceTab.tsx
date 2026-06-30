import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, FileCode2 } from 'lucide-react';
import { impactBg } from '../../lib/utils';
import type { PerformanceResult } from '../../types';

interface PerformanceTabProps { performance: PerformanceResult; }

export function PerformanceTab({ performance }: PerformanceTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <div>
            <h3 className="font-bold text-white text-lg">Performance Analysis</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">{performance.summary}</p>
          </div>
          <div className="flex gap-6 text-center">
            <div><div className="text-2xl font-bold text-red-400">{performance.high_impact}</div><div className="text-xs text-slate-500">High Impact</div></div>
            <div><div className="text-2xl font-bold text-white">{performance.total_findings}</div><div className="text-xs text-slate-500">Total</div></div>
          </div>
        </div>
      </motion.div>

      {/* Top recommendations */}
      {performance.top_recommendations.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Zap size={15} className="text-yellow-400" /> Top Recommendations
          </h4>
          <ol className="space-y-2">
            {performance.top_recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="w-5 h-5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                {r}
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* Findings */}
      <div className="space-y-3">
        {performance.findings.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="card cursor-pointer hover:border-white/15"
            onClick={() => setExpanded(expanded === f.id ? null : f.id)}
          >
            <div className="flex items-start gap-3">
              <span className={`flex-shrink-0 mt-0.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${impactBg(f.impact)}`}>
                {f.impact}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-200 text-sm">{f.title}</h4>
                  {expanded === f.id ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-600 capitalize">{f.category.replace('_', ' ')}</span>
                  {f.file_path && <span className="flex items-center gap-1 text-xs text-slate-600 font-mono"><FileCode2 size={10} />{f.file_path}</span>}
                </div>
              </div>
            </div>
            <AnimatePresence>
              {expanded === f.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 mt-3 border-t border-white/5 space-y-3">
                    <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                    <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
                      <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide">Suggestion</span>
                      <p className="text-sm text-slate-300 mt-1">{f.suggestion}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
