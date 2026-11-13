import { Flame, Zap } from 'lucide-react';
import { headshot, type Spotlight } from '@generated/lib/history';
import type { Names } from '@generated/hooks/useHistory';
import { cn } from '@lib/utils';

export function playerLabel(id: string, names: Names) {
  const n = names[id];
  if (n) return { name: n.name, sub: [n.pos, n.team].filter(Boolean).join(' · ') };
  return /^[A-Z]{2,3}$/.test(id) ? { name: `${id} Defense`, sub: 'DEF' } : { name: 'Player', sub: '' };
}

function Head({ id, className }: { id: string; className?: string }) {
  return <img src={headshot(id)} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className={cn('shrink-0 rounded-full bg-secondary object-cover ring-2 ring-primary', className)} />;
}

export function SpotlightCard({ s, names, compact }: { s: Spotlight; names: Names; compact?: boolean }) {
  const p = s.perf; const pl = playerLabel(p.playerId, names);
  if (compact) return (
    <section className="mt-6 flex items-center gap-3 rounded-xl border border-accent/50 bg-gradient-to-r from-accent/15 to-card p-3">
      <Head id={p.playerId} className="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-accent"><Zap className="h-3 w-3" />Stat of the day</p>
        <p className="truncate text-sm"><b>{pl.name}</b> dropped <b className="text-primary">{p.points.toFixed(2)}</b> for {p.team} · {p.season} Wk {p.week}</p>
        <p className="truncate text-xs text-muted-foreground">{s.lines[0]}</p>
      </div>
    </section>
  );
  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/60 bg-card">
      <div className="bg-gradient-to-br from-primary/25 to-primary/5 p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.3em] text-primary"><Flame className="h-4 w-4" />Performance of the day</p>
          <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">{s.tier}</span>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Head id={p.playerId} className="h-20 w-20 sm:h-24 sm:w-24" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-[family-name:var(--font-heading)] text-3xl font-bold uppercase leading-tight sm:text-4xl">{pl.name}</h2>
            <p className="text-sm text-muted-foreground">{pl.sub}</p>
            <p className="mt-1 text-sm">{p.season} · Week {p.week}{p.playoff && ' · Playoffs'}</p>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-heading)] text-5xl font-bold leading-none text-primary sm:text-6xl">{p.points.toFixed(1)}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">points</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-y border-border text-center">
        {[['Historic', `${s.score}`], ['All-time', `#${s.rank}`], ['Team share', `${s.share.toFixed(0)}%`]].map(([l, v]) => (
          <div key={l} className="border-r border-border p-3 last:border-0"><p className="font-[family-name:var(--font-heading)] text-2xl font-semibold">{v}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm">
          <span className={cn('rounded px-2 py-0.5 font-[family-name:var(--font-heading)] font-bold', p.won ? 'bg-accent text-accent-foreground' : 'bg-destructive')}>{p.won ? 'W' : 'L'}</span>
          <span className="min-w-0 flex-1 truncate"><b>{p.team}</b> {p.teamPts.toFixed(2)} – {p.oppPts.toFixed(2)} {p.opp}</span>
          {s.clutch && <span className="text-xs font-bold uppercase text-primary">Clutch</span>}
        </div>
        <ul className="space-y-2 text-sm">{s.lines.map((l) => <li key={l} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{l}</li>)}</ul>
        <p className="mt-4 text-xs text-muted-foreground">A new legend every day. Started by {p.manager}.</p>
      </div>
    </section>
  );
}
