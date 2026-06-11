import { clsx } from 'clsx';

interface BatteryIndicatorProps {
  level: number;
  size?: 'sm' | 'md';
}

export default function BatteryIndicator({ level, size = 'md' }: BatteryIndicatorProps) {
  const color = level > 50 ? 'bg-emerald-500' : level > 20 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = level > 50 ? 'text-emerald-600' : level > 20 ? 'text-amber-600' : 'text-red-600';
  const width = clsx(size === 'sm' ? 'w-10 h-4' : 'w-16 h-5');

  return (
    <div className="flex items-center gap-2">
      <div className={clsx('relative border-2 border-slate-300 rounded-sm', width)}>
        <div
          className={clsx('h-full rounded-sm transition-all', color)}
          style={{ width: `${level}%` }}
        />
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-2 bg-slate-300 rounded-r-sm" />
      </div>
      <span className={clsx('text-sm font-semibold', textColor)}>{level}%</span>
    </div>
  );
}
