import { cn, severityBg } from '../../lib/utils';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

const ICONS: Record<string, string> = {
  critical: '🔴',
  high:     '🟠',
  medium:   '🟡',
  low:      '🟢',
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const s = severity.toLowerCase();
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
      severityBg(s), className
    )}>
      <span aria-hidden>{ICONS[s] ?? '⚪'}</span>
      {s}
    </span>
  );
}
