import { useState, useRef } from 'react';
import { MapPin, Plus, Settings, AlertCircle, Users, Bike, Pencil, Trash2, X, Save, CheckCircle, ShieldAlert, Star } from 'lucide-react';
import { useAppStore } from '@/store';
import { clsx } from 'clsx';
import type { Station } from '@/types';

type ModalMode = 'add' | 'fence' | 'noParking' | null;

export default function Stations() {
  const stations = useAppStore((s) => s.stations);
  const addStation = useAppStore((s) => s.addStation);
  const updateStation = useAppStore((s) => s.updateStation);
  const deleteStation = useAppStore((s) => s.deleteStation);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editStationId, setEditStationId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', capacity: 30, lat: 31.23, lng: 121.47, type: 'normal' as Station['type'],
    address: '', fenceRadius: 150, noParkingZones: [] as string[], recommendedReturn: true,
  });
  const [noParkingInput, setNoParkingInput] = useState('');

  const typeMap: Record<string, { label: string; class: string }> = {
    normal: { label: '普通站点', class: 'bg-blue-100 text-blue-700' },
    premium: { label: '核心站点', class: 'bg-purple-100 text-purple-700' },
    restricted: { label: '限制站点', class: 'bg-amber-100 text-amber-700' },
  };

  const filteredStations = selectedType === 'all' ? stations : stations.filter(s => s.type === selectedType);
  const getOccupancyRate = (current: number, capacity: number) => capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  const getOccupancyColor = (rate: number) => {
    if (rate > 90) return 'from-red-400 to-red-500';
    if (rate > 70) return 'from-amber-400 to-orange-500';
    if (rate < 20) return 'from-blue-400 to-blue-500';
    return 'from-emerald-400 to-emerald-500';
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const openAddModal = () => {
    setForm({ name: '', capacity: 30, lat: 31.23, lng: 121.47, type: 'normal', address: '', fenceRadius: 150, noParkingZones: [], recommendedReturn: true });
    setEditStationId(null);
    setModalMode('add');
  };

  const openFenceModal = (s: Station) => {
    setForm({ name: s.name, capacity: s.capacity, lat: s.lat, lng: s.lng, type: s.type, address: s.address, fenceRadius: s.fenceRadius, noParkingZones: s.noParkingZones, recommendedReturn: s.recommendedReturn });
    setEditStationId(s.id);
    setModalMode('fence');
  };

  const openNoParkingModal = (s: Station) => {
    setForm({ name: s.name, capacity: s.capacity, lat: s.lat, lng: s.lng, type: s.type, address: s.address, fenceRadius: s.fenceRadius, noParkingZones: [...s.noParkingZones], recommendedReturn: s.recommendedReturn });
    setEditStationId(s.id);
    setNoParkingInput('');
    setModalMode('noParking');
  };

  const openEditModal = (s: Station) => {
    setForm({ name: s.name, capacity: s.capacity, lat: s.lat, lng: s.lng, type: s.type, address: s.address, fenceRadius: s.fenceRadius, noParkingZones: s.noParkingZones, recommendedReturn: s.recommendedReturn });
    setEditStationId(s.id);
    setModalMode('add');
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editStationId) {
      updateStation(editStationId, form);
      showToast('站点信息已更新');
    } else {
      addStation({ ...form, currentCount: 0 });
      showToast('新站点已添加');
    }
    setModalMode(null);
  };

  const handleSaveFence = () => {
    if (!editStationId) return;
    updateStation(editStationId, { fenceRadius: form.fenceRadius, lat: form.lat, lng: form.lng });
    showToast('围栏范围已更新');
    setModalMode(null);
  };

  const handleAddNoParkingZone = () => {
    if (!noParkingInput.trim()) return;
    setForm(prev => ({ ...prev, noParkingZones: [...prev.noParkingZones, noParkingInput.trim()] }));
    setNoParkingInput('');
  };

  const handleRemoveNoParkingZone = (idx: number) => {
    setForm(prev => ({ ...prev, noParkingZones: prev.noParkingZones.filter((_, i) => i !== idx) }));
  };

  const handleSaveNoParking = () => {
    if (!editStationId) return;
    updateStation(editStationId, { noParkingZones: form.noParkingZones, recommendedReturn: form.recommendedReturn });
    showToast('禁停区配置已更新');
    setModalMode(null);
  };

  const handleDelete = (id: string) => {
    deleteStation(id);
    showToast('站点已删除');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-lg animate-pulse">
          <CheckCircle className="w-5 h-5" /> {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'premium', 'normal', 'restricted'].map((type) => (
            <button key={type} onClick={() => setSelectedType(type)}
              className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-colors', selectedType === type ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200')}>
              {type === 'all' ? '全部站点' : typeMap[type].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { const first = stations[0]; if (first) openNoParkingModal(first); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Settings className="w-4 h-4" /> 配置禁停区
          </button>
          <button onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md shadow-blue-600/30">
            <Plus className="w-4 h-4" /> 新增站点
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-slate-800">{stations.length}</p><p className="text-xs text-slate-500">站点总数</p></div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><Bike className="w-5 h-5 text-emerald-600" /></div><div><p className="text-2xl font-bold text-slate-800">{stations.reduce((s, x) => s + x.currentCount, 0)}</p><p className="text-xs text-slate-500">站点车辆</p></div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold text-slate-800">{stations.filter(s => getOccupancyRate(s.currentCount, s.capacity) > 90).length}</p><p className="text-xs text-slate-500">饱和站点</p></div></div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-red-600" /></div><div><p className="text-2xl font-bold text-slate-800">{stations.filter(s => getOccupancyRate(s.currentCount, s.capacity) < 20).length}</p><p className="text-xs text-slate-500">缺车站点</p></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredStations.map((station) => {
          const rate = getOccupancyRate(station.currentCount, station.capacity);
          const typeCfg = typeMap[station.type];
          return (
            <div key={station.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 mt-1">{station.lat.toFixed(4)}, {station.lng.toFixed(4)}</p>
                    <p className="text-xs text-blue-500 mt-0.5">围栏半径 {station.fenceRadius}m</p>
                  </div>
                </div>
                <div className="absolute top-3 left-3"><span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium', typeCfg.class)}>{typeCfg.label}</span></div>
                <div className="absolute top-3 right-3 flex gap-1">
                  <button onClick={() => openEditModal(station)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors"><Pencil className="w-4 h-4 text-slate-600" /></button>
                  <button onClick={() => handleDelete(station.id)} className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{station.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{station.address}</p>
                  </div>
                  {station.recommendedReturn && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">车辆占用</span>
                    <span className="font-semibold text-slate-700">{station.currentCount} / {station.capacity}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-500', getOccupancyColor(rate))} style={{ width: `${rate}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">占用率 {rate}%</span>
                    <span className={clsx('text-xs font-medium', rate > 90 ? 'text-red-600' : rate < 20 ? 'text-blue-600' : 'text-emerald-600')}>
                      {rate > 90 ? '接近饱和' : rate < 20 ? '车辆不足' : '状态正常'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>禁停区：{station.noParkingZones.length > 0 ? station.noParkingZones.join('、') : '无'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>围栏：{station.fenceRadius}m | 推荐还车：{station.recommendedReturn ? '是' : '否'}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openFenceModal(station)} className="flex-1 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200">编辑围栏</button>
                  <button onClick={() => openNoParkingModal(station)} className="flex-1 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">禁停区配置</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === 'add' && (editStationId ? '编辑站点' : '新增站点')}
                {modalMode === 'fence' && '编辑电子围栏'}
                {modalMode === 'noParking' && '配置禁停区'}
              </h3>
              <button onClick={() => setModalMode(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {modalMode === 'add' && (
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">站点名称</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="输入站点名称" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">地址</label>
                  <input type="text" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="输入地址" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">容量</label>
                    <input type="number" value={form.capacity} onChange={(e) => setForm(p => ({ ...p, capacity: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">类型</label>
                    <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value as Station['type'] }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                      <option value="normal">普通站点</option><option value="premium">核心站点</option><option value="restricted">限制站点</option>
                    </select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">纬度</label>
                    <input type="number" step="0.0001" value={form.lat} onChange={(e) => setForm(p => ({ ...p, lat: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">经度</label>
                    <input type="number" step="0.0001" value={form.lng} onChange={(e) => setForm(p => ({ ...p, lng: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.recommendedReturn} onChange={(e) => setForm(p => ({ ...p, recommendedReturn: e.target.checked }))} className="w-4 h-4 accent-blue-600 rounded" />
                    <span className="text-sm text-slate-700">设为推荐还车点</span>
                  </label>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setModalMode(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">取消</button>
                  <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-1.5"><Save className="w-4 h-4" /> 保存</button>
                </div>
              </div>
            )}

            {modalMode === 'fence' && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-dashed border-blue-300 relative">
                    <div className="absolute w-4 h-4 bg-blue-600 rounded-full" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                    <div className="absolute rounded-full border-2 border-blue-400 border-dashed bg-blue-100/20" style={{ width: `${Math.min(form.fenceRadius / 2, 180)}px`, height: `${Math.min(form.fenceRadius / 2, 180)}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                    <p className="absolute bottom-2 text-xs text-blue-600 font-medium">围栏半径 {form.fenceRadius}m</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <label className="font-medium text-slate-700">围栏半径</label>
                    <span className="text-blue-600 font-semibold">{form.fenceRadius} 米</span>
                  </div>
                  <input type="range" min="50" max="500" step="10" value={form.fenceRadius} onChange={(e) => setForm(p => ({ ...p, fenceRadius: Number(e.target.value) }))} className="w-full accent-blue-600" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>50m</span><span>500m</span></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">中心纬度</label>
                    <input type="number" step="0.0001" value={form.lat} onChange={(e) => setForm(p => ({ ...p, lat: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">中心经度</label>
                    <input type="number" step="0.0001" value={form.lng} onChange={(e) => setForm(p => ({ ...p, lng: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModalMode(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">取消</button>
                  <button onClick={handleSaveFence} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-1.5"><Save className="w-4 h-4" /> 保存围栏</button>
                </div>
              </div>
            )}

            {modalMode === 'noParking' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">添加禁停区域</label>
                  <div className="flex gap-2">
                    <input type="text" value={noParkingInput} onChange={(e) => setNoParkingInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNoParkingZone()} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="输入禁停区域名称后回车" />
                    <button onClick={handleAddNoParkingZone} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">添加</button>
                  </div>
                </div>
                {form.noParkingZones.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">当前禁停区 ({form.noParkingZones.length})</p>
                    {form.noParkingZones.map((zone, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /><span className="text-sm text-red-700">{zone}</span></div>
                        <button onClick={() => handleRemoveNoParkingZone(idx)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">暂无禁停区域</p>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.recommendedReturn} onChange={(e) => setForm(p => ({ ...p, recommendedReturn: e.target.checked }))} className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-sm text-slate-700">设为推荐还车点</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setModalMode(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">取消</button>
                  <button onClick={handleSaveNoParking} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-1.5"><Save className="w-4 h-4" /> 保存配置</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
