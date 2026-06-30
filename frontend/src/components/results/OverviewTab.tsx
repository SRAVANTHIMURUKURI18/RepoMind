import { motion } from 'framer-motion';
import { FileCode2, Globe, Database, Layers, GitBranch } from 'lucide-react';
import type { RepositoryResult } from '../../types';

const LANG_COLORS: Record<string, string> = {
  Python: 'bg-blue-500', TypeScript: 'bg-blue-400', JavaScript: 'bg-yellow-400',
  Go: 'bg-cyan-400', Rust: 'bg-orange-500', Java: 'bg-red-500',
  'C++': 'bg-pink-500', Ruby: 'bg-red-400', PHP: 'bg-purple-400',
};

interface OverviewTabProps {
  repo: RepositoryResult;
  repoName: string;
  fileCount: number;
}

export function OverviewTab({ repo, repoName, fileCount }: OverviewTabProps) {
  const stats = [
    { icon: FileCode2, label: 'Total Files',  value: repo.total_files.toLocaleString() },
    { icon: Layers,    label: 'Total Lines',  value: repo.total_lines.toLocaleString() },
    { icon: Globe,     label: 'Primary Lang', value: repo.primary_language },
    { icon: Database,  label: 'Frameworks',   value: repo.frameworks.length.toString() },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <GitBranch size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{repoName}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{repo.summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card text-center"
          >
            <Icon size={20} className="text-primary-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Languages */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h4 className="font-semibold text-slate-200 mb-4">Languages Detected</h4>
        <div className="flex flex-wrap gap-2">
          {repo.languages.map((lang) => (
            <span key={lang} className="flex items-center gap-2 rounded-full border border-white/10 bg-bg px-3 py-1.5 text-sm text-slate-300">
              <span className={`w-2 h-2 rounded-full ${LANG_COLORS[lang] ?? 'bg-slate-400'}`} />
              {lang}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Frameworks */}
      {repo.frameworks.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h4 className="font-semibold text-slate-200 mb-4">Frameworks & Libraries</h4>
          <div className="flex flex-wrap gap-2">
            {repo.frameworks.map((fw) => (
              <span key={fw} className="badge badge-info">{fw}</span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Entry points */}
      {repo.entry_points.length > 0 && (
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h4 className="font-semibold text-slate-200 mb-4">Entry Points</h4>
          <div className="space-y-2">
            {repo.entry_points.map((ep) => (
              <div key={ep} className="flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
                <FileCode2 size={13} className="text-primary-400 flex-shrink-0" />
                <code className="text-xs text-slate-300 font-mono">{ep}</code>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
