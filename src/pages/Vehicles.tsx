import { useState } from 'react';
import { Search, MapPin, Lock, Unlock, Battery, X, History, Zap, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import BatteryIndicator from '@/components/BatteryIndicator';
import { clsx } from 'clsx';

export default function Vehicles() {
  const vehicles = useAppStore((s) => s.vehicles);
  const stations = useAppStore((s) => s.stations);
  const selectedVehicle = useAppStore((s) => s.selectedVehicle);
  const setSelectedVehicle = useAppStore((s) => s.setSelectedVehicle);
  const lockVehicle = useAppStore((s) => s.lockVehicle);
  const unlockVehicle = useAppStore((s) => s.unlockVehicle);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batteryFilter, setBatteryFilter] = useState<string>('all');

  const getStationName = (id?: string) => stations.find(s => s.id === id)?.name || '骑行中/未入站';

  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = v.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchBattery = batteryFilter === 'all'
      || (batteryFilter === 'low' && v.battery < 20)
      || (batteryFilter === 'mid' && v.battery >= 20 && v.battery < 60)
      || (batteryFilter === 'high' && v.battery >= 60);
    return matchSearch && matchStatus && matchBattery;
  });

  const batteryRecords = [
    { date: '2026-06-12 08:00', from: 15, to: 95, station: '人民广场站' },
    { date: '2026-06-10 14:30', from: 22, to: 100, station: '陆家嘴站' },
    { date: '2026-06-08 09:15', from: 8, to: 92, station: '南京东路站' },
  ];

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索车辆编号..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">全部状态</option>
                <option value="online">在线</option>
                <option value="offline">离线</option>
                <option value="riding">骑行中</option>
                <option value="charging">充电中</option>
                <option value="maintenance">维修中</option>
                <option value="locked">已锁定</option>
              </select>
              <select
                value={batteryFilter}
                onChange={(e) => setBatteryFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">全部电量</option>
                <option value="low">低电量 {'<'}20%</option>
                <option value="mid">中电量 20-60%</option>
                <option value="high">高电量 {'>'}60%</option>
              </select>
            </div>

            <span className="text-sm text-slate-500">共 {filteredVehicles.length} 辆车</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">车辆编号</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">电量</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">位置</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">里程</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">最后活跃</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVehicle(v)}
                    className={clsx(
                      'hover:bg-blue-50/50 cursor-pointer transition-colors',
                      selectedVehicle?.id === v.id && 'bg-blue-50'
                    )}
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{v.code}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-5 py-4">
                      <BatteryIndicator level={v.battery} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {getStationName(v.stationId)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{v.mileage.toFixed(1)} km</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{v.lastActive}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="地图定位"
                        >
                          <MapPin className="w-4 h-4" />
                        </button>
                        {v.status === 'locked' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); unlockVehicle(v.id); }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="解锁"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); lockVehicle(v.id); }}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="远程锁车"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div className="w-96 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">车辆详情</h3>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mt-3">{selectedVehicle.code}</h4>
              <StatusBadge status={selectedVehicle.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">当前电量</p>
                <div className="mt-2">
                  <BatteryIndicator level={selectedVehicle.battery} />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">累计里程</p>
                <p className="text-lg font-bold text-slate-800 mt-2">{selectedVehicle.mileage.toFixed(1)} km</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">当前位置</span>
                <span className="text-sm font-medium text-slate-700">{getStationName(selectedVehicle.stationId)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">坐标</span>
                <span className="text-sm font-medium text-slate-700">{selectedVehicle.lat.toFixed(4)}, {selectedVehicle.lng.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">最后活跃</span>
                <span className="text-sm font-medium text-slate-700">{selectedVehicle.lastActive}</span>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedVehicle.status === 'locked' ? (
                <button
                  onClick={() => unlockVehicle(selectedVehicle.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
                >
                  <Unlock className="w-4 h-4" /> 远程解锁
                </button>
              ) : (
                <button
                  onClick={() => lockVehicle(selectedVehicle.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium text-sm"
                >
                  <Lock className="w-4 h-4" /> 远程锁车
                </button>
              )}
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm">
                <MapPin className="w-4 h-4" /> 定位
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-slate-500" />
                <h4 className="font-semibold text-slate-800">换电记录</h4>
              </div>
              <div className="space-y-2">
                {batteryRecords.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{r.date}</span>
                      <span className="text-xs text-slate-500">{r.station}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <BatteryIndicator level={r.from} size="sm" />
                      <span className="text-slate-400">→</span>
                      <BatteryIndicator level={r.to} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
