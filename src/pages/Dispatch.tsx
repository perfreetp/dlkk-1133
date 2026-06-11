import { useState, useEffect } from 'react';
import {
  Truck, Zap, AlertTriangle, ArrowRight, User, CheckCircle, Clock,
  PlayCircle, X, Settings, MapPin, AlertCircle, Route, Plus, Battery,
  Info, CheckSquare, Square
} from 'lucide-react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { clsx } from 'clsx';
import type { DispatchTask, Vehicle } from '@/types';

type TaskType = 'shortage' | 'overflow' | 'low_battery';
type Priority = 'high' | 'medium' | 'low';
type ShortageSource = 'station' | 'specific' | '';

type DispatchTaskWithVehicleIds = DispatchTask & { vehicleIds?: string[] };

interface PlannerForm {
  type: TaskType;
  toStationId: string;
  fromStationId: string;
  vehicleCount: string;
  vehicleId: string;
  vehicleIds: string[];
  priority: Priority;
  note: string;
  source: ShortageSource;
}

const emptyForm: PlannerForm = {
  type: 'shortage',
  toStationId: '',
  fromStationId: '',
  vehicleCount: '',
  vehicleId: '',
  vehicleIds: [],
  priority: 'medium',
  note: '',
  source: '',
};

export default function Dispatch() {
  const tasks = useAppStore((s) => s.dispatchTasks);
  const stations = useAppStore((s) => s.stations);
  const vehicles = useAppStore((s) => s.vehicles);
  const addDispatchTask = useAppStore((s) => s.addDispatchTask);
  const updateDispatchTask = useAppStore((s) => s.updateDispatchTask);
  const executeDispatchTask = useAppStore((s) => s.executeDispatchTask);

  const [activeTab, setActiveTab] = useState<'all' | TaskType>('all');
  const [showPlanner, setShowPlanner] = useState(false);
  const [form, setForm] = useState<PlannerForm>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [pathPopupTaskId, setPathPopupTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

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
  const getVehicleCode = (id?: string) => vehicles.find(v => v.id === id)?.code || '-';
  const getVehicle = (id?: string) => vehicles.find(v => v.id === id);

  const fullStations = stations.filter(s => (s.currentCount / s.capacity) > 0.7);

  const getAvailableVehiclesAtStation = (stationId: string) => {
    return vehicles.filter(v => v.stationId === stationId && v.status !== 'maintenance');
  };

  const getOnlineVehicles = () => {
    return vehicles.filter(v => v.status === 'online');
  };

  const openPlanner = () => {
    setForm(emptyForm);
    setShowPlanner(true);
  };

  const closePlanner = () => {
    setShowPlanner(false);
    setForm(emptyForm);
  };

  const updateForm = (field: keyof PlannerForm, value: string | string[] | ShortageSource) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'fromStationId' && form.type === 'overflow') {
        updated.vehicleIds = [];
        updated.vehicleCount = '';
      }
      if (field === 'source' || (field === 'fromStationId' && form.type === 'shortage')) {
        updated.vehicleIds = [];
        updated.vehicleCount = '';
      }
      if (field === 'vehicleIds' && Array.isArray(value)) {
        updated.vehicleCount = value.length.toString();
      }
      return updated;
    });
  };

  const toggleVehicleId = (vehicleId: string) => {
    setForm((prev) => {
      const newIds = prev.vehicleIds.includes(vehicleId)
        ? prev.vehicleIds.filter(id => id !== vehicleId)
        : [...prev.vehicleIds, vehicleId];
      return {
        ...prev,
        vehicleIds: newIds,
        vehicleCount: newIds.length.toString(),
      };
    });
  };

  const toggleSelectAllVehicles = (vehicleList: Vehicle[]) => {
    const allIds = vehicleList.map(v => v.id);
    const allSelected = vehicleList.every(v => form.vehicleIds.includes(v.id));
    setForm((prev) => ({
      ...prev,
      vehicleIds: allSelected ? [] : allIds,
      vehicleCount: allSelected ? '0' : allIds.length.toString(),
    }));
  };



  const renderVehicleChips = (task: DispatchTask) => {
    let vehicleList: { id: string; code: string }[] = [];
    const t = task as DispatchTaskWithVehicleIds;
    
    if (t.vehicleIds && t.vehicleIds.length > 0) {
      vehicleList = t.vehicleIds.map(id => ({
        id,
        code: getVehicleCode(id)
      }));
    } else if (t.vehicleId) {
      vehicleList = [{ id: t.vehicleId, code: getVehicleCode(t.vehicleId) }];
    }

    if (vehicleList.length === 0) return null;

    const displayVehicles = vehicleList.slice(0, 3);
    const remaining = vehicleList.length - 3;

    return (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {displayVehicles.map((v) => (
          <span
            key={v.id}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
          >
            {v.code}
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            +{remaining} 辆
          </span>
        )}
      </div>
    );
  };

  const handleGenerateTask = () => {
    if (form.type === 'shortage') {
      if (!form.source) {
        showToast('请先选择调出来源', 'error');
        return;
      }
      if (!form.toStationId) {
        showToast('请选择目标站点', 'error');
        return;
      }
      if (form.source === 'station' && !form.fromStationId) {
        showToast('请选择调出站点', 'error');
        return;
      }
      if (form.vehicleIds.length === 0) {
        showToast('请至少选择一辆车', 'error');
        return;
      }
    } else if (form.type === 'overflow') {
      if (!form.fromStationId) {
        showToast('请选择调出站点', 'error');
        return;
      }
      if (!form.toStationId) {
        showToast('请选择调入站点', 'error');
        return;
      }
      if (form.fromStationId === form.toStationId) {
        showToast('调出站点和调入站点不能相同', 'error');
        return;
      }
      if (form.vehicleIds.length === 0) {
        showToast('请至少选择一辆车', 'error');
        return;
      }
    } else if (form.type === 'low_battery') {
      if (!form.vehicleId) {
        showToast('请选择车辆', 'error');
        return;
      }
    }

    const taskData: Omit<DispatchTask, 'id'> & { vehicleIds?: string[] } = {
      type: form.type,
      priority: form.priority,
      status: 'pending',
      createdAt: new Date().toLocaleString(),
      note: form.note.trim() || undefined,
    };

    if (form.type === 'shortage') {
      taskData.toStationId = form.toStationId;
      taskData.vehicleCount = form.vehicleIds.length;
      taskData.vehicleIds = [...form.vehicleIds];
      if (form.source === 'station') {
        taskData.fromStationId = form.fromStationId;
      } else if (form.source === 'specific') {
        const firstVehicle = vehicles.find(v => v.id === form.vehicleIds[0]);
        if (firstVehicle?.stationId) {
          taskData.fromStationId = firstVehicle.stationId;
        }
      }
    } else if (form.type === 'overflow') {
      taskData.fromStationId = form.fromStationId;
      taskData.toStationId = form.toStationId;
      taskData.vehicleCount = form.vehicleIds.length;
      taskData.vehicleIds = [...form.vehicleIds];
    } else if (form.type === 'low_battery') {
      taskData.vehicleId = form.vehicleId;
      taskData.vehicleIds = [form.vehicleId];
    }

    addDispatchTask(taskData as Omit<DispatchTask, 'id'>);
    showToast('调度任务已创建');
    closePlanner();
  };

  const handleStart = (id: string) => {
    updateDispatchTask(id, { status: 'in_progress', assignee: '当前用户' });
    showToast('任务已开始执行');
  };

  const handleExecute = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const t = task as DispatchTaskWithVehicleIds;

    if (t.type === 'shortage' && !t.fromStationId) {
      showToast('请先选择调出站点', 'error');
      return;
    }

    const selectedCount = t.vehicleIds?.length || t.vehicleCount || 0;
    if (selectedCount === 0) {
      showToast('没有可调度的车辆', 'error');
      return;
    }

    if (task.fromStationId) {
      const fromStation = stations.find(s => s.id === task.fromStationId);
      if (!fromStation || fromStation.currentCount === 0) {
        showToast('调出站点没有可用车辆', 'error');
        return;
      }
      const actualCount = Math.min(selectedCount, fromStation.currentCount);
      if (actualCount <= 0) {
        showToast('调出站点车辆不足', 'error');
        return;
      }
    }

    executeDispatchTask(id);
    showToast('任务执行完成，站点数据已更新');
  };

  const renderPathPopup = (task: DispatchTask) => {
    const t = task as DispatchTaskWithVehicleIds;
    const fromStation = t.fromStationId ? stations.find(s => s.id === t.fromStationId) : null;
    const toStation = t.toStationId ? stations.find(s => s.id === t.toStationId) : null;
    const vehicleCount = t.vehicleIds?.length || t.vehicleCount || 0;

    return (
      <div className="absolute z-20 top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">调度路径</span>
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            {fromStation && (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="w-0.5 h-10 bg-slate-200" />
                </div>
                <div className="pb-4">
                  <p className="text-xs text-slate-500">起点</p>
                  <p className="text-sm font-semibold text-slate-800">{fromStation.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fromStation.address}</p>
                </div>
              </div>
            )}
            {toStation && (
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">终点</p>
                  <p className="text-sm font-semibold text-slate-800">{toStation.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{toStation.address}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 px-4 py-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">转运车辆</span>
              <span className="font-semibold text-blue-600">{vehicleCount} 辆</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskCard = (task: DispatchTask) => {
    const t = task as DispatchTaskWithVehicleIds;
    const cfg = typeConfig[t.type];
    const priCfg = priorityMap[t.priority];
    const Icon = cfg.icon;
    const showPathPopup = pathPopupTaskId === t.id;
    const vehicleCount = t.vehicleIds?.length || t.vehicleCount || 0;

    return (
      <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative">
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

        {(task.type === 'overflow' || task.type === 'shortage') && (
          <div className="mb-2">
            <p className="text-xs text-slate-500 mb-1">调出车辆:</p>
            {renderVehicleChips(task)}
          </div>
        )}

        {task.type === 'low_battery' && (
          <div className="mb-2">
            {renderVehicleChips(task)}
          </div>
        )}

        <div className="text-sm text-slate-600 space-y-2 mb-3">
          {task.type === 'shortage' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-slate-500">目标站点：</span>
                <span className="font-medium text-slate-800">{getStationName(task.toStationId)}</span>
              </div>
              {task.fromStationId && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-slate-500">调出站点：</span>
                  <span className="font-medium text-slate-800">{getStationName(task.fromStationId)}</span>
                </div>
              )}
              <div className="ml-5.5 pl-5.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                  需补 {vehicleCount} 辆
                </span>
              </div>
            </div>
          )}
          {task.type === 'overflow' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{getStationName(task.fromStationId)}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{getStationName(task.toStationId)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                  转运 {vehicleCount} 辆
                </span>
              </div>
            </div>
          )}
          {task.type === 'low_battery' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-slate-500">车辆编号：</span>
                <span className="font-medium text-slate-800">{getVehicleCode(task.vehicleId)}</span>
              </div>
              {task.vehicleId && getVehicle(task.vehicleId) && (
                <div className="flex items-center gap-2">
                  <Battery className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-slate-500">当前电量：</span>
                  <span className="font-medium text-orange-600">{getVehicle(task.vehicleId)?.battery}%</span>
                </div>
              )}
            </div>
          )}
          {task.note && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">备注：{task.note}</p>
          )}
        </div>

        {(task.type === 'overflow' || task.type === 'shortage') && (
          <div className="mb-3 relative">
            <button
              onClick={() => setPathPopupTaskId(showPathPopup ? null : task.id)}
              className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                showPathPopup
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              )}
            >
              <Route className="w-3 h-3" /> 查看路径
            </button>
            {showPathPopup && renderPathPopup(task)}
          </div>
        )}

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
              onClick={() => handleExecute(task.id)}
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

  const renderVehicleCheckboxList = (vehicleList: Vehicle[]) => {
    if (vehicleList.length === 0) {
      return (
        <div className="text-center py-4 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
          暂无可选车辆
        </div>
      );
    }

    const allSelected = vehicleList.every(v => form.vehicleIds.includes(v.id));
    const someSelected = vehicleList.some(v => form.vehicleIds.includes(v.id)) && !allSelected;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => toggleSelectAllVehicles(vehicleList)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : someSelected ? (
              <div className="w-4 h-4 border-2 border-blue-600 rounded flex items-center justify-center">
                <div className="w-2 h-0.5 bg-blue-600" />
              </div>
            ) : (
              <Square className="w-4 h-4 text-slate-300" />
            )}
            <span className="font-medium">全选</span>
          </button>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            已选 {form.vehicleIds.length} 辆
          </span>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
          {vehicleList.map((v) => {
            const isSelected = form.vehicleIds.includes(v.id);
            return (
              <label
                key={v.id}
                className={clsx(
                  'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                  isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleVehicleId(v.id)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{v.code}</span>
                    <span className="text-xs text-slate-400">电量 {v.battery}%</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    状态：{v.status === 'online' ? '在线' : v.status}
                    {v.stationId && ` · ${getStationName(v.stationId)}`}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSelectedVehicleDetails = () => {
    const vehicle = getVehicle(form.vehicleId);
    if (!vehicle) return null;

    return (
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-800">车辆详情</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">车辆编号：</span>
            <span className="font-medium text-slate-800">{vehicle.code}</span>
          </div>
          <div>
            <span className="text-slate-500">当前电量：</span>
            <span className="font-medium text-orange-600">{vehicle.battery}%</span>
          </div>
          <div>
            <span className="text-slate-500">当前状态：</span>
            <span className="font-medium text-slate-800">{vehicle.status === 'online' ? '在线' : vehicle.status}</span>
          </div>
          <div>
            <span className="text-slate-500">总里程：</span>
            <span className="font-medium text-slate-800">{vehicle.mileage} km</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">当前位置：</span>
            <span className="font-medium text-slate-800">
              {vehicle.stationId ? getStationName(vehicle.stationId) : '户外'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const columnConfig = [
    { key: 'pending', label: '待处理', icon: Clock, count: groupedTasks.pending.length, color: 'text-amber-600', bg: 'bg-amber-100' },
    { key: 'in_progress', label: '进行中', icon: PlayCircle, count: groupedTasks.in_progress.length, color: 'text-blue-600', bg: 'bg-blue-100' },
    { key: 'completed', label: '已完成', icon: CheckCircle, count: groupedTasks.completed.length, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ] as const;

  const renderPlannerModal = () => (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={closePlanner} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">配置调度方案</h3>
          </div>
          <button
            onClick={closePlanner}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {(['shortage', 'overflow', 'low_battery'] as const).map((type) => {
              const cfg = typeConfig[type];
              const TypeIcon = cfg.icon;
              return (
                <button
                  key={type}
                  onClick={() => updateForm('type', type)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                    form.type === type
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <TypeIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {form.type === 'shortage' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  调出来源 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateForm('source', 'station')}
                    className={clsx(
                      'py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all text-left',
                      form.source === 'station'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      从满车站调出
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm('source', 'specific')}
                    className={clsx(
                      'py-2.5 px-3 rounded-lg text-sm font-medium border-2 transition-all text-left',
                      form.source === 'specific'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      指定车辆调配
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">目标站点 <span className="text-red-500">*</span></label>
                <select
                  value={form.toStationId}
                  onChange={(e) => updateForm('toStationId', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">请选择站点</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}（当前 {s.currentCount}/{s.capacity}）
                    </option>
                  ))}
                </select>
              </div>

              {form.source === 'station' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">调出站点 <span className="text-red-500">*</span></label>
                  <select
                    value={form.fromStationId}
                    onChange={(e) => updateForm('fromStationId', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">请选择满车站点（占用率大于 70%）</option>
                    {fullStations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}（当前 {s.currentCount}/{s.capacity}，{Math.round((s.currentCount / s.capacity) * 100)}%）
                      </option>
                    ))}
                  </select>
                  {form.fromStationId && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">选择车辆 <span className="text-red-500">*</span></label>
                      {renderVehicleCheckboxList(getAvailableVehiclesAtStation(form.fromStationId))}
                    </div>
                  )}
                </div>
              )}

              {form.source === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">选择车辆 <span className="text-red-500">*</span></label>
                  {renderVehicleCheckboxList(getOnlineVehicles())}
                </div>
              )}

              {form.vehicleIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">已选车辆数</span>
                    <span className="text-lg font-bold text-blue-600">{form.vehicleIds.length} 辆</span>
                  </div>
                </div>
              )}
            </>
          )}

          {form.type === 'overflow' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">调出站点 <span className="text-red-500">*</span></label>
                <select
                  value={form.fromStationId}
                  onChange={(e) => updateForm('fromStationId', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">请选择调出站点</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}（当前 {s.currentCount}/{s.capacity}）
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">调入站点 <span className="text-red-500">*</span></label>
                <select
                  value={form.toStationId}
                  onChange={(e) => updateForm('toStationId', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">请选择调入站点</option>
                  {stations.filter(s => s.id !== form.fromStationId).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}（当前 {s.currentCount}/{s.capacity}）
                    </option>
                  ))}
                </select>
              </div>
              {form.fromStationId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">选择车辆 <span className="text-red-500">*</span></label>
                  {renderVehicleCheckboxList(getAvailableVehiclesAtStation(form.fromStationId))}
                </div>
              )}
              {form.vehicleIds.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-800">转运车辆数（自动计算）</span>
                    <span className="text-lg font-bold text-amber-600">{form.vehicleIds.length} 辆</span>
                  </div>
                </div>
              )}
            </>
          )}

          {form.type === 'low_battery' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选择车辆 <span className="text-red-500">*</span></label>
                <select
                  value={form.vehicleId}
                  onChange={(e) => updateForm('vehicleId', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">请选择需要换电的车辆</option>
                  {vehicles.filter(v => v.battery <= 30).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} — 电量 {v.battery}% {v.stationId ? `（${getStationName(v.stationId)}）` : '（户外）'}
                    </option>
                  ))}
                </select>
              </div>
              {form.vehicleId && renderSelectedVehicleDetails()}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
                <textarea
                  value={form.note}
                  onChange={(e) => updateForm('note', e.target.value)}
                  placeholder="可选：填写换电相关备注信息"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">优先级</label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => {
                const pCfg = priorityMap[p];
                const isActive = form.priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => updateForm('priority', p)}
                    className={clsx(
                      'py-2 rounded-lg text-sm font-medium border-2 transition-all',
                      isActive
                        ? `${pCfg.class} border-transparent`
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {pCfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button
            onClick={closePlanner}
            className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleGenerateTask}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-600/30"
          >
            生成任务
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={clsx(
            'fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium',
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {showPlanner && renderPlannerModal()}

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
        <button
          onClick={openPlanner}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30"
        >
          <Settings className="w-4 h-4" /> 配置调度方案
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
