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
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle | null) => void;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => void;
  lockVehicle: (id: string) => void;
  unlockVehicle: (id: string) => void;
  updateDispatchTask: (id: string, updates: Partial<DispatchTask>) => void;
  updateInspectionOrder: (id: string, updates: Partial<InspectionOrder>) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  updatePricingRule: (id: string, updates: Partial<PricingRule>) => void;
  addInspectionOrder: (order: Omit<InspectionOrder, 'id'>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  vehicles: mockVehicles,
  stations: mockStations,
  dispatchTasks: mockDispatchTasks,
  inspectionOrders: mockInspectionOrders,
  complaints: mockComplaints,
  pricingRules: mockPricingRules,
  selectedVehicle: null,

  setSelectedVehicle: (v) => set({ selectedVehicle: v }),

  updateVehicleStatus: (id, status) => set((state) => ({
    vehicles: state.vehicles.map((v) => v.id === id ? { ...v, status } : v),
  })),

  lockVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.map((v) => v.id === id ? { ...v, status: 'locked' } : v),
  })),

  unlockVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.map((v) => v.id === id ? { ...v, status: 'online' } : v),
  })),

  updateDispatchTask: (id, updates) => set((state) => ({
    dispatchTasks: state.dispatchTasks.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),

  updateInspectionOrder: (id, updates) => set((state) => ({
    inspectionOrders: state.inspectionOrders.map((o) => o.id === id ? { ...o, ...updates } : o),
  })),

  updateComplaint: (id, updates) => set((state) => ({
    complaints: state.complaints.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),

  updatePricingRule: (id, updates) => set((state) => ({
    pricingRules: state.pricingRules.map((r) => r.id === id ? { ...r, ...updates } : r),
  })),

  addInspectionOrder: (order) => set((state) => ({
    inspectionOrders: [{ ...order, id: `i${Date.now()}` }, ...state.inspectionOrders],
  })),
}));
