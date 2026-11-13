import { useState } from 'react';
import type { Team } from '@generated/lib/sleeper';
import { rec } from '@generated/lib/sleeper';
import { TeamAvatar } from '@generated/components/TeamAvatar';

export function Welcome({ teams, onPick }: { teams: Team[]; onPick: (id: number) => void }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const match = () => {
    const q = name.trim().toLowerCase();
    const t = teams.find((x) => x.displayName.toLowerCase() === q);
    if (t) onPick(t.rosterId);
    else setErr("No team found for that Sleeper username. Pick yours from the list below.");
  };
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Da boys FFL · 2026</p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-5xl font-bold uppercase leading-none tracking-tight">Which team <span className="text-primary">is yours?</span></h1>
      <form onSubmit={(e) => { e.preventDefault(); match(); }} className="mt-8 flex gap-2">
        <input value={name} onChange={(e) => { setName(e.target.value); setErr(null); }} placeholder="Your Sleeper username"
          className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-card px-4 text-base outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" disabled={!name.trim()} className="h-12 rounded-lg bg-primary px-5 font-[family-name:var(--font-heading)] font-semibold uppercase text-primary-foreground disabled:opacity-50">Find me</button>
      </form>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground"><span className="h-px flex-1 bg-border" />or tap your team<span className="h-px flex-1 bg-border" /></div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {teams.map((t) => (
          <li key={t.rosterId}>
            <button onClick={() => onPick(t.rosterId)} className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary">
              <TeamAvatar team={t} />
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{t.name}</span><span className="block truncate text-xs text-muted-foreground">{t.manager}</span></span>
              <span className="font-[family-name:var(--font-heading)] text-muted-foreground">{rec(t)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
