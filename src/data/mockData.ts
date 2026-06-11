import type {
  Vehicle, Station, DispatchTask, InspectionOrder,
  Complaint, PricingRule, OrderData, Alert, StaffPerformance
} from '@/types';

export const mockVehicles: Vehicle[] = [
  { id: 'v1', code: 'EB-00101', status: 'online', battery: 85, stationId: 's1', lat: 31.2304, lng: 121.4737, lastActive: '2026-06-12 08:45:00', mileage: 1256.8 },
  { id: 'v2', code: 'EB-00102', status: 'riding', battery: 62, lat: 31.2354, lng: 121.4787, lastActive: '2026-06-12 09:12:00', mileage: 892.3 },
  { id: 'v3', code: 'EB-00103', status: 'online', battery: 28, stationId: 's2', lat: 31.2254, lng: 121.4687, lastActive: '2026-06-12 07:30:00', mileage: 2103.5 },
  { id: 'v4', code: 'EB-00104', status: 'charging', battery: 45, stationId: 's1', lat: 31.2304, lng: 121.4737, lastActive: '2026-06-12 06:00:00', mileage: 567.2 },
  { id: 'v5', code: 'EB-00105', status: 'maintenance', battery: 15, stationId: 's3', lat: 31.2404, lng: 121.4837, lastActive: '2026-06-11 18:20:00', mileage: 3421.0 },
  { id: 'v6', code: 'EB-00106', status: 'online', battery: 92, stationId: 's2', lat: 31.2254, lng: 121.4687, lastActive: '2026-06-12 09:00:00', mileage: 182.4 },
  { id: 'v7', code: 'EB-00107', status: 'offline', battery: 5, lat: 31.2204, lng: 121.4637, lastActive: '2026-06-11 22:10:00', mileage: 1567.9 },
  { id: 'v8', code: 'EB-00108', status: 'locked', battery: 73, stationId: 's4', lat: 31.2384, lng: 121.4707, lastActive: '2026-06-12 08:00:00', mileage: 723.1 },
  { id: 'v9', code: 'EB-00109', status: 'online', battery: 55, stationId: 's1', lat: 31.2304, lng: 121.4737, lastActive: '2026-06-12 08:30:00', mileage: 934.6 },
  { id: 'v10', code: 'EB-00110', status: 'riding', battery: 48, lat: 31.2334, lng: 121.4757, lastActive: '2026-06-12 09:05:00', mileage: 1120.7 },
  { id: 'v11', code: 'EB-00111', status: 'online', battery: 18, stationId: 's3', lat: 31.2404, lng: 121.4837, lastActive: '2026-06-12 07:15:00', mileage: 2789.3 },
  { id: 'v12', code: 'EB-00112', status: 'online', battery: 78, stationId: 's4', lat: 31.2384, lng: 121.4707, lastActive: '2026-06-12 08:50:00', mileage: 445.8 },
];

export const mockStations: Station[] = [
  { id: 's1', name: '人民广场站', capacity: 50, currentCount: 32, lat: 31.2304, lng: 121.4737, type: 'premium', address: '黄浦区人民大道' },
  { id: 's2', name: '南京东路站', capacity: 40, currentCount: 38, lat: 31.2254, lng: 121.4687, type: 'premium', address: '黄浦区南京东路' },
  { id: 's3', name: '陆家嘴站', capacity: 60, currentCount: 8, lat: 31.2404, lng: 121.4837, type: 'premium', address: '浦东新区陆家嘴环路' },
  { id: 's4', name: '静安寺站', capacity: 45, currentCount: 22, lat: 31.2384, lng: 121.4707, type: 'normal', address: '静安区南京西路' },
  { id: 's5', name: '徐家汇站', capacity: 55, currentCount: 48, lat: 31.1954, lng: 121.4367, type: 'normal', address: '徐汇区虹桥路' },
  { id: 's6', name: '中山公园站', capacity: 35, currentCount: 5, lat: 31.2204, lng: 121.4207, type: 'restricted', address: '长宁区长宁路' },
];

