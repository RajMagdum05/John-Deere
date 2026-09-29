import axios from 'axios';
import {
  EquipmentListResponse,
  DemoEquipment,
  SimulationStatusResponse,
  SimulationStartResponse,
  TodaySummaryResponse,
} from '../types/demoFarmer';

interface CustomImportMeta {
  env?: {
    VITE_API_BASE_URL?: string;
  };
}

const customMeta = import.meta as unknown as CustomImportMeta;
const API_BASE_URL = customMeta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDemoEquipment = async (): Promise<EquipmentListResponse> => {
  const response = await apiClient.get<EquipmentListResponse>('/api/demo/farmer/equipment');
  return response.data;
};

export const connectEquipment = async (equipmentId: string): Promise<DemoEquipment> => {
  const response = await apiClient.post<DemoEquipment>(
    `/api/demo/farmer/equipment/${encodeURIComponent(equipmentId)}/connect`
  );
  return response.data;
};

export const disconnectEquipment = async (equipmentId: string): Promise<DemoEquipment> => {
  const response = await apiClient.post<DemoEquipment>(
    `/api/demo/farmer/equipment/${encodeURIComponent(equipmentId)}/disconnect`
  );
  return response.data;
};

export const connectAllEquipment = async (): Promise<DemoEquipment[]> => {
  const response = await apiClient.post<DemoEquipment[]>('/api/demo/farmer/equipment/connect-all');
  return response.data;
};

export const resetEquipmentConnections = async (): Promise<DemoEquipment[]> => {
  const response = await apiClient.post<DemoEquipment[]>('/api/demo/farmer/equipment/reset-connections');
  return response.data;
};

export const getSimulationStatus = async (): Promise<SimulationStatusResponse> => {
  const response = await apiClient.get<SimulationStatusResponse>(
    '/api/demo/farmer/simulation/status'
  );
  return response.data;
};

export const startSimulation = async (
  reset: boolean = false
): Promise<SimulationStartResponse> => {
  const response = await apiClient.post<SimulationStartResponse>(
    `/api/demo/farmer/simulation/start?reset=${reset}`
  );
  return response.data;
};

export const getTodaySummary = async (): Promise<TodaySummaryResponse> => {
  const response = await apiClient.get<TodaySummaryResponse>(
    '/api/demo/farmer/today-summary'
  );
  return response.data;
};
