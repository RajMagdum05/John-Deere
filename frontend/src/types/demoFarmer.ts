export interface DemoFarmer {
  id: string;
  name: string;
  location: string;
}

export interface DemoEquipment {
  id: string;
  stable_key: string;
  name: string;
  model: string;
  equipment_type: string;
  serial_number: string;
  is_connected: boolean;
  connected_at: string | null;
}

export interface EquipmentListResponse {
  farmer: DemoFarmer;
  equipment: DemoEquipment[];
}

export interface SimulationStatusResponse {
  status: 'not_started' | 'running' | 'completed' | 'failed';
  progress: number;
  current_day: number;
  message: string;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

export interface SimulationStartResponse {
  status: string;
  message: string;
}

export interface TodayFarmerSummary {
  name: string;
  location: string;
}

export interface TodaySummaryResponse {
  data_ready: boolean;
  farmer: TodayFarmerSummary;
  connected_machines: number;
  simulated_days: number;
  latest_activity_date: string | null;
  message: string;
}