export const mockDispatchTasks: DispatchTask[] = [
  { id: 'd1', type: 'shortage', priority: 'high', status: 'pending', toStationId: 's3', createdAt: '2026-06-12 08:00:00', note: '早高峰缺车', vehicleCount: 15 },
  { id: 'd2', type: 'overflow', priority: 'medium', status: 'in_progress', fromStationId: 's2', toStationId: 's6', assignee: '张伟', createdAt: '2026-06-12 07:30:00', vehicleCount: 10 },
  { id: 'd3', type: 'low_battery', priority: 'high', status: 'pending', vehicleId: 'v3', createdAt: '2026-06-12 08:45:00', note: '电量低于30%需换电' },
  { id: 'd4', type: 'low_battery', priority: 'medium', status: 'in_progress', vehicleId: 'v11', assignee: '李强', createdAt: '2026-06-12 07:15:00' },
  { id: 'd5', type: 'shortage', priority: 'low', status: 'completed', toStationId: 's6', assignee: '王芳', createdAt: '2026-06-12 06:00:00', vehicleCount: 8 },
  { id: 'd6', type: 'overflow', priority: 'high', status: 'pending', fromStationId: 's5', createdAt: '2026-06-12 09:00:00', note: '接近饱和', vehicleCount: 12 },
];

export const mockInspectionOrders: InspectionOrder[] = [
  { id: 'i1', vehicleId: 'v5', category: 'battery', status: 'in_progress', photos: [], description: '电池续航异常，需检测', assignee: '赵磊', createdAt: '2026-06-12 08:00:00' },
  { id: 'i2', vehicleId: 'v7', category: 'lock', status: 'pending', photos: [], description: '车锁无法打开', createdAt: '2026-06-12 07:45:00' },
  { id: 'i3', vehicleId: 'v2', category: 'brake', status: 'completed', photos: [], description: '刹车异响', assignee: '孙明', createdAt: '2026-06-11 16:00:00', completedAt: '2026-06-11 18:30:00', repairNote: '已更换刹车片' },
  { id: 'i4', vehicleId: 'v9', category: 'tire', status: 'reviewed', photos: [], description: '后胎漏气', assignee: '周华', createdAt: '2026-06-11 10:00:00', completedAt: '2026-06-11 14:00:00', repairNote: '已补胎' },
  { id: 'i5', vehicleId: 'v1', category: 'appearance', status: 'pending', photos: [], description: '车身有划痕', createdAt: '2026-06-12 09:10:00' },
];

export const mockComplaints: Complaint[] = [
  { id: 'c1', type: 'parking', userId: 'u1001', vehicleId: 'v4', status: 'pending', description: '车辆停在禁停区域', createdAt: '2026-06-12 09:00:00' },
  { id: 'c2', type: 'charge', userId: 'u1002', orderId: 'o2001', status: 'processing', description: '扣费异常，多扣了5元', handler: '陈静', createdAt: '2026-06-12 08:30:00' },
  { id: 'c3', type: 'find_bike', userId: 'u1003', status: 'resolved', description: 'APP显示有车但现场找不到', handler: '陈静', createdAt: '2026-06-12 07:00:00', reply: '已核实，为GPS延迟导致，赠送骑行券一张' },
  { id: 'c4', type: 'charge', userId: 'u1004', orderId: 'o2002', status: 'closed', description: '未开锁却开始计费', handler: '吴敏', createdAt: '2026-06-11 20:00:00', reply: '已退款处理' },
  { id: 'c5', type: 'parking', userId: 'u1005', vehicleId: 'v8', status: 'pending', description: '还车点车位已满无法还车', createdAt: '2026-06-12 08:50:00' },
];

