import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { ScoreCard } from '../ui/ScoreCard';
import { gradeColor, scoreColor } from '../../lib/utils';
import type { ScoringResult } from '../../types';

interface ScoreTabProps { scoring: ScoringResult; }

const CATEGORIES: Array<keyof Pick<ScoringResult, 'architecture' | 'security' | 'performance' | 'documentation' | 'maintainability'>> =
  ['architecture', 'security', 'performance', 'documentation', 'maintainability'];

export function ScoreTab({ scoring }: ScoreTabProps) {
  const radarData = CATEGORIES.map((cat) => ({
    subject: cat.charAt(0).toUpperCase() + cat.slice(1),
    score: scoring[cat].score,
    fullMark: 10,
  }));

  return (
    <div className="space-y-6">
      {/* Overall score hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-10"
      >
        <p className="text-slate-500 text-sm uppercase tracking-widest font-semibold mb-2">Overall Score</p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.2 }}
          className="text-8xl font-black mb-2 text-gradient-primary"
        >
          {scoring.overall.toFixed(1)}
        </motion.div>
        <div className={`text-4xl font-bold ${gradeColor(scoring.grade)} mb-3`}>{scoring.grade}</div>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">{scoring.summary}</p>
      </motion.div>

      {/* Radar chart */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h4 className="font-semibold text-slate-200 mb-4">Score Distribution</h4>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter' }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#2563EB"
              fill="#2563EB"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
              formatter={(v: number) => [`${v}/10`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, i) => {
          const data = scoring[cat];
          return (
            <ScoreCard
              key={cat}
              label={data.category}
              score={data.score}
              reasoning={data.reasoning}
              delay={i * 0.08}
            />
          );
        })}
      </div>

      {/* Improvements */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h4 className="font-semibold text-slate-200 mb-4">Key Improvements</h4>
        <div className="space-y-3">
          {CATEGORIES.flatMap((cat) =>
            scoring[cat].improvements.map((imp, j) => (
              <div key={`${cat}-${j}`} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${scoreColor(scoring[cat].score).replace('text-', 'bg-')}`} />
                <div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{scoring[cat].category} · </span>
                  <span className="text-sm text-slate-400">{imp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
