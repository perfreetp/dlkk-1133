import { useState } from 'react';
import { Truck, Zap, AlertTriangle, ArrowRight, User, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { clsx } from 'clsx';

export default function Dispatch() {
  const tasks = useAppStore((s) => s.dispatchTasks);
  const stations = useAppStore((s) => s.stations);
  const updateDispatchTask = useAppStore((s) => s.updateDispatchTask);
  const [activeTab, setActiveTab] = useState<'all' | 'shortage' | 'overflow' | 'low_battery'>('all');

  const typeConfig: Record<string, { label: string; icon: typeof Truck; color: string; bg: string }> = {
    shortage: { label: '缺车调度', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
    overflow: { label: '满车调度', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
    low_battery: { label: '低电量换电', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-100' },
  };

  const priorityMap: Record<string, { label: string; class: string }> = {
    high: { label: '高', class: 'bg-red-100 text-red-700' },
    medium: { label: '中', class: 'bg-amber-100 text-amber-700' },
    low: { label: '低', class: 'bg-emerald-100 text-emerald-700' },
  };

  const filteredTasks = activeTab === 'all' ? tasks : tasks.filter(t => t.type === activeTab);

  const groupedTasks = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
  };

  const getStationName = (id?: string) => stations.find(s => s.id === id)?.name || '-';

  const handleStart = (id: string) => {
    updateDispatchTask(id, { status: 'in_progress', assignee: '当前用户' });
  };

  const handleComplete = (id: string) => {
    updateDispatchTask(id, { status: 'completed' });
  };

  const renderTaskCard = (task: typeof tasks[0]) => {
    const cfg = typeConfig[task.type];
    const priCfg = priorityMap[task.priority];
    const Icon = cfg.icon;

    return (
      <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', cfg.bg)}>
              <Icon className={clsx('w-5 h-5', cfg.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
              <p className="text-xs text-slate-500">{task.createdAt}</p>
            </div>
          </div>
          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', priCfg.class)}>
            优先级 {priCfg.label}
          </span>
        </div>

        <div className="text-sm text-slate-600 space-y-1.5 mb-3">
          {task.type === 'shortage' && (
            <div className="flex items-center gap-2">
              <span>目标站点：</span>
              <span className="font-medium text-slate-800">{getStationName(task.toStationId)}</span>
              <span className="text-blue-600">需补 {task.vehicleCount} 辆</span>
            </div>
          )}
          {task.type === 'overflow' && (
            <div className="flex items-center gap-2">
              <span>{getStationName(task.fromStationId)}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-800">{getStationName(task.toStationId)}</span>
              <span className="text-amber-600">转运 {task.vehicleCount} 辆</span>
            </div>
          )}
          {task.type === 'low_battery' && (
            <div className="flex items-center gap-2">
              <span>车辆编号：</span>
              <span className="font-medium text-slate-800">EB-{task.vehicleId?.slice(1).padStart(5, '0')}</span>
            </div>
          )}
          {task.note && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">备注：{task.note}</p>
          )}
        </div>

        {task.assignee && (
          <div className="flex items-center gap-2 py-2 border-t border-slate-100">
            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <span className="text-sm text-slate-600">{task.assignee}</span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          {task.status === 'pending' && (
            <button
              onClick={() => handleStart(task.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlayCircle className="w-4 h-4" /> 开始执行
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => handleComplete(task.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <CheckCircle className="w-4 h-4" /> 完成
            </button>
          )}
          {task.status === 'completed' && (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-600 text-sm rounded-lg font-medium">
              <CheckCircle className="w-4 h-4" /> 已完成
            </div>
          )}
        </div>
      </div>
    );
  };

  const columnConfig = [
    { key: 'pending', label: '待处理', icon: Clock, count: groupedTasks.pending.length, color: 'text-amber-600', bg: 'bg-amber-100' },
    { key: 'in_progress', label: '进行中', icon: PlayCircle, count: groupedTasks.in_progress.length, color: 'text-blue-600', bg: 'bg-blue-100' },
    { key: 'completed', label: '已完成', icon: CheckCircle, count: groupedTasks.completed.length, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['all', 'shortage', 'overflow', 'low_battery'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === type
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              )}
            >
              {type === 'all' ? '全部任务' : typeConfig[type].label}
              {type !== 'all' && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/20 text-xs">
                  {tasks.filter(t => t.type === type).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30">
          智能生成调度任务
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {columnConfig.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.key} className="bg-slate-50 rounded-xl p-4 min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', col.bg)}>
                    <Icon className={clsx('w-4 h-4', col.color)} />
                  </div>
                  <span className="font-semibold text-slate-800">{col.label}</span>
                </div>
                <span className={clsx('px-2.5 py-1 rounded-full text-sm font-bold', col.bg, col.color)}>
                  {col.count}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks[col.key].map(renderTaskCard)}
                {groupedTasks[col.key].length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    暂无{col.label}任务
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden">
        {filteredTasks.map(t => <StatusBadge key={t.id} status={t.status} type="task" />)}
      </div>
    </div>
  );
}
