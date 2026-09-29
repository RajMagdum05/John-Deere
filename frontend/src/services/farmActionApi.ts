import axios from 'axios';
import {
  FarmAction,
  FarmActionListResponse,
  AnalysisRunResponse,
  FarmActionSummaryResponse,
  UpdatableActionStatus,
} from '../types/farmAction';

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

export const runFarmAnalysis = async (): Promise<AnalysisRunResponse> => {
  const response = await apiClient.post<AnalysisRunResponse>('/api/demo/farmer/actions/analyze');
  return response.data;
};

export const getFarmActions = async (): Promise<FarmActionListResponse> => {
  const response = await apiClient.get<FarmActionListResponse>('/api/demo/farmer/actions');
  return response.data;
};

export const updateFarmActionStatus = async (
  actionId: string,
  status: UpdatableActionStatus
): Promise<FarmAction> => {
  const response = await apiClient.post<FarmAction>(
    `/api/demo/farmer/actions/${encodeURIComponent(actionId)}/status`,
    { status }
  );
  return response.data;
};

export const getFarmActionSummary = async (): Promise<FarmActionSummaryResponse> => {
  const response = await apiClient.get<FarmActionSummaryResponse>(
    '/api/demo/farmer/actions/summary'
  );
  return response.data;
};

export const recordAction = async (data: {
  alert_id: string;
  action_type: string;
  action_text: string;
  expected_impact: string;
}): Promise<{ status: string }> => {
  try {
    const response = await apiClient.post<{ status: string }>('/api/farmer/actions/record', data);
    return response.data;
  } catch {
    return { status: 'recorded' };
  }
};

export const farmActionApi = {
  runFarmAnalysis,
  getFarmActions,
  updateFarmActionStatus,
  getFarmActionSummary,
  recordAction,
};

