import type { Team } from '@generated/lib/sleeper';
import { rec } from '@generated/lib/sleeper';
import { TeamAvatar } from '@generated/components/TeamAvatar';
import { cn } from '@lib/utils';

export function Standings({ teams, myId, onOpen }: { teams: Team[]; myId: number | null; onOpen: (id: number) => void }) {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold uppercase">Standings</h1>
      <p className="mb-5 text-sm text-muted-foreground">Tap a team to see its schedule. Top 6 ranks shown in gold.</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3 text-left">#</th><th className="p-3 text-left">Team</th><th className="p-3">W-L</th><th className="p-3">PF</th><th className="p-3">PA</th><th className="p-3 text-left">Div</th><th className="p-3">Strk</th></tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.rosterId} onClick={() => onOpen(t.rosterId)} className={cn('cursor-pointer border-b border-border/60 last:border-0 hover:bg-secondary', t.rosterId === myId && 'bg-primary/10')}>
                <td className={cn('p-3 font-[family-name:var(--font-heading)] text-lg font-bold', t.rank <= 6 ? 'text-primary' : 'text-muted-foreground')}>{t.rank}</td>
                <td className="p-3"><div className="flex items-center gap-2"><TeamAvatar team={t} className="h-8 w-8" /><div className="min-w-0"><p className="truncate font-semibold">{t.name}</p><p className="truncate text-xs text-muted-foreground">{t.manager}</p></div></div></td>
                <td className="p-3 text-center font-[family-name:var(--font-heading)] text-base">{rec(t)}</td>
                <td className="p-3 text-center tabular-nums">{t.pf.toFixed(1)}</td>
                <td className="p-3 text-center tabular-nums text-muted-foreground">{t.pa.toFixed(1)}</td>
                <td className="p-3 text-xs text-muted-foreground">{t.division}</td>
                <td className="p-3 text-center">{t.streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
