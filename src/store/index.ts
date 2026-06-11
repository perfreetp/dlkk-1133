import { create } from 'zustand';
import type {
  Vehicle, Station, DispatchTask, InspectionOrder,
  Complaint, PricingRule
} from '@/types';
import {
  mockVehicles, mockStations, mockDispatchTasks, mockInspectionOrders,
  mockComplaints, mockPricingRules
} from '@/data/mockData';

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
  updateDispatchTask: (id: string, updates: Partial<DispatchTask>) => void;
  updateInspectionOrder: (id: string, updates: Partial<InspectionOrder>) => void;
  addInspectionOrder: (order: Omit<InspectionOrder, 'id'>) => void;
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
    vehicles: state.vehicles.map((v) => v.id === id ? { ...v, status } : v),
  })),

  lockVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.map((v) => v.id === id ? { ...v, status: 'locked' } : v),
  })),

  unlockVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.map((v) => v.id === id ? { ...v, status: 'online' } : v),
  })),

  addStation: (station) => set((state) => ({
    stations: [...state.stations, { ...station, id: `s${Date.now()}` }],
  })),

  updateStation: (id, updates) => set((state) => ({
    stations: state.stations.map((s) => s.id === id ? { ...s, ...updates } : s),
  })),

  deleteStation: (id) => set((state) => ({
    stations: state.stations.filter((s) => s.id !== id),
  })),

  updateDispatchTask: (id, updates) => set((state) => ({
    dispatchTasks: state.dispatchTasks.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),

  updateInspectionOrder: (id, updates) => set((state) => ({
    inspectionOrders: state.inspectionOrders.map((o) => o.id === id ? { ...o, ...updates } : o),
  })),

  addInspectionOrder: (order) => set((state) => ({
    inspectionOrders: [{ ...order, id: `i${Date.now()}` }, ...state.inspectionOrders],
  })),

  updateComplaint: (id, updates) => set((state) => ({
    complaints: state.complaints.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),

  addPricingRule: (rule) => set((state) => ({
    pricingRules: [...state.pricingRules, { ...rule, id: `p${Date.now()}` }],
  })),

  updatePricingRule: (id, updates) => set((state) => ({
    pricingRules: state.pricingRules.map((r) => r.id === id ? { ...r, ...updates } : r),
  })),

  deletePricingRule: (id) => set((state) => ({
    pricingRules: state.pricingRules.filter((r) => r.id !== id),
  })),
}));
