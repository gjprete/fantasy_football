import { useCallback, useEffect, useState } from 'react';
import { loadHistory, spotlightOfDay, type History, type Spotlight } from '@generated/lib/history';
import { getPlayerNames } from '@lib/players';

export type Names = Record<string, { name: string; pos: string; team: string }>;

export function useHistory() {
  const [hist, setHist] = useState<History | null>(null);
  const [spot, setSpot] = useState<Spotlight | null>(null);
  const [names, setNames] = useState<Names>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const h = await loadHistory();
      const s = spotlightOfDay(h);
      setHist(h); setSpot(s);
      const ids = Array.from(new Set([...(s ? [s.perf.playerId] : []), ...h.perfs.slice(0, 10).map((p) => p.playerId)]));
      if (ids.length) {
        try { const n = await getPlayerNames({ data: { ids } }); setNames(n ?? {}); }
        catch (e) { console.error(e); }
      }
    } catch (e) {
      console.error(e); setError('Could not load league history from Sleeper.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  return { hist, spot, names, loading, error, retry: load };
}
