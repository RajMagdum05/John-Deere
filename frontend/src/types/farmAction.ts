export type ActionStatus =
  | 'recommended'
  | 'will_try'
  | 'tried'
  | 'not_relevant'
  | 'outcome_pending'
  | 'improved'
  | 'inconclusive';

export type UpdatableActionStatus = 'will_try' | 'tried' | 'not_relevant';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type ActionType =
  | 'reduce_idle_time'
  | 'maintain_consistent_speed'
  | 'review_sprayer_route'
  | 'monitor_next_session';

export interface ActionEquipment {
  id: string;
  name: string;
  model: string;
}

export interface ActionEvidence {
  recent_session_count: number;
  unusual_session_count: number;
  fuel_per_acre_current?: number | null;
  fuel_per_acre_baseline?: number | null;
  fuel_deviation_percent?: number | null;
  idle_ratio_current?: number | null;
  idle_ratio_baseline?: number | null;
  speed_variation_current?: number | null;
  speed_variation_baseline?: number | null;
  trend_direction?: string | null;
  comparable_operation_type?: string | null;
  confidence: ConfidenceLevel;
}

export interface ActionStep {
  step_id: number;
  action: string;
  threshold_minutes?: number | null;
}

export interface ExpectedOutcome {
  unit: string;
  estimated_min: number;
  estimated_max: number;
  label: string;
}

export interface FarmAction {
  id: string;
  priority: number;
  status: ActionStatus;
  action_type: ActionType;
  equipment: ActionEquipment;
  operation_type: string;
  confidence: ConfidenceLevel;
  evidence: ActionEvidence;
  steps: ActionStep[];
  expected_outcome?: ExpectedOutcome | null;
  created_at: string;
}

export interface FarmActionListResponse {
  analysis_ready: boolean;
  actions: FarmAction[];
}

export interface AnalysisRunResponse {
  analysis_ready: boolean;
  sessions_analyzed: number;
  actions_generated: number;
  message: string;
}

export interface TopActionSummary {
  id: string;
  priority: number;
  action_type: string;
  equipment_name: string;
  confidence: ConfidenceLevel;
}

export interface FarmActionSummaryResponse {
  analysis_ready: boolean;
  attention_needed: boolean;
  action_count: number;
  top_action?: TopActionSummary | null;
}
