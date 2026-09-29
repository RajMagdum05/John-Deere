from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional
import numpy as np
from sqlalchemy.orm import Session
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest

from app.models import Farmer, Equipment, FieldOperation, Measurement
from app.services.demo_telemetry_service import DEMO_FARMER_ID, get_display_name


@dataclass
class SessionFeatures:
    operation_id: str
    equipment_id: str
    equipment_model: str
    equipment_name: str
    operation_type: str
    session_start: datetime
    session_end: datetime
    duration_hours: float
    area_hectares: float
    area_acres: float
    average_speed_kmh: float
    speed_std_kmh: float
    average_fuel_rate_lph: float
    estimated_fuel_litres: float
    fuel_per_acre: float
    engine_hour_delta: float
    idle_proxy_ratio: float
    is_unusual: bool = False
    severity_score: float = 0.0


@dataclass
class GroupAnalytics:
    group_key: str
    equipment_id: str
    equipment_name: str
    equipment_model: str
    operation_type: str
    sessions: List[SessionFeatures] = field(default_factory=list)
    recent_session_count: int = 0
    unusual_session_count: int = 0
    fuel_per_acre_current: float = 0.0
    fuel_per_acre_baseline: float = 0.0
    fuel_deviation_percent: float = 0.0
    idle_ratio_current: float = 0.0
    idle_ratio_baseline: float = 0.0
    speed_variation_current: float = 0.0
    speed_variation_baseline: float = 0.0
    trend_direction: str = "stable"
    confidence: str = "medium"
    dominant_contributor: str = "idle"  # "idle" | "speed" | "sprayer" | "general"


def extract_session_features(db: Session, farmer_id: str = DEMO_FARMER_ID) -> List[SessionFeatures]:
    """Extract and calculate numerical session features for each FieldOperation belonging to the farmer."""
    operations = (
        db.query(FieldOperation)
        .join(Equipment, FieldOperation.equipment_id == Equipment.id)
        .filter(Equipment.farmer_id == farmer_id)
        .order_by(FieldOperation.start_time.asc())
        .all()
    )

    results: List[SessionFeatures] = []

    for op in operations:
        equip = db.query(Equipment).filter(Equipment.id == op.equipment_id).first()
        if not equip:
            continue

        measurements = (
            db.query(Measurement)
            .filter(
                Measurement.equipment_id == op.equipment_id,
                Measurement.timestamp >= op.start_time,
                Measurement.timestamp <= op.end_time,
            )
            .order_by(Measurement.timestamp.asc())
            .all()
        )

        duration_hours = max(
            (op.end_time - op.start_time).total_seconds() / 3600.0 if op.end_time and op.start_time else 0.5,
            0.1,
        )
        area_ha = float(op.area_hectares or 0.0)
        area_acres = area_ha * 2.47105

        if measurements:
            speeds = [float(m.speed or 0.0) for m in measurements if m.speed is not None]
            fuel_rates = [
                float(m.fuel_consumption_rate or 0.0)
                for m in measurements
                if m.fuel_consumption_rate is not None
            ]
            engine_hours_list = [
                float(m.engine_hours)
                for m in measurements
                if m.engine_hours is not None
            ]

            avg_speed = float(np.mean(speeds)) if speeds else 6.0
            speed_std = float(np.std(speeds)) if len(speeds) > 1 else 0.5
            avg_fuel_rate = float(np.mean(fuel_rates)) if fuel_rates else 9.0
            idle_count = sum(1 for s in speeds if s < 1.0)
            idle_proxy_ratio = float(idle_count / len(speeds)) if speeds else 0.1
            engine_hour_delta = (
                max(engine_hours_list) - min(engine_hours_list)
                if len(engine_hours_list) > 1
                else duration_hours
            )
        else:
            avg_speed = 6.0
            speed_std = 0.5
            avg_fuel_rate = 9.0
            idle_proxy_ratio = 0.1
            engine_hour_delta = duration_hours

        estimated_fuel_litres = avg_fuel_rate * duration_hours
        fuel_per_acre = (
            estimated_fuel_litres / area_acres if area_acres > 0.05 else estimated_fuel_litres / 2.0
        )

        results.append(
            SessionFeatures(
                operation_id=op.id,
                equipment_id=equip.id,
                equipment_model=equip.model,
                equipment_name=get_display_name(equip),
                operation_type=op.operation_type or "GENERAL",
                session_start=op.start_time,
                session_end=op.end_time,
                duration_hours=round(duration_hours, 2),
                area_hectares=round(area_ha, 2),
                area_acres=round(area_acres, 2),
                average_speed_kmh=round(avg_speed, 2),
                speed_std_kmh=round(speed_std, 2),
                average_fuel_rate_lph=round(avg_fuel_rate, 2),
                estimated_fuel_litres=round(estimated_fuel_litres, 2),
                fuel_per_acre=round(fuel_per_acre, 2),
                engine_hour_delta=round(engine_hour_delta, 2),
                idle_proxy_ratio=round(idle_proxy_ratio, 3),
            )
        )

    return results


