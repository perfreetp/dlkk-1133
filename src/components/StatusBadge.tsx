import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: string;
  type?: 'vehicle' | 'task' | 'order' | 'complaint';
}

const vehicleStatusMap: Record<string, { label: string; class: string }> = {
  online: { label: '在线', class: 'bg-emerald-100 text-emerald-700' },
  offline: { label: '离线', class: 'bg-slate-100 text-slate-600' },
  riding: { label: '骑行中', class: 'bg-blue-100 text-blue-700' },
  charging: { label: '充电中', class: 'bg-amber-100 text-amber-700' },
  maintenance: { label: '维修中', class: 'bg-orange-100 text-orange-700' },
  locked: { label: '已锁定', class: 'bg-red-100 text-red-700' },
};

const taskStatusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待处理', class: 'bg-amber-100 text-amber-700' },
  in_progress: { label: '进行中', class: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', class: 'bg-emerald-100 text-emerald-700' },
};

const orderStatusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待处理', class: 'bg-amber-100 text-amber-700' },
  in_progress: { label: '处理中', class: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', class: 'bg-emerald-100 text-emerald-700' },
  reviewed: { label: '已复核', class: 'bg-purple-100 text-purple-700' },
};

const complaintStatusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待处理', class: 'bg-red-100 text-red-700' },
  processing: { label: '处理中', class: 'bg-blue-100 text-blue-700' },
  resolved: { label: '已解决', class: 'bg-emerald-100 text-emerald-700' },
  closed: { label: '已关闭', class: 'bg-slate-100 text-slate-600' },
};

export default function StatusBadge({ status, type = 'vehicle' }: StatusBadgeProps) {
  let map = vehicleStatusMap;
  if (type === 'task') map = taskStatusMap;
  if (type === 'order') map = orderStatusMap;
  if (type === 'complaint') map = complaintStatusMap;

  const cfg = map[status] || { label: status, class: 'bg-slate-100 text-slate-600' };

  return (
    <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', cfg.class)}>
      {cfg.label}
    </span>
  );
}
