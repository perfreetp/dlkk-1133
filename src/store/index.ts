import { create } from 'zustand';
import type { Vehicle, Station, DispatchTask, InspectionOrder, Complaint, PricingRule, DispatchExecutionResult } from '@/types';
import { mockVehicles, mockStations, mockDispatchTasks, mockInspectionOrders, mockComplaints, mockPricingRules } from '@/data/mockData';

interface AppState {
  vehicles: Vehicle[];
  stations: Station[];
  dispatchTasks: DispatchTask[];
  inspectionOrders: InspectionOrder[];
  complaints: Complaint[];
  pricingRules: PricingRule[];
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => void;
  lockVehicle: (id: string) => void;
  unlockVehicle: (id: string) => void;
  addStation: (station: Omit<Station, 'id'>) => void;
  updateStation: (id: string, updates: Partial<Station>) => void;
  deleteStation: (id: string) => void;
  addDispatchTask: (task: Omit<DispatchTask, 'id'>) => string;
  updateDispatchTask: (id: string, updates: Partial<DispatchTask>) => void;
  executeDispatchTask: (id: string) => DispatchExecutionResult;
  addInspectionOrder: (order: Omit<InspectionOrder, 'id'>) => string;
  updateInspectionOrder: (id: string, updates: Partial<InspectionOrder>) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  addPricingRule: (rule: Omit<PricingRule, 'id'>) => void;
  updatePricingRule: (id: string, updates: Partial<PricingRule>) => void;
  deletePricingRule: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  vehicles: mockVehicles,
  stations: mockStations,
  dispatchTasks: mockDispatchTasks,
  inspectionOrders: mockInspectionOrders,
  complaints: mockComplaints,
  pricingRules: mockPricingRules,
  selectedVehicleId: null,

  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),

  updateVehicleStatus: (id, status) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, status } : v)),
  })),

  lockVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, status: 'locked' } : v)),
  })),

  unlockVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, status: 'online' } : v)),
  })),

  addStation: (station) => set((state) => ({
    stations: [...state.stations, { ...station, id: `s${Date.now()}` }],
  })),

  updateStation: (id, updates) => set((state) => ({
    stations: state.stations.map((s) => (s.id === id ? { ...s, ...updates } : s)),
  })),

  deleteStation: (id) => set((state) => ({
    stations: state.stations.filter((s) => s.id !== id),
  })),

  addDispatchTask: (task) => {
    const id = `d${Date.now()}`;
    set((state) => ({
      dispatchTasks: [{ ...task, id }, ...state.dispatchTasks],
    }));
    return id;
  },

  updateDispatchTask: (id, updates) => set((state) => ({
    dispatchTasks: state.dispatchTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),

  executeDispatchTask: (id) => {
    let result: DispatchExecutionResult = { success: false, movedCount: 0, skippedCount: 0 };
    set((state) => {
      const task = state.dispatchTasks.find((t) => t.id === id);
      if (!task) {
        result = { success: false, movedCount: 0, skippedCount: 0, reason: '任务不存在' };
        return state;
      }

      if (task.type === 'low_battery') {
        result = { success: true, movedCount: task.vehicleId ? 1 : 0, skippedCount: 0 };
        return {
          dispatchTasks: state.dispatchTasks.map((t) =>
            t.id === id ? { ...t, status: 'completed' as const } : t
          ),
        };
      }

      if (!task.toStationId) {
        result = { success: false, movedCount: 0, skippedCount: 0, reason: '缺少调入站点' };
        return state;
      }

      const vehicleIdsToMove = task.vehicleIds && task.vehicleIds.length > 0
        ? task.vehicleIds
        : (task.vehicleId ? [task.vehicleId] : []);

      if (vehicleIdsToMove.length === 0) {
        result = { success: false, movedCount: 0, skippedCount: 0, reason: '没有可调度的车辆' };
        return state;
      }

      const toStation = state.stations.find(s => s.id === task.toStationId);
      if (!toStation) {
        result = { success: false, movedCount: 0, skippedCount: 0, reason: '调入站点不存在' };
        return state;
      }
      const remainingSlots = toStation.capacity - toStation.currentCount;
      if (remainingSlots <= 0) {
        result = { success: false, movedCount: 0, skippedCount: vehicleIdsToMove.length, reason: '调入站点已饱和，无剩余车位' };
        return state;
      }

      const validVehicles = state.vehicles.filter(v =>
        vehicleIdsToMove.includes(v.id) && v.status !== 'maintenance' && v.stationId !== task.toStationId
      );
      const vehiclesToActuallyMove = validVehicles.slice(0, remainingSlots);
      const skipped = validVehicles.length - vehiclesToActuallyMove.length + (vehicleIdsToMove.length - validVehicles.length);

      if (vehiclesToActuallyMove.length === 0) {
        result = { success: false, movedCount: 0, skippedCount: skipped, reason: '没有可转移的有效车辆' };
        return state;
      }

      const sourceStationDeductions = new Map<string, number>();
      vehiclesToActuallyMove.forEach(v => {
        if (v.stationId) {
          sourceStationDeductions.set(v.stationId, (sourceStationDeductions.get(v.stationId) || 0) + 1);
        }
      });

      const movedIds = new Set(vehiclesToActuallyMove.map(v => v.id));
      const newVehicles = state.vehicles.map(v =>
        movedIds.has(v.id) ? { ...v, stationId: task.toStationId } : v
      );

      const newStations = state.stations.map(s => {
        if (s.id === task.toStationId) {
          return { ...s, currentCount: s.currentCount + vehiclesToActuallyMove.length };
        }
        const deduction = sourceStationDeductions.get(s.id);
        if (deduction) {
          return { ...s, currentCount: Math.max(0, s.currentCount - deduction) };
        }
        return s;
      });

      result = {
        success: true,
        movedCount: vehiclesToActuallyMove.length,
        skippedCount: skipped,
      };

      return {
        stations: newStations,
        vehicles: newVehicles,
        dispatchTasks: state.dispatchTasks.map((t) =>
          t.id === id ? { ...t, status: 'completed' as const, vehicleCount: vehiclesToActuallyMove.length } : t
        ),
      };
    });
    return result;
  },

  addInspectionOrder: (order) => {
    const id = `i${Date.now()}`;
    set((state) => ({
      inspectionOrders: [{ ...order, id }, ...state.inspectionOrders],
    }));
    return id;
  },

  updateInspectionOrder: (id, updates) => set((state) => ({
    inspectionOrders: state.inspectionOrders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
  })),

  updateComplaint: (id, updates) => set((state) => ({
    complaints: state.complaints.map((c) => (c.id === id ? { ...c, ...updates } : c)),
  })),

  addPricingRule: (rule) => set((state) => ({
    pricingRules: [...state.pricingRules, { ...rule, id: `p${Date.now()}` }],
  })),

  updatePricingRule: (id, updates) => set((state) => ({
    pricingRules: state.pricingRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  })),

  deletePricingRule: (id) => set((state) => ({
    pricingRules: state.pricingRules.filter((r) => r.id !== id),
  })),
}));