export const mockPricingRules: PricingRule[] = [
  { id: 'p1', name: '基础定价', type: 'base', basePrice: 2, perMinute: 0.1, perKm: 0.5, active: true },
  { id: 'p2', name: '早高峰加价', type: 'time', basePrice: 3, perMinute: 0.15, timeRange: '07:00-09:00', active: true },
  { id: 'p3', name: '晚高峰加价', type: 'time', basePrice: 3, perMinute: 0.15, timeRange: '17:00-19:00', active: true },
  { id: 'p4', name: '夜间加价', type: 'time', basePrice: 2.5, perMinute: 0.12, timeRange: '23:00-06:00', active: true },
  { id: 'p5', name: '核心区域定价', type: 'area', basePrice: 2.5, perKm: 0.6, area: '内环内', active: true },
  { id: 'p6', name: '新用户首单免费', type: 'promotion', discount: 100, active: true },
  { id: 'p7', name: '周末8折', type: 'promotion', discount: 20, active: false },
];

export const mockOrderTrend: OrderData[] = [
  { date: '06-06', orders: 12580, revenue: 32450 },
  { date: '06-07', orders: 14320, revenue: 38920 },
  { date: '06-08', orders: 16890, revenue: 45230 },
  { date: '06-09', orders: 15420, revenue: 41280 },
  { date: '06-10', orders: 18650, revenue: 50870 },
  { date: '06-11', orders: 17230, revenue: 47560 },
  { date: '06-12', orders: 8920, revenue: 24180 },
];

export const mockAlerts: Alert[] = [
  { id: 'a1', type: 'low_battery', vehicleCode: 'EB-00103', message: '电量剩余28%，需换电', time: '09:12' },
  { id: 'a2', type: 'abnormal_parking', vehicleCode: 'EB-00107', message: '疑似在禁停区域', time: '08:58' },
  { id: 'a3', type: 'offline', vehicleCode: 'EB-00107', message: '车辆离线超过10小时', time: '08:30' },
  { id: 'a4', type: 'fault', vehicleCode: 'EB-00105', message: '电池故障告警', time: '08:15' },
  { id: 'a5', type: 'low_battery', vehicleCode: 'EB-00111', message: '电量剩余18%，需换电', time: '07:50' },
];

export const mockStaffPerformance: StaffPerformance[] = [
  { id: 'st1', name: '张伟', role: 'dispatcher', tasksCompleted: 28, tasksTotal: 32, avgResponseTime: '12分钟' },
  { id: 'st2', name: '李强', role: 'dispatcher', tasksCompleted: 22, tasksTotal: 28, avgResponseTime: '15分钟' },
  { id: 'st3', name: '王芳', role: 'dispatcher', tasksCompleted: 31, tasksTotal: 33, avgResponseTime: '10分钟' },
  { id: 'st4', name: '赵磊', role: 'inspector', tasksCompleted: 18, tasksTotal: 22, avgResponseTime: '25分钟' },
  { id: 'st5', name: '孙明', role: 'inspector', tasksCompleted: 24, tasksTotal: 26, avgResponseTime: '20分钟' },
  { id: 'st6', name: '周华', role: 'inspector', tasksCompleted: 15, tasksTotal: 20, avgResponseTime: '30分钟' },
];

export const hotZones = [
  { name: '人民广场', rides: 2890 },
  { name: '南京东路', rides: 2540 },
  { name: '陆家嘴', rides: 2310 },
  { name: '静安寺', rides: 1980 },
  { name: '徐家汇', rides: 1750 },
  { name: '中山公园', rides: 1420 },
  { name: '虹桥', rides: 1280 },
  { name: '五角场', rides: 1050 },
];

export const faultTrend = [
  { date: '06-06', battery: 8, brake: 5, tire: 12, lock: 3 },
  { date: '06-07', battery: 10, brake: 6, tire: 14, lock: 4 },
  { date: '06-08', battery: 7, brake: 8, tire: 10, lock: 2 },
  { date: '06-09', battery: 12, brake: 5, tire: 15, lock: 5 },
  { date: '06-10', battery: 9, brake: 7, tire: 11, lock: 3 },
  { date: '06-11', battery: 11, brake: 9, tire: 13, lock: 6 },
  { date: '06-12', battery: 5, brake: 3, tire: 7, lock: 2 },
];
