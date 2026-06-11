import { useState } from 'react';
import {
  Bike, Signal, Zap, AlertTriangle, TrendingUp, AlertCircle,
  MapPin, Battery, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import StatCard from '@/components/StatCard';
import { useAppStore } from '@/store';
import { mockOrderTrend, mockAlerts, hotZones } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import { clsx } from 'clsx';
import type { Vehicle, Station } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const vehicles = useAppStore((s) => s.vehicles);
  const stations = useAppStore((s) => s.stations);
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);

  const [showOnline, setShowOnline] = useState(true);
  const [showLowBattery, setShowLowBattery] = useState(true);
  const [showAbnormal, setShowAbnormal] = useState(true);
  const [showStationSat, setShowStationSat] = useState(true);
  const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);

  const totalVehicles = vehicles.length;
  const onlineCount = vehicles.filter(v => v.status === 'online' || v.status === 'riding').length;
  const rideableCount = vehicles.filter(v => v.status === 'online' && v.battery > 20).length;
  const lowBatteryCount = vehicles.filter(v => v.battery < 20).length;
  const abnormalParking = vehicles.filter(v => !v.stationId && v.status !== 'riding').length;

  const alertIconMap: Record<string, typeof AlertCircle> = {
    low_battery: Battery,
    abnormal_parking: MapPin,
    offline: Signal,
    fault: AlertTriangle,
  };

  const normalizeLng = (lng: number) => ((lng - 121.42) / 0.08) * 100;
  const normalizeLat = (lat: number) => ((31.25 - lat) / 0.07) * 100;

  const isVehicleVisible = (v: Vehicle) => {
    const isLowBattery = v.battery < 20;
    const isAbnormal = !v.stationId && v.status !== 'riding';
    const isOnline = v.status === 'online' || v.status === 'riding';

    if (!showLowBattery && isLowBattery) return false;
    if (!showAbnormal && isAbnormal) return false;
    if (!showOnline && !isLowBattery && !isAbnormal) return false;
    return true;
  };

  const getVehicleColor = (v: Vehicle) => {
    if (v.battery < 20) return 'bg-orange-500';
    if (!v.stationId && v.status !== 'riding') return 'bg-red-500';
    if (v.status === 'online' || v.status === 'riding') return 'bg-green-500';
    return 'bg-slate-400';
  };

  const isAbnormalVehicle = (v: Vehicle) => v.battery < 20 || (!v.stationId && v.status !== 'riding');

  const getStationRingColor = (s: Station) => {
    const rate = s.currentCount / s.capacity;
    if (rate > 0.9) return 'ring-red-500';
    if (rate < 0.2) return 'ring-blue-500';
    return 'ring-green-500';
  };

  const getStationBgColor = (s: Station) => {
    const rate = s.currentCount / s.capacity;
    if (rate > 0.9) return 'bg-red-500';
    if (rate < 0.2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleVehicleClick = (v: Vehicle) => {
    setSelectedVehicleId(v.id);
    navigate('/vehicles');
  };

  const handleStationClick = () => {
    navigate('/stations');
  };

  const filters = [
    { key: 'showOnline', label: '全部车辆', active: showOnline, toggle: () => setShowOnline(!showOnline) },
    { key: 'showOnlineOnly', label: '在线', active: showOnline, toggle: () => setShowOnline(!showOnline) },
    { key: 'showLowBattery', label: '低电量', active: showLowBattery, toggle: () => setShowLowBattery(!showLowBattery) },
    { key: 'showAbnormal', label: '异常停放', active: showAbnormal, toggle: () => setShowAbnormal(!showAbnormal) },
    { key: 'showStationSat', label: '站点饱和', active: showStationSat, toggle: () => setShowStationSat(!showStationSat) },
  ];

  const filteredVehicles = vehicles.filter(isVehicleVisible);
  const filteredStations = showStationSat
    ? stations
    : stations.filter(s => s.currentCount / s.capacity <= 0.9);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="车辆总数" value={totalVehicles} icon={<Bike className="w-6 h-6" />} color="blue" trend="3.2%" trendUp />
        <StatCard title="在线车辆" value={onlineCount} icon={<Signal className="w-6 h-6" />} color="green" trend="5.1%" trendUp />
        <StatCard title="可骑车辆" value={rideableCount} icon={<Bike className="w-6 h-6" />} color="purple" trend="2.8%" trendUp />
        <StatCard title="低电量" value={lowBatteryCount} icon={<Zap className="w-6 h-6" />} color="orange" trend="8.3%" trendUp={false} />
        <StatCard title="异常停放" value={abnormalParking} icon={<AlertTriangle className="w-6 h-6" />} color="red" trend="15%" trendUp={false} />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">全局运营地图</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={f.toggle}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  f.active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="h-96 bg-gradient-to-br from-slate-100 to-blue-50 rounded-lg relative overflow-hidden"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(148, 163, 184, 0.15) 24px, rgba(148, 163, 184, 0.15) 25px),
              repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(148, 163, 184, 0.15) 24px, rgba(148, 163, 184, 0.15) 25px)
            `,
          }}
        >
          {filteredStations.map((station) => {
            const x = normalizeLng(station.lng);
            const y = normalizeLat(station.lat);
            return (
              <div
                key={station.id}
                className="absolute cursor-pointer group"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={handleStationClick}
                onMouseEnter={() => setHoveredStation(station)}
                onMouseLeave={() => setHoveredStation(null)}
              >
                <div
                  className={clsx(
                    'w-3.5 h-3.5 rounded-md flex items-center justify-center ring-2 ring-offset-1 ring-offset-transparent transition-transform group-hover:scale-125',
                    getStationBgColor(station),
                    getStationRingColor(station)
                  )}
                >
                  <Bike className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <div className="text-[10px] font-semibold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
                    {station.name}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {station.currentCount}/{station.capacity}
                  </div>
                </div>

                {hoveredStation?.id === station.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <div className="font-semibold mb-1">{station.name}</div>
                    <div className="text-slate-300">地址: {station.address}</div>
                    <div className="text-slate-300">车辆: {station.currentCount}/{station.capacity}</div>
                    <div className="text-slate-300">类型: {station.type}</div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredVehicles.map((vehicle) => {
            const x = normalizeLng(vehicle.lng);
            const y = normalizeLat(vehicle.lat);
            const abnormal = isAbnormalVehicle(vehicle);
            return (
              <div
                key={vehicle.id}
                className="absolute cursor-pointer group"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={() => handleVehicleClick(vehicle)}
                onMouseEnter={() => setHoveredVehicle(vehicle)}
                onMouseLeave={() => setHoveredVehicle(null)}
              >
                {abnormal && (
                  <div
                    className={clsx(
                      'absolute inset-0 rounded-full animate-ping opacity-40',
                      getVehicleColor(vehicle)
                    )}
                    style={{ width: '20px', height: '20px', left: '-5px', top: '-5px' }}
                  />
                )}
                <div
                  className={clsx(
                    'w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-150 ring-2 ring-white shadow-md',
                    getVehicleColor(vehicle)
                  )}
                />
                <div className="absolute top-full mt-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[9px] font-medium text-slate-600 bg-white/80 px-1 py-0.5 rounded">
                    {vehicle.code}
                  </span>
                </div>

                {hoveredVehicle?.id === vehicle.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <div className="font-semibold mb-1">{vehicle.code}</div>
                    <div className="text-slate-300">状态: {vehicle.status}</div>
                    <div className="text-slate-300">电量: {vehicle.battery}%</div>
                    <div className="text-slate-300">里程: {vehicle.mileage}km</div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="absolute bottom-3 left-3 bg-white/95 rounded-lg px-3 py-2 shadow-sm border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-700 mb-1.5">图例</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                <span className="text-[10px] text-slate-600">在线车辆</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-1 ring-white" />
                <span className="text-[10px] text-slate-600">低电量</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-white" />
                <span className="text-[10px] text-slate-600">异常停放</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500 ring-1 ring-white" />
                <span className="text-[10px] text-slate-600">站点正常</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500 ring-1 ring-white" />
                <span className="text-[10px] text-slate-600">站点饱和</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">订单走势</h3>
              <p className="text-sm text-slate-500">近7日订单量和营收</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium">近7日</span>
              <span className="text-xs px-3 py-1.5 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer">近30日</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockOrderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="orders" name="订单量" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="营收(元)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">实时告警</h3>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">{mockAlerts.length} 条</span>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {mockAlerts.map((alert) => {
              const Icon = alertIconMap[alert.type] || AlertCircle;
              return (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    alert.type === 'low_battery' && 'bg-orange-100 text-orange-600',
                    alert.type === 'abnormal_parking' && 'bg-amber-100 text-amber-600',
                    alert.type === 'offline' && 'bg-slate-200 text-slate-600',
                    alert.type === 'fault' && 'bg-red-100 text-red-600',
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{alert.vehicleCode}</span>
                      <StatusBadge status={alert.type === 'fault' ? 'maintenance' : 'online'} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">骑行热区 TOP 8</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {hotZones.map((zone, idx) => (
              <div key={zone.name} className="flex items-center gap-4">
                <span className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white',
                  idx < 3 ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-slate-200 text-slate-600'
                )}>
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-700 w-24">{zone.name}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${(zone.rides / hotZones[0].rides) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-700 w-16 text-right">{zone.rides} 次</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">站点车辆分布</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stations.map(s => ({ name: s.name, 当前: s.currentCount, 容量: s.capacity }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="容量" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="当前" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
