import { get, avatarOf, LEAGUE_ID, type SUser } from '@generated/lib/sleeper';

interface L { season: string; status: string; previous_league_id: string | null; settings: { leg?: number; playoff_week_start?: number } }
interface R { roster_id: number; owner_id: string | null }
interface M { roster_id: number; matchup_id: number | null; points: number | null; starters?: string[]; starters_points?: number[] }

export interface Perf {
  playerId: string; points: number; season: string; week: number; playoff: boolean;
  team: string; manager: string; avatar: string | null; opp: string;
  teamPts: number; oppPts: number; won: boolean; weekRank: number;
}
export interface History { perfs: Perf[]; seasons: string[] }

async function season(id: string) {
  const [lg, users, rosters] = await Promise.all([get<L>(`/league/${id}`), get<SUser[]>(`/league/${id}/users`), get<R[]>(`/league/${id}/rosters`)]);
  const ps = lg.settings.playoff_week_start ?? 15;
  const last = lg.status === 'complete' ? Math.min(ps + 2, 18) : Math.max(0, (lg.settings.leg ?? 1) - 1);
  const weeks = Array.from({ length: last }, (_, i) => i + 1);
  const all = await Promise.all(weeks.map((w) => get<M[]>(`/league/${id}/matchups/${w}`).catch(() => [] as M[])));
  const um = new Map((users ?? []).map((u) => [u.user_id, u]));
  const team = new Map((rosters ?? []).map((r) => {
    const u = r.owner_id ? um.get(r.owner_id) : undefined;
    return [r.roster_id, { name: u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`, manager: u?.display_name ?? '—', avatar: avatarOf(u) }];
  }));
  const perfs: Perf[] = [];
  weeks.forEach((w, i) => {
    const list = (all[i] ?? []).filter((m) => m.matchup_id != null);
    const wk: Perf[] = [];
    for (const m of list) {
      const o = list.find((x) => x.matchup_id === m.matchup_id && x.roster_id !== m.roster_id);
      if (!o) continue;
      const t = team.get(m.roster_id), ot = team.get(o.roster_id);
      (m.starters ?? []).forEach((pid, k) => {
        const pts = m.starters_points?.[k] ?? 0;
        if (!pid || pid === '0' || pts <= 0) return;
        wk.push({ playerId: pid, points: pts, season: lg.season, week: w, playoff: w >= ps, team: t?.name ?? '—', manager: t?.manager ?? '—', avatar: t?.avatar ?? null,
          opp: ot?.name ?? '—', teamPts: m.points ?? 0, oppPts: o.points ?? 0, won: (m.points ?? 0) > (o.points ?? 0), weekRank: 0 });
      });
    }
    wk.sort((a, b) => b.points - a.points).forEach((p, j) => { p.weekRank = j + 1; });
    perfs.push(...wk);
  });
  return { perfs, season: lg.season, prev: lg.previous_league_id };
}

export async function loadHistory(): Promise<History> {
  const perfs: Perf[] = []; const seasons: string[] = [];
  let id: string | null = LEAGUE_ID;
  for (let n = 0; id && id !== '0' && n < 10; n++) {
    const s = await season(id);
    perfs.push(...s.perfs); seasons.push(s.season); id = s.prev;
  }
  perfs.sort((a, b) => b.points - a.points);
  return { perfs, seasons };
}

export function dayKey(d = new Date()) { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export interface Spotlight { perf: Perf; rank: number; total: number; pct: number; share: number; clutch: boolean; margin: number; score: number; tier: string; lines: string[] }

export function spotlightOfDay(h: History): Spotlight | null {
  const pool = h.perfs.slice(0, Math.max(10, Math.min(60, Math.ceil(h.perfs.length * 0.02))));
  if (!pool.length) return null;
  const idx = hash(dayKey()) % pool.length;
  const perf = pool[idx]!; const rank = idx + 1; const total = h.perfs.length;
  const pct = 100 - (rank / total) * 100;
  const share = perf.teamPts ? (perf.points / perf.teamPts) * 100 : 0;
  const margin = Math.abs(perf.teamPts - perf.oppPts);
  const clutch = perf.won && margin < perf.points;
  const score = Math.round(Math.min(100, pct * 0.6 + Math.min(share, 45) * 0.6 + (clutch ? 12 : 0) + (perf.playoff ? 10 : 0) + (perf.weekRank === 1 ? 5 : 0)));
  const tier = score >= 90 ? 'Legendary' : score >= 75 ? 'Historic' : score >= 60 ? 'Big-time' : 'Notable';
  const lines = [
    `#${rank} best start of ${total.toLocaleString()} in league history (top ${Math.max(0.1, 100 - pct).toFixed(1)}%).`,
    `${share.toFixed(0)}% of ${perf.team}'s ${perf.teamPts.toFixed(2)} points that week.`,
    perf.weekRank === 1 ? 'Top-scoring starter in the entire league that week.' : `#${perf.weekRank} starter in the league that week.`,
    clutch ? `Clutch: won by ${margin.toFixed(2)} — without him, it's a loss.` : perf.won ? `Comfortable win by ${margin.toFixed(2)}.` : `Heartbreak: still lost by ${margin.toFixed(2)}.`,
  ];
  if (perf.playoff) lines.push('Came in the playoffs, when it mattered most.');
  return { perf, rank, total, pct, share, clutch, margin, score, tier, lines };
}

export function headshot(id: string) {
  return /^[A-Z]{2,3}$/.test(id) ? `https://sleepercdn.com/images/team_logos/nfl/${id.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/thumb/${id}.jpg`;
}
