import axios from 'axios';
import { Alert, TodaySummary } from '../types/farmAlert';

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

export const farmAlertApi = {
  getTodaySummary: async (): Promise<TodaySummary> => {
    try {
      const response = await apiClient.get<TodaySummary>('/api/farmer/alerts/today-summary');
      return response.data;
    } catch {
      const fallback = await apiClient.get<{
        data_ready: boolean;
        connected_machines: number;
        simulated_days: number;
        latest_activity_date?: string;
      }>('/api/demo/farmer/today-summary');
      return {
        data_ready: fallback.data.data_ready,
        analysis_ready: true,
        connected_machines: fallback.data.connected_machines,
        simulated_days: fallback.data.simulated_days,
        latest_activity_date: fallback.data.latest_activity_date,
      };
    }
  },
  getAlerts: async (): Promise<Alert[]> => {
    const response = await apiClient.get<Alert[]>('/api/farmer/alerts');
    return response.data;
  },
};
