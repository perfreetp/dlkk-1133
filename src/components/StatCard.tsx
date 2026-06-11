import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
};

export default function StatCard({ title, value, icon, trend, trendUp, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
          {trend && (
            <p className={clsx(
              'text-xs mt-2 font-medium',
              trendUp ? 'text-emerald-600' : 'text-red-500'
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={clsx(
          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
