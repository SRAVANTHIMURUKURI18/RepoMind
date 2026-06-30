import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Shield, AlertTriangle, FileCode2 } from 'lucide-react';
import { SeverityBadge } from '../ui/SeverityBadge';
import type { SecurityResult } from '../../types';

interface SecurityTabProps { security: SecurityResult; }

const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
  Critical: { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  High:     { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  Medium:   { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  Low:      { color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
};

export function SecurityTab({ security }: SecurityTabProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const cfg = RISK_CONFIG[security.risk_level] ?? RISK_CONFIG.Medium;

  return (
    <div className="space-y-6">
      {/* Risk level banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-5 ${cfg.bg}`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
              <Shield size={20} className={cfg.color} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Risk Level</p>
              <p className={`text-xl font-bold ${cfg.color}`}>{security.risk_level}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><div className="text-2xl font-bold text-red-400">{security.critical_count}</div><div className="text-xs text-slate-500">Critical</div></div>
            <div><div className="text-2xl font-bold text-orange-400">{security.high_count}</div><div className="text-xs text-slate-500">High</div></div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-3">{security.summary}</p>
      </motion.div>

      {/* Recommendations */}
      {security.recommendations.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-yellow-400" /> Top Recommendations
          </h4>
          <ul className="space-y-2">
            {security.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="w-5 h-5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Vulnerabilities */}
      <div className="space-y-3">
        {security.vulnerabilities.map((vuln, i) => (
          <motion.div
            key={vuln.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="card cursor-pointer hover:border-white/15"
            onClick={() => setExpanded(expanded === vuln.id ? null : vuln.id)}
          >
            <div className="flex items-start gap-3">
              <SeverityBadge severity={vuln.severity} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-200 text-sm">{vuln.title}</h4>
                  {expanded === vuln.id ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {vuln.file_path && (
                    <span className="flex items-center gap-1 text-xs text-slate-600 font-mono">
                      <FileCode2 size={10} /> {vuln.file_path}
                    </span>
                  )}
                  {vuln.cwe_id && <span className="text-xs text-slate-600">{vuln.cwe_id}</span>}
                </div>
              </div>
            </div>
            <AnimatePresence>
              {expanded === vuln.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 mt-3 border-t border-white/5 space-y-3">
                    <p className="text-sm text-slate-400 leading-relaxed">{vuln.description}</p>
                    <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/15 p-3">
                      <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Recommendation</span>
                      <p className="text-sm text-slate-300 mt-1">{vuln.recommendation}</p>
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
