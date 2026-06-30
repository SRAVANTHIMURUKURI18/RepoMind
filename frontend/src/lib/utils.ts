import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1)  return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function severityColor(s: string): string {
  const map: Record<string, string> = {
    critical: 'text-red-400',
    high:     'text-orange-400',
    medium:   'text-yellow-400',
    low:      'text-green-400',
  };
  return map[s] ?? 'text-slate-400';
}

export function severityBg(s: string): string {
  const map: Record<string, string> = {
    critical: 'bg-red-500/10 border-red-500/20 text-red-400',
    high:     'bg-orange-500/10 border-orange-500/20 text-orange-400',
    medium:   'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    low:      'bg-green-500/10 border-green-500/20 text-green-400',
  };
  return map[s] ?? 'bg-slate-500/10 border-slate-500/20 text-slate-400';
}

export function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-400';
  if (grade.startsWith('B')) return 'text-blue-400';
  if (grade.startsWith('C')) return 'text-yellow-400';
  return 'text-red-400';
}

export function scoreColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-yellow-400';
  if (score >= 4) return 'text-orange-400';
  return 'text-red-400';
}

export function scoreBarColor(score: number): string {
  if (score >= 8) return 'from-green-500 to-emerald-400';
  if (score >= 6) return 'from-yellow-500 to-amber-400';
  if (score >= 4) return 'from-orange-500 to-amber-500';
  return 'from-red-500 to-rose-400';
}

export function levelColor(level: string): string {
  const map: Record<string, string> = {
    beginner:     'bg-green-500/15 text-green-400 border-green-500/25',
    intermediate: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    advanced:     'bg-purple-500/15 text-purple-400 border-purple-500/25',
    system_design:'bg-rose-500/15 text-rose-400 border-rose-500/25',
    coding:       'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  };
  return map[level] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/25';
}

export function impactBg(impact: string): string {
  const map: Record<string, string> = {
    high:   'bg-red-500/10 border-red-500/20 text-red-400',
    medium: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    low:    'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };
  return map[impact] ?? 'bg-slate-500/10 border-slate-500/20 text-slate-400';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}
