import type { Team } from '@generated/lib/sleeper';
import { cn } from '@lib/utils';

export function TeamAvatar({ team, className }: { team: Team | null; className?: string }) {
  if (team?.avatar) return <img src={team.avatar} alt="" className={cn('h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border', className)} />;
  return (
    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-[family-name:var(--font-heading)] text-primary ring-1 ring-border', className)}>
      {team?.name.slice(0, 1).toUpperCase() ?? '?'}
    </div>
  );
}
