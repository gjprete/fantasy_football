import { RefreshCw } from 'lucide-react';
import { headshot } from '@generated/lib/history';
import { SpotlightCard, playerLabel } from '@generated/components/SpotlightCard';
import type { useHistory } from '@generated/hooks/useHistory';

export function HistoryHall({ h }: { h: ReturnType<typeof useHistory> }) {
  if (h.loading) return <div className="space-y-3"><div className="h-80 animate-pulse rounded-2xl bg-card" /><div className="h-40 animate-pulse rounded-xl bg-card" /></div>;
  if (h.error || !h.hist) return (
    <div className="rounded-2xl border border-destructive/50 bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">{h.error ?? 'No history yet.'}</p>
      <button onClick={() => void h.retry()} className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground"><RefreshCw className="h-4 w-4" />Retry</button>
    </div>
  );
  const top = h.hist.perfs.slice(0, 10);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Seasons {h.hist.seasons.slice().reverse().join(' · ')}</p>
      <h1 className="mb-5 font-[family-name:var(--font-heading)] text-4xl font-bold uppercase">Hall of History</h1>
      {h.spot ? <SpotlightCard s={h.spot} names={h.names} /> : <p className="text-muted-foreground">No completed weeks yet.</p>}
      {top.length > 0 && <>
        <h2 className="mb-3 mt-8 font-[family-name:var(--font-heading)] text-xl font-semibold uppercase">All-time top 10 starts</h2>
        <ol className="space-y-2">
          {top.map((p, i) => { const pl = playerLabel(p.playerId, h.names); return (
            <li key={`${p.season}-${p.week}-${p.playerId}-${p.team}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <span className="w-6 font-[family-name:var(--font-heading)] text-lg font-bold text-primary">{i + 1}</span>
              <img src={headshot(p.playerId)} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className="h-10 w-10 rounded-full bg-secondary object-cover" />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{pl.name}</p><p className="truncate text-xs text-muted-foreground">{p.team} · {p.season} Wk {p.week}</p></div>
              <span className="font-[family-name:var(--font-heading)] text-xl tabular-nums">{p.points.toFixed(2)}</span>
            </li>); })}
        </ol>
      </>}
    </div>
  );
}
