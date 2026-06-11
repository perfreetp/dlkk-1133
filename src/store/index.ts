import { create } from 'zustand';
import type { Vehicle, Station, DispatchTask, InspectionOrder, Complaint, PricingRule } from '@/types';
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
  executeDispatchTask: (id: string) => void;
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

  executeDispatchTask: (id) => set((state) => {
    const task = state.dispatchTasks.find((t) => t.id === id);
    if (!task) return state;
    const taskWithVehicleIds = task as DispatchTask & { vehicleIds?: string[] };
    let newStations = state.stations;
    let newVehicles = state.vehicles;
    const selectedCount = taskWithVehicleIds.vehicleIds?.length || task.vehicleCount || 0;
    
    if (task.type === 'overflow' && task.fromStationId && task.toStationId) {
      const fromStation = state.stations.find(s => s.id === task.fromStationId);
      const actualCount = Math.min(selectedCount, fromStation?.currentCount || 0);
      if (actualCount <= 0) return state;
      
      newStations = state.stations.map((s) => {
        if (s.id === task.fromStationId) return { ...s, currentCount: s.currentCount - actualCount };
        if (s.id === task.toStationId) return { ...s, currentCount: Math.min(s.capacity, s.currentCount + actualCount) };
        return s;
      });
      
      if (taskWithVehicleIds.vehicleIds && taskWithVehicleIds.vehicleIds.length > 0) {
        newVehicles = state.vehicles.map(v => 
          taskWithVehicleIds.vehicleIds!.includes(v.id) ? { ...v, stationId: task.toStationId } : v
        );
      }
    } else if (task.type === 'shortage' && task.toStationId) {
      if (!task.fromStationId) {
        return state;
      }
      const fromStation = state.stations.find(s => s.id === task.fromStationId);
      const actualCount = Math.min(selectedCount, fromStation?.currentCount || 0);
      if (actualCount <= 0) return state;
      
      newStations = state.stations.map((s) => {
        if (s.id === task.fromStationId) return { ...s, currentCount: s.currentCount - actualCount };
        if (s.id === task.toStationId) return { ...s, currentCount: Math.min(s.capacity, s.currentCount + actualCount) };
        return s;
      });
      
      if (taskWithVehicleIds.vehicleIds && taskWithVehicleIds.vehicleIds.length > 0) {
        newVehicles = state.vehicles.map(v => 
          taskWithVehicleIds.vehicleIds!.includes(v.id) ? { ...v, stationId: task.toStationId } : v
        );
      }
    }
    
    return {
      stations: newStations,
      vehicles: newVehicles,
      dispatchTasks: state.dispatchTasks.map((t) =>
        t.id === id ? { ...t, status: 'completed' as const } : t
      ),
    };
  }),

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
