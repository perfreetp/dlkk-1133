import { useState, useRef } from 'react';
import {
  ClipboardCheck, Plus, Camera, User, CheckCircle, Clock, PlayCircle,
  Battery, Disc, Wrench, Tag, AlertCircle, ChevronRight, X, Trash2
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { clsx } from 'clsx';
import type { InspectionOrder } from '@/types';

export default function Inspection() {
  const orders = useAppStore((s) => s.inspectionOrders);
  const vehicles = useAppStore((s) => s.vehicles);
  const updateInspectionOrder = useAppStore((s) => s.updateInspectionOrder);
  const addInspectionOrder = useAppStore((s) => s.addInspectionOrder);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'reviewed'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    vehicleId: '',
    category: 'other' as InspectionOrder['category'],
    description: '',
    photos: [] as string[],
  });
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const categoryConfig: Record<string, { label: string; icon: typeof Battery; color: string; bg: string }> = {
    battery: { label: '电池故障', icon: Battery, color: 'text-orange-600', bg: 'bg-orange-100' },
    brake: { label: '刹车故障', icon: Disc, color: 'text-red-600', bg: 'bg-red-100' },
    tire: { label: '轮胎故障', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    lock: { label: '车锁故障', icon: Tag, color: 'text-blue-600', bg: 'bg-blue-100' },
    appearance: { label: '外观损坏', icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-100' },
    other: { label: '其他问题', icon: ClipboardCheck, color: 'text-slate-600', bg: 'bg-slate-100' },
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  const getVehicleCode = (id: string) => vehicles.find(v => v.id === id)?.code || '-';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      readers.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(files[i]);
        })
      );
    }
    Promise.all(readers).then((dataUrls) => {
      setNewOrder(prev => ({ ...prev, photos: [...prev.photos, ...dataUrls] }));
    });
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleCreate = () => {
    if (!newOrder.vehicleId || !newOrder.description) return;
    addInspectionOrder({
      vehicleId: newOrder.vehicleId,
      category: newOrder.category,
      status: 'pending',
      photos: newOrder.photos,
      description: newOrder.description,
      createdAt: new Date().toLocaleString(),
    });
    setShowCreateModal(false);
    setNewOrder({ vehicleId: '', category: 'other', description: '', photos: [] });
    showToast('工单已创建');
  };

  const handleStart = (id: string) => {
    updateInspectionOrder(id, { status: 'in_progress', assignee: '当前用户' });
    showToast('工单已开始处理');
  };
  const handleComplete = (id: string) => {
    updateInspectionOrder(id, { status: 'completed', completedAt: new Date().toLocaleString(), repairNote: '已修复' });
    showToast('维修已完成');
  };
  const handleReview = (id: string) => {
    updateInspectionOrder(id, { status: 'reviewed' });
    showToast('复核已通过');
  };

  const tabConfig = [
    { key: 'all', label: '全部', count: orders.length },
    { key: 'pending', label: '待处理', count: orders.filter(o => o.status === 'pending').length },
    { key: 'in_progress', label: '处理中', count: orders.filter(o => o.status === 'in_progress').length },
    { key: 'completed', label: '已完成', count: orders.filter(o => o.status === 'completed').length },
    { key: 'reviewed', label: '已复核', count: orders.filter(o => o.status === 'reviewed').length },
  ] as const;

  const photoSlots = (photos: string[], totalSlots = 3) => {
    const slots: (string | null)[] = [...photos];
    while (slots.length < totalSlots) slots.push(null);
    return slots.slice(0, Math.max(photos.length, totalSlots));
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-lg animate-pulse">
          <CheckCircle className="w-5 h-5" /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" /> 新建工单
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {filteredOrders.map((order) => {
            const catCfg = categoryConfig[order.category];
            const Icon = catCfg.icon;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={clsx(
                  'bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer',
                  selectedOrderId === order.id && 'ring-2 ring-blue-500'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', catCfg.bg)}>
                    <Icon className={clsx('w-6 h-6', catCfg.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-800">{catCfg.label}</h4>
                        <StatusBadge status={order.status} type="order" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-slate-500">车辆：<span className="font-medium text-slate-700">{getVehicleCode(order.vehicleId)}</span></span>
                      <span className="text-slate-500">{order.createdAt}</span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600 line-clamp-1">{order.description}</p>

                    {order.assignee && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <span className="text-xs text-slate-500">处理人：{order.assignee}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedOrder && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-fit sticky top-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">工单详情</h3>
              <button onClick={() => setSelectedOrderId(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">工单号</span>
                  <span className="text-sm font-medium text-slate-700">{selectedOrder.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">问题分类</span>
                  <span className="text-sm font-medium text-slate-700">{categoryConfig[selectedOrder.category].label}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">车辆编号</span>
                  <span className="text-sm font-medium text-slate-700">{getVehicleCode(selectedOrder.vehicleId)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">创建时间</span>
                  <span className="text-sm font-medium text-slate-700">{selectedOrder.createdAt}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">问题描述</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{selectedOrder.description}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">现场照片</p>
                <div className="grid grid-cols-3 gap-2">
                  {photoSlots(selectedOrder.photos).map((photo, idx) => (
                    <div key={idx} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {photo ? (
                        <img src={photo} alt={`照片 ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.repairNote && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">维修记录</p>
                  <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg">{selectedOrder.repairNote}</p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleStart(selectedOrder.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <PlayCircle className="w-4 h-4" /> 开始处理
                  </button>
                )}
                {selectedOrder.status === 'in_progress' && (
                  <button
                    onClick={() => handleComplete(selectedOrder.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> 完成维修
                  </button>
                )}
                {selectedOrder.status === 'completed' && (
                  <button
                    onClick={() => handleReview(selectedOrder.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> 复核通过
                  </button>
                )}
                {selectedOrder.status === 'reviewed' && (
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg font-medium text-sm">
                    <Clock className="w-4 h-4" /> 已完成复核
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">新建巡检工单</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选择车辆</label>
                <select
                  value={newOrder.vehicleId}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">请选择车辆</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.code}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">问题分类</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(categoryConfig).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setNewOrder(prev => ({ ...prev, category: key as InspectionOrder['category'] }))}
                        className={clsx(
                          'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                          newOrder.category === key
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">问题描述</label>
                <textarea
                  rows={3}
                  value={newOrder.description}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请详细描述故障情况..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">上传照片</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">点击上传照片</p>
                  <p className="text-xs text-slate-400 mt-1">支持多选，仅限图片格式</p>
                </div>
                {newOrder.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {newOrder.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative group">
                        <img src={photo} alt={`预览 ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx); }}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                提交工单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
