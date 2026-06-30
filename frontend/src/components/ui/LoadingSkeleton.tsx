export function LoadingSkeleton({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="skeleton h-5 w-1/3 rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="skeleton h-3 w-4/6 rounded" />
      </div>
    </div>
  );
}

export function AgentSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-bg-secondary p-4">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-40 rounded" />
            <div className="progress-bar">
              <div className="skeleton h-2 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
