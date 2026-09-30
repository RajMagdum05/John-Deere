import axios from 'axios';
import {
  EquipmentListResponse,
  DemoEquipment,
  SimulationStatusResponse,
  SimulationStartResponse,
  TodaySummaryResponse,
} from '../types/demoFarmer';

import { API_BASE_URL } from './apiConfig';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

const DEFAULT_DEMO_EQUIPMENT: DemoEquipment[] = [
  {
    id: 'demo-5050d',
    stable_key: 'demo-5050d',
    name: '5050D Tractor',
    model: '5050D',
    equipment_type: 'TRACTOR',
    serial_number: 'DEMO-5050D-001',
    is_connected: true,
    connected_at: new Date().toISOString(),
  },
  {
    id: 'demo-5310',
    stable_key: 'demo-5310',
    name: '5310 Tractor',
    model: '5310',
    equipment_type: 'TRACTOR',
    serial_number: 'DEMO-5310-001',
    is_connected: true,
    connected_at: new Date().toISOString(),
  },
  {
    id: 'demo-6120b',
    stable_key: 'demo-6120b',
    name: '6120B Tractor',
    model: '6120B',
    equipment_type: 'TRACTOR',
    serial_number: 'DEMO-6120B-001',
    is_connected: true,
    connected_at: new Date().toISOString(),
  },
  {
    id: 'demo-boom-sprayer',
    stable_key: 'demo-boom-sprayer',
    name: 'Boom Sprayer',
    model: 'Boom Sprayer',
    equipment_type: 'SPRAYER',
    serial_number: 'DEMO-SPRAYER-001',
    is_connected: true,
    connected_at: new Date().toISOString(),
  },
];

let localEquipmentState = [...DEFAULT_DEMO_EQUIPMENT];

export const getDemoEquipment = async (): Promise<EquipmentListResponse> => {
  try {
    const response = await apiClient.get<EquipmentListResponse>('/api/demo/farmer/equipment');
    localEquipmentState = response.data.equipment;
    return response.data;
  } catch (err) {
    console.warn('API call failed, using local demo equipment fixtures:', err);
    return {
      farmer: {
        id: 'demo-farmer-pimpri',
        name: 'Rajesh Kumar',
        location: 'Pimpri, Maharashtra',
      },
      equipment: localEquipmentState,
    };
  }
};

export const connectEquipment = async (equipmentId: string): Promise<DemoEquipment> => {
  try {
    const response = await apiClient.post<DemoEquipment>(
      `/api/demo/farmer/equipment/${encodeURIComponent(equipmentId)}/connect`
    );
    return response.data;
  } catch {
    const target = localEquipmentState.find((e) => e.id === equipmentId);
    if (target) {
      target.is_connected = true;
      target.connected_at = new Date().toISOString();
      return target;
    }
    return {
      id: equipmentId,
      stable_key: equipmentId,
      name: equipmentId,
      model: equipmentId,
      equipment_type: 'TRACTOR',
      serial_number: '',
      is_connected: true,
      connected_at: new Date().toISOString(),
    };
  }
};

export const disconnectEquipment = async (equipmentId: string): Promise<DemoEquipment> => {
  try {
    const response = await apiClient.post<DemoEquipment>(
      `/api/demo/farmer/equipment/${encodeURIComponent(equipmentId)}/disconnect`
    );
    return response.data;
  } catch {
    const target = localEquipmentState.find((e) => e.id === equipmentId);
    if (target) {
      target.is_connected = false;
      target.connected_at = null;
      return target;
    }
    return {
      id: equipmentId,
      stable_key: equipmentId,
      name: equipmentId,
      model: equipmentId,
      equipment_type: 'TRACTOR',
      serial_number: '',
      is_connected: false,
      connected_at: null,
    };
  }
};

export const connectAllEquipment = async (): Promise<DemoEquipment[]> => {
  try {
    const response = await apiClient.post<DemoEquipment[]>('/api/demo/farmer/equipment/connect-all');
    localEquipmentState = response.data;
    return response.data;
  } catch {
    localEquipmentState = localEquipmentState.map((e) => ({
      ...e,
      is_connected: true,
      connected_at: new Date().toISOString(),
    }));
    return localEquipmentState;
  }
};

export const resetEquipmentConnections = async (): Promise<DemoEquipment[]> => {
  try {
    const response = await apiClient.post<DemoEquipment[]>('/api/demo/farmer/equipment/reset-connections');
    localEquipmentState = response.data;
    return response.data;
  } catch {
    localEquipmentState = localEquipmentState.map((e) => ({
      ...e,
      is_connected: false,
      connected_at: null,
    }));
    return localEquipmentState;
  }
};

export const getSimulationStatus = async (): Promise<SimulationStatusResponse> => {
  try {
    const response = await apiClient.get<SimulationStatusResponse>(
      '/api/demo/farmer/simulation/status'
    );
    return response.data;
  } catch {
    return {
      status: 'completed',
      progress: 100,
      current_day: 7,
      message: 'Demo farm data is ready.',
      started_at: null,
      completed_at: null,
      error: null,
    };
  }
};

export const startSimulation = async (
  reset: boolean = false
): Promise<SimulationStartResponse> => {
  try {
    const response = await apiClient.post<SimulationStartResponse>(
      `/api/demo/farmer/simulation/start?reset=${reset}`
    );
    return response.data;
  } catch {
    return {
      status: 'running',
      message: 'Started 7-day data preparation simulation.',
    };
  }
};

export const getTodaySummary = async (): Promise<TodaySummaryResponse> => {
  try {
    const response = await apiClient.get<TodaySummaryResponse>(
      '/api/demo/farmer/today-summary'
    );
    return response.data;
  } catch {
    return {
      data_ready: true,
      farmer: {
        name: 'Rajesh Kumar',
        location: 'Pimpri, Maharashtra',
      },
      connected_machines: 4,
      simulated_days: 7,
      latest_activity_date: '2026-09-29',
      message: 'Your demo farm data is ready.',
    };
  }
};

