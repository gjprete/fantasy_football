import type { LeagueData, Team } from '@generated/lib/sleeper';
import { scheduleFor, rec, pts } from '@generated/lib/sleeper';
import { TeamAvatar } from '@generated/components/TeamAvatar';
import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="truncate font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function Schedule({ data, team, mine, onSwitch, highlight }: { data: LeagueData; team: Team; mine: boolean; onSwitch?: () => void; highlight?: ReactNode }) {
  const rows = scheduleFor(data, team.rosterId);
  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_calc(10%-1px),hsl(var(--border)/0.5)_10%)]" />
        <div className="relative flex items-center gap-4">
          <TeamAvatar team={team} className="h-16 w-16 ring-2 ring-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-accent">{mine ? 'My team' : `Rank #${team.rank}`}</p>
            <h1 className="truncate font-[family-name:var(--font-heading)] text-3xl font-bold uppercase leading-tight">{team.name}</h1>
            <p className="truncate text-sm text-muted-foreground">{team.manager}</p>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-heading)] text-5xl font-bold leading-none text-primary">{rec(team)}</p>
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-4 gap-3 border-t border-border pt-4">
          <Stat label="Rank" value={`#${team.rank}`} />
          <Stat label="PF" value={team.pf.toFixed(1)} />
          <Stat label="PA" value={team.pa.toFixed(1)} />
          <Stat label="Streak" value={team.streak} />
        </div>
        {mine && onSwitch && <button onClick={onSwitch} className="relative mt-4 text-xs text-muted-foreground underline underline-offset-4 hover:text-primary">Not you? Switch team</button>}
      </section>
      {highlight}

      <h2 className="mb-3 mt-8 font-[family-name:var(--font-heading)] text-xl font-semibold uppercase tracking-wide">Regular season · Weeks 1–14</h2>
      <ol className="space-y-2">
        {rows.map((r) => {
          const cur = r.week === data.currentWeek;
          return (
            <li key={r.week} className={cn('flex items-center gap-3 rounded-xl border bg-card p-3', cur ? 'border-primary shadow-[0_0_0_1px_hsl(var(--primary))]' : 'border-border')}>
              <div className={cn('flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg', cur ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70">Wk</span>
                <span className="font-[family-name:var(--font-heading)] text-xl font-bold leading-none">{r.week}</span>
              </div>
              <TeamAvatar team={r.opp} className="hidden h-9 w-9 sm:flex" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.opp ? `vs ${r.opp.name}` : 'Bye / TBD'}</p>
                <p className="truncate text-xs text-muted-foreground">{r.opp?.manager}{r.opp && r.state !== 'final' && ` · ${rec(r.opp)}`}</p>
              </div>
              <div className="shrink-0 text-right">
                {r.state === 'final' && (
                  <div className="flex items-center gap-2">
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded font-[family-name:var(--font-heading)] font-bold', r.result === 'W' ? 'bg-accent text-accent-foreground' : r.result === 'L' ? 'bg-destructive text-foreground' : 'bg-secondary')}>{r.result}</span>
                    <span className="font-[family-name:var(--font-heading)] tabular-nums">{pts(r.my)}–{pts(r.their)}</span>
                  </div>
                )}
                {r.state === 'live' && <span className="font-[family-name:var(--font-heading)] text-primary tabular-nums">This week · {pts(r.my)}–{pts(r.their)}</span>}
                {r.state === 'upcoming' && <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Upcoming</span>}
                {r.state === 'final' && <p className="mt-0.5 text-[11px] text-muted-foreground">Record {r.running}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Playoffs begin Week 15.</p>
    </div>
  );
}
