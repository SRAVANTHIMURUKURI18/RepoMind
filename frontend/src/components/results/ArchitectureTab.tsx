import { motion } from 'framer-motion';
import { BookOpen, Network, Code2, Database, Lock, ArrowRight } from 'lucide-react';
import type { ArchitectureResult } from '../../types';

const SECTION_ICONS: Record<string, React.ElementType> = {
  '📁': BookOpen, '🔄': Network, '🌐': Code2, '🗄️': Database, '🔐': Lock,
};

interface ArchitectureTabProps { arch: ArchitectureResult; }

export function ArchitectureTab({ arch }: ArchitectureTabProps) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="font-bold text-white text-lg mb-3">Overview</h3>
        <p className="text-slate-400 leading-relaxed">{arch.overview}</p>
      </motion.div>

      {/* Tech stack */}
      {arch.tech_stack.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h4 className="font-semibold text-slate-200 mb-4">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {arch.tech_stack.map((t) => (
              <span key={t} className="badge badge-info">{t}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Request Flow */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2"><Network size={16} className="text-primary-400" /> Request Flow</h4>
        <div className="space-y-2">
          {arch.request_flow.split('\n').filter(Boolean).map((line, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
              <p className="text-sm text-slate-400 leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sections */}
      {arch.sections.map((sec, i) => (
        <motion.div
          key={sec.title}
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.06 }}
        >
          <h4 className="font-semibold text-slate-200 mb-2 text-base">{sec.title}</h4>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">{sec.description}</p>
          {sec.details.length > 0 && (
            <ul className="space-y-2">
              {sec.details.map((d, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                  <ArrowRight size={13} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}
    </div>
  );
}
