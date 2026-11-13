export const LEAGUE_ID = '1312957587544637440';
export const REG_WEEKS = 14;
const BASE = 'https://api.sleeper.app/v1';

interface SUser { user_id: string; display_name: string; avatar: string | null; metadata?: { team_name?: string; avatar?: string } }
export type { SUser };

export function avatarOf(u: SUser | undefined): string | null {
  if (!u) return null;
  const m = u.metadata?.avatar;
  if (m && m.startsWith('http')) return m;
  return u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : null;
}
interface SRoster {
  roster_id: number; owner_id: string | null;
  settings: { wins?: number; losses?: number; ties?: number; fpts?: number; fpts_decimal?: number; fpts_against?: number; fpts_against_decimal?: number; division?: number };
  metadata?: { record?: string; streak?: string } | null;
}
interface SMatchup { roster_id: number; matchup_id: number | null; points: number | null }
interface SLeague { name: string; settings: { leg?: number; divisions?: number }; metadata?: Record<string, string> | null }

export interface Team {
  rosterId: number; name: string; manager: string; displayName: string; avatar: string | null;
  wins: number; losses: number; ties: number; pf: number; pa: number; streak: string; division: string; rank: number;
}
export interface LeagueData { leagueName: string; currentWeek: number; teams: Team[]; matchups: Record<number, SMatchup[]> }

export async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`Sleeper ${r.status}`);
  return r.json() as Promise<T>;
}

export async function loadLeague(): Promise<LeagueData> {
  const weeks = Array.from({ length: REG_WEEKS }, (_, i) => i + 1);
  const [league, users, rosters, ...mw] = await Promise.all([
    get<SLeague>(`/league/${LEAGUE_ID}`),
    get<SUser[]>(`/league/${LEAGUE_ID}/users`),
    get<SRoster[]>(`/league/${LEAGUE_ID}/rosters`),
    ...weeks.map((w) => get<SMatchup[]>(`/league/${LEAGUE_ID}/matchups/${w}`)),
  ]);
  const matchups: Record<number, SMatchup[]> = {};
  weeks.forEach((w, i) => { matchups[w] = (mw[i] as SMatchup[] | null) ?? []; });
  const um = new Map((users ?? []).map((u) => [u.user_id, u]));
  const teams: Team[] = (rosters ?? []).map((r) => {
    const u = r.owner_id ? um.get(r.owner_id) : undefined;
    const s = r.settings ?? {};
    const div = s.division ? league.metadata?.[`division_${s.division}`] ?? `Division ${s.division}` : '—';
    return {
      rosterId: r.roster_id,
      name: u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`,
      manager: u?.display_name ?? 'Open slot',
      displayName: u?.display_name ?? '',
      avatar: avatarOf(u),
      wins: s.wins ?? 0, losses: s.losses ?? 0, ties: s.ties ?? 0,
      pf: (s.fpts ?? 0) + (s.fpts_decimal ?? 0) / 100,
      pa: (s.fpts_against ?? 0) + (s.fpts_against_decimal ?? 0) / 100,
      streak: r.metadata?.streak ?? '—', division: div, rank: 0,
    };
  });
  teams.sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.pf - a.pf);
  teams.forEach((t, i) => { t.rank = i + 1; });
  return { leagueName: league.name, currentWeek: league.settings?.leg ?? 1, teams, matchups };
}

export interface WeekRow {
  week: number; opp: Team | null; my: number | null; their: number | null;
  state: 'final' | 'live' | 'upcoming' | 'bye'; result: 'W' | 'L' | 'T' | null; running: string;
}

export function scheduleFor(d: LeagueData, rosterId: number): WeekRow[] {
  let w = 0, l = 0, t = 0;
  const byId = new Map(d.teams.map((x) => [x.rosterId, x]));
  return Array.from({ length: REG_WEEKS }, (_, i) => {
    const week = i + 1;
    const list = d.matchups[week] ?? [];
    const me = list.find((m) => m.roster_id === rosterId);
    const op = me?.matchup_id != null ? list.find((m) => m.matchup_id === me.matchup_id && m.roster_id !== rosterId) : undefined;
    const opp = op ? byId.get(op.roster_id) ?? null : null;
    const state: WeekRow['state'] = !op ? 'bye' : week < d.currentWeek ? 'final' : week === d.currentWeek ? 'live' : 'upcoming';
    let result: WeekRow['result'] = null;
    if (state === 'final' && me && op) {
      const a = me.points ?? 0, b = op.points ?? 0;
      result = a > b ? 'W' : a < b ? 'L' : 'T';
      if (result === 'W') w++; else if (result === 'L') l++; else t++;
    }
    return {
      week, opp, my: me?.points ?? null, their: op?.points ?? null, state, result,
      running: `${w}-${l}${t ? `-${t}` : ''}`,
    };
  });
}

export const rec = (t: Team) => `${t.wins}-${t.losses}${t.ties ? `-${t.ties}` : ''}`;
export const pts = (n: number | null) => (n ?? 0).toFixed(2);
