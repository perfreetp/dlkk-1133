export interface Vehicle {
  id: string;
  code: string;
  status: 'online' | 'offline' | 'riding' | 'charging' | 'maintenance' | 'locked';
  battery: number;
  stationId?: string;
  lat: number;
  lng: number;
  lastActive: string;
  mileage: number;
}

export interface Station {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  lat: number;
  lng: number;
  type: 'normal' | 'premium' | 'restricted';
  address: string;
  fenceRadius: number;
  noParkingZones: string[];
  recommendedReturn: boolean;
}

export interface DispatchTask {
  id: string;
  type: 'shortage' | 'overflow' | 'low_battery';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  vehicleId?: string;
  vehicleIds?: string[];
  fromStationId?: string;
  toStationId?: string;
  assignee?: string;
  createdAt: string;
  note?: string;
  vehicleCount?: number;
}

export interface DispatchExecutionResult {
  success: boolean;
  movedCount: number;
  skippedCount: number;
  reason?: string;
}



export interface InspectionOrder {
  id: string;
  vehicleId: string;
  category: 'battery' | 'brake' | 'tire' | 'lock' | 'appearance' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  photos: string[];
  description: string;
  assignee?: string;
  createdAt: string;
  completedAt?: string;
  repairNote?: string;
}

export interface Complaint {
  id: string;
  type: 'parking' | 'charge' | 'find_bike' | 'other';
  userId: string;
  orderId?: string;
  vehicleId?: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  description: string;
  createdAt: string;
  handler?: string;
  reply?: string;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'base' | 'time' | 'area' | 'promotion';
  basePrice?: number;
  perMinute?: number;
  perKm?: number;
  timeRange?: string;
  area?: string;
  discount?: number;
  active: boolean;
}

export interface OrderData {
  date: string;
  orders: number;
  revenue: number;
}

export interface Alert {
  id: string;
  type: 'low_battery' | 'abnormal_parking' | 'offline' | 'fault';
  vehicleCode: string;
  message: string;
  time: string;
}

export interface StaffPerformance {
  id: string;
  name: string;
  role: 'dispatcher' | 'inspector';
  tasksCompleted: number;
  tasksTotal: number;
  avgResponseTime: string;
}