def analyze_session_groups(sessions: List[SessionFeatures]) -> List[GroupAnalytics]:
    """Group sessions by equipment + operation type and perform ML / statistical pattern analysis."""
    if not sessions:
        return []

    # 1. Group sessions by (equipment_id, operation_type)
    groups_dict: Dict[str, List[SessionFeatures]] = {}
    for s in sessions:
        key = f"{s.equipment_id}__{s.operation_type}"
        groups_dict.setdefault(key, []).append(s)

    group_analytics_list: List[GroupAnalytics] = []

    for key, group in groups_dict.items():
        if not group:
            continue

        equip_id = group[0].equipment_id
        equip_name = group[0].equipment_name
        equip_model = group[0].equipment_model
        op_type = group[0].operation_type
        n_sessions = len(group)

        # Feature matrix for anomaly detection / clustering:
        # [fuel_per_acre, idle_proxy_ratio, speed_std_kmh, average_speed_kmh, duration_hours]
        X = np.array([
            [s.fuel_per_acre, s.idle_proxy_ratio, s.speed_std_kmh, s.average_speed_kmh, s.duration_hours]
            for s in group
        ])

        # Baseline metrics calculation
        fuel_values = np.array([s.fuel_per_acre for s in group])
        idle_values = np.array([s.idle_proxy_ratio for s in group])
        speed_std_values = np.array([s.speed_std_kmh for s in group])

        median_fuel = float(np.median(fuel_values))
        median_idle = float(np.median(idle_values))
        median_speed_std = float(np.median(speed_std_values))

        # Detect unusual sessions using IsolationForest (if >= 6 samples) or robust IQR fallback
        if n_sessions >= 6:
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            # KMeans for baseline clustering (internal only)
            kmeans = KMeans(n_clusters=2, random_state=20260929, n_init=10)
            cluster_labels = kmeans.fit_predict(X_scaled)
            # Find the normal cluster (the one with lower average fuel_per_acre)
            c0_fuel = np.mean([group[i].fuel_per_acre for i in range(n_sessions) if cluster_labels[i] == 0])
            c1_fuel = np.mean([group[i].fuel_per_acre for i in range(n_sessions) if cluster_labels[i] == 1])
            normal_cluster = 0 if c0_fuel <= c1_fuel else 1
            normal_indices = [i for i in range(n_sessions) if cluster_labels[i] == normal_cluster]

            if normal_indices:
                baseline_fuel = float(np.median([group[i].fuel_per_acre for i in normal_indices]))
                baseline_idle = float(np.median([group[i].idle_proxy_ratio for i in normal_indices]))
                baseline_speed_std = float(np.median([group[i].speed_std_kmh for i in normal_indices]))
            else:
                baseline_fuel = median_fuel
                baseline_idle = median_idle
                baseline_speed_std = median_speed_std

            # IsolationForest for identifying unusual sessions
            contamination = float(min(0.25, max(0.10, 1.0 / n_sessions)))
            iso = IsolationForest(contamination=contamination, random_state=20260929)
            preds = iso.fit_predict(X_scaled)  # -1 = anomaly, 1 = normal

            for i, s in enumerate(group):
                # Also check if it's on the higher side of consumption/idle
                if preds[i] == -1 and (s.fuel_per_acre > baseline_fuel * 1.1 or s.idle_proxy_ratio > baseline_idle * 1.2):
                    s.is_unusual = True
                    s.severity_score = min(100.0, max(20.0, ((s.fuel_per_acre - baseline_fuel) / max(baseline_fuel, 0.1)) * 100))
                else:
                    s.is_unusual = False
                    s.severity_score = 0.0

            confidence = "high" if n_sessions >= 6 else "medium"
        else:
            # Fallback statistical IQR
            q25_f, q75_f = np.percentile(fuel_values, [25, 75])
            iqr_f = q75_f - q25_f
            fuel_threshold = q75_f + 1.0 * iqr_f if iqr_f > 0 else median_fuel * 1.15

            q25_i, q75_i = np.percentile(idle_values, [25, 75])
            iqr_i = q75_i - q25_i
            idle_threshold = q75_i + 1.0 * iqr_i if iqr_i > 0 else median_idle * 1.2

            baseline_fuel = float(np.median([v for v in fuel_values if v <= fuel_threshold])) if any(v <= fuel_threshold for v in fuel_values) else median_fuel
            baseline_idle = float(np.median([v for v in idle_values if v <= idle_threshold])) if any(v <= idle_threshold for v in idle_values) else median_idle
            baseline_speed_std = median_speed_std

            for s in group:
                if s.fuel_per_acre > fuel_threshold or s.idle_proxy_ratio > idle_threshold:
                    s.is_unusual = True
                    s.severity_score = min(100.0, max(20.0, ((s.fuel_per_acre - baseline_fuel) / max(baseline_fuel, 0.1)) * 100))
                else:
                    s.is_unusual = False
                    s.severity_score = 0.0

            confidence = "medium" if n_sessions >= 3 else "low"

        # Trend analysis: slope of fuel_per_acre over time
        sorted_by_date = sorted(group, key=lambda s: s.session_start)
        if len(sorted_by_date) >= 3:
            time_indices = np.arange(len(sorted_by_date))
            fuel_series = np.array([s.fuel_per_acre for s in sorted_by_date])
            slope = float(np.polyfit(time_indices, fuel_series, 1)[0])
            if slope > 0.15:
                trend = "increasing"
            elif slope < -0.15:
                trend = "improving"
            else:
                trend = "stable"
        else:
            trend = "stable"

        # Aggregate metrics for unusual sessions vs baseline
        unusual_sessions = [s for s in group if s.is_unusual]
        unusual_count = len(unusual_sessions)

        if unusual_count > 0:
            current_fuel = float(np.mean([s.fuel_per_acre for s in unusual_sessions]))
            current_idle = float(np.mean([s.idle_proxy_ratio for s in unusual_sessions]))
            current_speed_std = float(np.mean([s.speed_std_kmh for s in unusual_sessions]))
        else:
            current_fuel = float(np.mean([s.fuel_per_acre for s in group]))
            current_idle = float(np.mean([s.idle_proxy_ratio for s in group]))
            current_speed_std = float(np.mean([s.speed_std_kmh for s in group]))

        fuel_dev_pct = round(((current_fuel - baseline_fuel) / max(baseline_fuel, 0.1)) * 100, 1)

        # Determine dominant contributor
        idle_dev = (current_idle - baseline_idle) / max(baseline_idle, 0.01)
        speed_dev = (current_speed_std - baseline_speed_std) / max(baseline_speed_std, 0.01)

        if op_type.upper() == "SPRAYING":
            dominant = "sprayer"
        elif idle_dev > speed_dev and current_idle > 0.18:
            dominant = "idle"
        elif speed_dev > 0.25:
            dominant = "speed"
        else:
            dominant = "idle" if current_idle > 0.15 else "general"

        group_analytics_list.append(
            GroupAnalytics(
                group_key=key,
                equipment_id=equip_id,
                equipment_name=equip_name,
                equipment_model=equip_model,
                operation_type=op_type,
                sessions=group,
                recent_session_count=n_sessions,
                unusual_session_count=unusual_count,
                fuel_per_acre_current=round(current_fuel, 2),
                fuel_per_acre_baseline=round(baseline_fuel, 2),
                fuel_deviation_percent=max(fuel_dev_pct, 0.0),
                idle_ratio_current=round(current_idle, 3),
                idle_ratio_baseline=round(baseline_idle, 3),
                speed_variation_current=round(current_speed_std, 2),
                speed_variation_baseline=round(baseline_speed_std, 2),
                trend_direction=trend,
                confidence=confidence,
                dominant_contributor=dominant,
            )
        )

    return group_analytics_list
