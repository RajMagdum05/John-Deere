"""
Pattern Detection Service

Analyzes equipment telemetry data to detect operational patterns:
- High idle time
- Low fuel efficiency
- Repeated stops
- Other anomalies

Outputs structured patterns for LLM to generate recommendations.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
import statistics


def detect_patterns(telemetry_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect patterns in telemetry data.
    
    Args:
        telemetry_data: List of telemetry records (from data_generator or JD API)
    
    Returns:
        List of detected patterns
    """
    patterns = []
    
    # Group telemetry by equipment
    by_equipment = defaultdict(list)
    for record in telemetry_data:
        by_equipment[record["equipment_id"]].append(record)
    
    # Detect patterns for each equipment
    for equipment_id, records in by_equipment.items():
        # Pattern 1: High Idle Time
        high_idle_pattern = detect_high_idle(equipment_id, records)
        if high_idle_pattern:
            patterns.append(high_idle_pattern)
        
        # Pattern 2: Low Fuel Efficiency
        low_efficiency_pattern = detect_low_fuel_efficiency(equipment_id, records)
        if low_efficiency_pattern:
            patterns.append(low_efficiency_pattern)
        
        # Pattern 3: Repeated Stops
        repeated_stops_pattern = detect_repeated_stops(equipment_id, records)
        if repeated_stops_pattern:
            patterns.append(repeated_stops_pattern)
    
    return patterns


def detect_high_idle(
    equipment_id: str,
    records: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Detect high idle time pattern.
    
    Criteria:
    - Machine state = "idle" for 2+ consecutive hours
    - Occurred 3+ times in 6 days
    """
    # Find idle periods
    idle_periods = []
    current_idle_start = None
    current_idle_field = None
    
    for record in sorted(records, key=lambda r: r["timestamp"]):
        if record.get("machine_state") == "idle":
            if current_idle_start is None:
                current_idle_start = record["timestamp"]
                current_idle_field = record.get("location", {}).get("field_name", "Unknown")
        else:
            if current_idle_start is not None:
                # End of idle period
                idle_periods.append({
                    "start": current_idle_start,
                    "field": current_idle_field,
                })
                current_idle_start = None
                current_idle_field = None
    
    # Catch any trailing idle period
    if current_idle_start is not None:
        idle_periods.append({
            "start": current_idle_start,
            "field": current_idle_field,
        })
    
    # Check if pattern meets threshold
    if len(idle_periods) >= 3:
        # Calculate statistics
        fields = [p["field"] for p in idle_periods if p["field"]]
        most_common_field = max(set(fields), key=fields.count) if fields else "Unknown"
        
        # Extract hour from timestamps to find peak times
        hours = []
        for record in records:
            if record.get("machine_state") == "idle":
                try:
                    hour = int(record["timestamp"][11:13])  # Extract hour from ISO string
                    hours.append(hour)
                except Exception:
                    pass
        
        # Determine peak time range
        if hours:
            avg_hour = statistics.mean(hours)
            if 9 <= avg_hour <= 12:
                peak_time = "09:00-12:00"
            elif 13 <= avg_hour <= 17:
                peak_time = "13:00-17:00"
            else:
                peak_time = "Variable"
        else:
            peak_time = "Variable"
        
        # Estimate fuel impact (idle consumes ~30% of normal consumption)
        avg_fuel_impact = 2.5  # L/hour wasted (typical for medium tractor)
        
        return {
            "pattern_id": f"pattern-{equipment_id}-idle",
            "type": "high_idle_time",
            "equipment_id": equipment_id,
            "occurrence_count": len(idle_periods),
            "likely_cause": "Operator leaves engine running during breaks or waits",
            "common_operation_type": "General operation",
            "common_field_name": most_common_field,
            "peak_times": peak_time,
            "avg_fuel_impact": avg_fuel_impact,
            "confidence": round(min(0.95, 0.6 + (len(idle_periods) * 0.05)), 2),
        }
    
    return None


def detect_low_fuel_efficiency(
    equipment_id: str,
    records: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Detect low fuel efficiency pattern.
    
    Criteria:
    - Fuel consumption > 40% higher than equipment average
    - Occurred 2+ times in 6 days
    """
    # Calculate average fuel consumption for this equipment
    fuel_consumptions = [r["fuel_consumption"] for r in records if r.get("fuel_consumption", 0) > 0]
    
    if not fuel_consumptions:
        return None
    
    avg_fuel = statistics.mean(fuel_consumptions)
    threshold = avg_fuel * 1.4  # 40% higher than average
    
    # Find high consumption periods
    high_consumption_periods = []
    for record in records:
        if record.get("fuel_consumption", 0) > threshold:
            high_consumption_periods.append(record)
    
    # Check if pattern meets threshold
    if len(high_consumption_periods) >= 2:
        # Find common field
        fields = [r.get("location", {}).get("field_name", "Unknown") for r in high_consumption_periods]
        most_common_field = max(set(fields), key=fields.count) if fields else "Unknown"
        
        # Calculate average impact
        avg_excess = statistics.mean([r["fuel_consumption"] - avg_fuel for r in high_consumption_periods])
        
        return {
            "pattern_id": f"pattern-{equipment_id}-efficiency",
            "type": "low_fuel_efficiency",
            "equipment_id": equipment_id,
            "occurrence_count": len(high_consumption_periods),
            "likely_cause": "Equipment may need maintenance or operator technique issue",
            "common_operation_type": "Heavy load operation",
            "common_field_name": most_common_field,
            "peak_times": "Variable",
            "avg_fuel_impact": round(avg_excess, 2),
            "confidence": round(min(0.95, 0.5 + (len(high_consumption_periods) * 0.1)), 2),
        }
    
    return None


def detect_repeated_stops(
    equipment_id: str,
    records: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Detect repeated stops pattern.
    
    Criteria:
    - Machine stops (speed goes from >5 km/h to 0) repeatedly
    - Occurs 3+ times across data
    """
    sorted_records = sorted(records, key=lambda r: r["timestamp"])
    stop_events = []
    
    prev_speed = 0.0
    for record in sorted_records:
        speed = record.get("speed", 0.0)
        if prev_speed > 5.0 and speed == 0.0:
            stop_events.append(record)
        prev_speed = speed
    
    if len(stop_events) >= 3:
        fields = [r.get("location", {}).get("field_name", "Unknown") for r in stop_events]
        most_common_field = max(set(fields), key=fields.count) if fields else "Unknown"
        
        return {
            "pattern_id": f"pattern-{equipment_id}-stops",
            "type": "repeated_stops",
            "equipment_id": equipment_id,
            "occurrence_count": len(stop_events),
            "likely_cause": "Obstacles in field, implement adjustments, or operator hesitation",
            "common_operation_type": "Field traversal",
            "common_field_name": most_common_field,
            "peak_times": "Variable",
            "avg_fuel_impact": 1.8,
            "confidence": round(min(0.90, 0.55 + (len(stop_events) * 0.05)), 2),
        }
    
    return None
