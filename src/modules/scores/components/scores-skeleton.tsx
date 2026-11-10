export function ScoresSkeleton() {
  return <div className="page-width scores-loading" role="status" aria-label="Memuat skor"><div className="skeleton-title animate-pulse" /><div className="display-grid">{Array.from({ length: 12 }, (_, i) => <div key={i} className="skeleton-card animate-pulse"><div /><div /><div /></div>)}</div><span className="sr-only">Memuat skor pertandingan…</span></div>;
}
