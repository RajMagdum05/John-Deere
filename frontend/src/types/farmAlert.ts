export interface Alert {
  id: string;
  equipment_id: string;
  equipment_name: string;
  type: string;
  value: number | string;
  unit: string;
  timestamp?: string;
  severity?: 'warning' | 'info' | 'critical';
}

export interface TodaySummary {
  data_ready: boolean;
  analysis_ready?: boolean;
  connected_machines?: number;
  simulated_days?: number;
  latest_activity_date?: string;
}
