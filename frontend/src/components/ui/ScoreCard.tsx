import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn, scoreColor } from '../../lib/utils';

interface ScoreCardProps {
  label: string;
  score: number;
  reasoning?: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreCard({ label, score, reasoning, delay = 0, size = 'md' }: ScoreCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1200;
    const raf = () => {
      const elapsed = Date.now() - start - delay * 1000;
      if (elapsed < 0) { requestAnimationFrame(raf); return; }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(parseFloat((eased * score).toFixed(1)));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [inView, score, delay]);

  const pct = (score / 10) * 100;
  const color = scoreColor(score);
  const barColor = score >= 8 ? 'from-green-500 to-emerald-400'
    : score >= 6 ? 'from-yellow-500 to-amber-400'
    : score >= 4 ? 'from-orange-500 to-amber-500'
    : 'from-red-500 to-rose-400';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="card group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn(
          "font-semibold text-slate-300",
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>{label}</span>
        <span className={cn("font-bold tabular-nums", color,
          size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl'
        )}>
          {displayed.toFixed(1)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-3">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", barColor)}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{ delay: delay + 0.3, duration: 1.2, ease: 'easeOut' }}
        />
      </div>

      {reasoning && (
        <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
          {reasoning}
        </p>
      )}
    </motion.div>
  );
}
