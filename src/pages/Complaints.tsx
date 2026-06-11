import { useState } from 'react';
import {
  MessageCircle, AlertTriangle, DollarSign, MapPin, HelpCircle,
  User, Send, ChevronRight, Clock, CheckCircle, X
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { clsx } from 'clsx';
import type { Complaint } from '@/types';

export default function Complaints() {
  const complaints = useAppStore((s) => s.complaints);
  const updateComplaint = useAppStore((s) => s.updateComplaint);
  const [activeTab, setActiveTab] = useState<'all' | Complaint['type']>('all');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [reply, setReply] = useState('');

  const typeConfig: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string }> = {
    parking: { label: '乱停乱放', icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-100' },
    charge: { label: '扣费问题', icon: DollarSign, color: 'text-red-600', bg: 'bg-red-100' },
    find_bike: { label: '找车困难', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    other: { label: '其他问题', icon: MessageCircle, color: 'text-slate-600', bg: 'bg-slate-100' },
  };

  const filtered = activeTab === 'all' ? complaints : complaints.filter(c => c.type === activeTab);

  const tabConfig = [
    { key: 'all' as const, label: '全部', count: complaints.length },
    { key: 'parking' as const, label: '乱停乱放', count: complaints.filter(c => c.type === 'parking').length },
    { key: 'charge' as const, label: '扣费问题', count: complaints.filter(c => c.type === 'charge').length },
    { key: 'find_bike' as const, label: '找车困难', count: complaints.filter(c => c.type === 'find_bike').length },
    { key: 'other' as const, label: '其他', count: complaints.filter(c => c.type === 'other').length },
  ];

  const handleSubmitReply = () => {
    if (!selected || !reply.trim()) return;
    updateComplaint(selected.id, {
      reply,
      status: selected.status === 'pending' ? 'processing' : 'resolved',
      handler: '当前客服',
    });
    setReply('');
  };

  const handleResolve = (id: string) => updateComplaint(id, { status: 'resolved' });
  const handleClose = (id: string) => updateComplaint(id, { status: 'closed' });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 w-fit">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {tab.label}
            <span className={clsx(
              'ml-1.5 px-1.5 py-0.5 rounded text-xs',
              activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((c) => {
            const cfg = typeConfig[c.type];
            const Icon = cfg.icon;
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={clsx(
                  'bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer',
                  selected?.id === c.id && 'ring-2 ring-blue-500'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon className={clsx('w-5 h-5', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{cfg.label}</span>
                      <StatusBadge status={c.status} type="complaint" />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">{c.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> 用户{c.userId.slice(-4)}</span>
                      <span>{c.createdAt}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          {selected ? (
            <>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">投诉详情</h3>
                  <p className="text-xs text-slate-500 mt-0.5">工单号：{selected.id.toUpperCase()}</p>
                </div>
                <StatusBadge status={selected.status} type="complaint" />
              </div>

              <div className="flex-1 p-5 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">用户ID</p>
                    <p className="mt-1 font-semibold text-slate-800">{selected.userId}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">投诉类型</p>
                    <p className="mt-1 font-semibold text-slate-800">{typeConfig[selected.type].label}</p>
                  </div>
                  {selected.orderId && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">关联订单</p>
                      <p className="mt-1 font-semibold text-slate-800">{selected.orderId}</p>
                    </div>
                  )}
                  {selected.vehicleId && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">关联车辆</p>
                      <p className="mt-1 font-semibold text-slate-800">EB-{selected.vehicleId.slice(1).padStart(5, '0')}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50/50 border-l-4 border-blue-500 rounded-r-lg">
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selected.createdAt}
                  </div>
                  <p className="text-sm text-slate-700">{selected.description}</p>
                </div>

                {selected.reply && (
                  <div className="p-4 bg-emerald-50/50 border-l-4 border-emerald-500 rounded-r-lg">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {selected.handler || '客服'} 回复
                    </div>
                    <p className="text-sm text-slate-700">{selected.reply}</p>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="输入回复内容..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleSubmitReply}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  {selected.status !== 'resolved' && selected.status !== 'closed' && (
                    <button
                      onClick={() => handleResolve(selected.id)}
                      className="flex-1 py-2 text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors font-medium"
                    >
                      标记已解决
                    </button>
                  )}
                  {selected.status !== 'closed' && (
                    <button
                      onClick={() => handleClose(selected.id)}
                      className="flex-1 py-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                    >
                      关闭投诉
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm">请选择左侧投诉查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
