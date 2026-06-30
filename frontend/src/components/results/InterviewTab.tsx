import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { levelColor } from '../../lib/utils';
import type { InterviewResult, InterviewLevel } from '../../types';

const LEVEL_LABELS: Record<InterviewLevel, string> = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
  system_design:'System Design',
  coding:       'Coding',
};

const LEVEL_ORDER: InterviewLevel[] = ['beginner', 'intermediate', 'advanced', 'system_design', 'coding'];

interface InterviewTabProps { interview: InterviewResult; }

export function InterviewTab({ interview }: InterviewTabProps) {
  const [activeLevel, setActiveLevel] = useState<InterviewLevel | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = activeLevel === 'all'
    ? interview.questions
    : interview.questions.filter((q) => q.level === activeLevel);

  return (
    <div className="space-y-6">
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-white text-lg">Interview Questions</h3>
            <p className="text-sm text-slate-400 mt-1">
              {interview.total} questions covering {interview.focus_areas.slice(0, 4).join(', ')}
            </p>
          </div>
          <span className="text-3xl font-bold text-gradient-primary">{interview.total}</span>
        </div>
      </motion.div>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2">
        <button
          id="level-all"
          onClick={() => setActiveLevel('all')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
            ${activeLevel === 'all' ? 'bg-primary/20 border-primary/40 text-primary-400' : 'border-white/10 text-slate-500 hover:text-slate-300'}`}
        >
          All ({interview.total})
        </button>
        {LEVEL_ORDER.map((lvl) => {
          const count = (interview.by_level as any)[lvl]?.length ?? 0;
          if (!count) return null;
          return (
            <button
              key={lvl}
              id={`level-${lvl}`}
              onClick={() => setActiveLevel(lvl)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
                ${activeLevel === lvl ? 'bg-primary/20 border-primary/40 text-primary-400' : 'border-white/10 text-slate-500 hover:text-slate-300'}`}
            >
              {LEVEL_LABELS[lvl]} ({count})
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card cursor-pointer hover:border-white/15"
            onClick={() => setExpanded(expanded === q.id ? null : q.id)}
          >
            <div className="flex items-start gap-3">
              <span className={`flex-shrink-0 mt-0.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${levelColor(q.level)}`}>
                {LEVEL_LABELS[q.level]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-200 text-sm leading-relaxed">{q.question}</p>
                  {expanded === q.id ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />}
                </div>
                <span className="text-xs text-slate-600 mt-1 inline-block">{q.topic}</span>
              </div>
            </div>
            <AnimatePresence>
              {expanded === q.id && q.hint && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 mt-3 border-t border-white/5">
                    <div className="flex items-start gap-2 rounded-xl bg-yellow-500/5 border border-yellow-500/15 p-3">
                      <Lightbulb size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Hint</span>
                        <p className="text-sm text-slate-300 mt-0.5">{q.hint}</p>
                      </div>
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
