import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ExternalLink, History, Trophy, User, RefreshCw } from 'lucide-react';
import { loadLeague, type LeagueData } from '@generated/lib/sleeper';
import { Welcome } from '@generated/components/Welcome';
import { Schedule } from '@generated/components/Schedule';
import { Standings } from '@generated/components/Standings';
import { cn } from '@lib/utils';
import { useHistory } from '@generated/hooks/useHistory';
import { HistoryHall } from '@generated/components/HistoryHall';
import { SpotlightCard } from '@generated/components/SpotlightCard';

type Tab = 'me' | 'league' | 'history';
const KEY = 'daboys-ffl-team';

export default function App() {
  const [data, setData] = useState<LeagueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('me');
  const [viewId, setViewId] = useState<number | null>(null);
  const hist = useHistory();
  const highlight = hist.spot ? <SpotlightCard s={hist.spot} names={hist.names} compact /> : null;

  const load = useCallback(() => {
    setLoading(true); setError(null);
    loadLeague().then(setData).catch((e: unknown) => { console.error(e); setError('Could not reach Sleeper right now.'); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const v = localStorage.getItem(KEY);
    if (v) setMyId(Number(v));
    setReady(true);
    load();
  }, [load]);

  const pick = (id: number | null) => {
    setMyId(id);
    if (id == null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, String(id));
    setTab('me');
  };

  const myTeam = data?.teams.find((t) => t.rosterId === myId) ?? null;
  const viewTeam = data?.teams.find((t) => t.rosterId === viewId) ?? null;

  let body;
  if (loading || !ready) body = <div className="space-y-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />)}</div>;
  else if (error || !data) body = (
    <div className="rounded-2xl border border-destructive/50 bg-card p-8 text-center">
      <p className="font-[family-name:var(--font-heading)] text-2xl uppercase">Flag on the play</p>
      <p className="mt-1 text-sm text-muted-foreground">{error ?? 'No data returned.'}</p>
      <button onClick={load} className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-foreground"><RefreshCw className="h-4 w-4" />Retry</button>
    </div>
  );
  else if (!myTeam && tab === 'me') return <Shell><Welcome teams={data.teams} onPick={pick} /></Shell>;
  else if (tab === 'me' && myTeam) body = <Schedule data={data} team={myTeam} mine onSwitch={() => pick(null)} highlight={highlight} />;
  else if (tab === 'league') body = viewTeam ? (
    <div><button onClick={() => setViewId(null)} className="mb-4 inline-flex h-11 items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Standings</button>
      <Schedule data={data} team={viewTeam} mine={viewTeam.rosterId === myId} /></div>
  ) : <Standings teams={data.teams} myId={myId} onOpen={setViewId} />;
  else body = <HistoryHall h={hist} />;

  return (
    <Shell week={data?.currentWeek}>
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">{body}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-[hsl(var(--sidebar))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl">
          {([['me', 'My Team', User], ['league', 'League', Trophy], ['history', 'History', History]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setTab(id); setViewId(null); }} className={cn('flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider', tab === id ? 'text-primary' : 'text-muted-foreground')}>
              <Icon className="h-5 w-5" />{label}
            </button>
          ))}
        </div>
      </nav>
    </Shell>
  );
}

function Shell({ children, week }: { children: ReactNode; week?: number }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-[hsl(var(--sidebar))]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-tight">Da boys <span className="text-primary">FFL</span></span>
            {week != null && <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">Wk {week}</span>}
          </div>
          <a href="https://sleeper.com" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary">Open in Sleeper<ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </header>
      {children}
    </div>
  );
}
