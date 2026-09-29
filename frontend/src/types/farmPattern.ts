export interface Pattern {
  id: string;
  alert_id: string;
  alert_type: string;
  equipment_id: string;
  equipment_name: string;
  occurrence_count: number;
  occurrence_dates: string[];
  values?: number[];
  unit: string;
  common_operation_type?: string;
  common_field_name?: string;
  likely_cause: string;
  confidence: 'low' | 'medium' | 'high';
}
