export interface PlayerName {
  name: string;
  pos: string;
  team: string;
}

interface SleeperPlayer {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  team?: string | null;
}

let directoryPromise: Promise<Record<string, SleeperPlayer>> | null = null;

async function loadDirectory(): Promise<Record<string, SleeperPlayer>> {
  if (!directoryPromise) {
    directoryPromise = fetch('https://api.sleeper.app/v1/players/nfl')
      .then((response) => {
        if (!response.ok) throw new Error('Sleeper player directory unavailable');
        return response.json() as Promise<Record<string, SleeperPlayer>>;
      })
      .catch((error) => {
        directoryPromise = null;
        throw error;
      });
  }
  return directoryPromise;
}

/**
 * Fetches player labels directly from Sleeper.
 * The directory is cached in memory for this browser session; no Monday server function is used.
 */
export async function getPlayerNames({ data }: { data: { ids: string[] } }): Promise<Record<string, PlayerName>> {
  const directory = await loadDirectory();
  const result: Record<string, PlayerName> = {};

  for (const id of data.ids.slice(0, 60)) {
    const player = directory[id];
    if (!player) continue;
    result[id] = {
      name: player.full_name || [player.first_name, player.last_name].filter(Boolean).join(' ') || id,
      pos: player.position ?? '',
      team: player.team ?? '',
    };
  }
  return result;
}
