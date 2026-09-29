from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models import FarmAction, Equipment
from app.services.demo_telemetry_service import DEMO_FARMER_ID
from app.services.session_analytics_service import (
    extract_session_features,
    analyze_session_groups,
    GroupAnalytics,
)
from app.schemas.farm_action import (
    FarmActionResponse,
    ActionEquipmentResponse,
    ActionEvidenceResponse,
    ActionStepResponse,
    ExpectedOutcomeResponse,
)


class ActionPlanService:
    @staticmethod
    def run_analysis_and_generate_actions(
        db: Session, farmer_id: str = DEMO_FARMER_ID
    ) -> Dict[str, Any]:
        """Runs the session analytics pipeline and persists up to 3 prioritized FarmAction records."""
        # 1. Extract session features
        sessions = extract_session_features(db, farmer_id=farmer_id)
        if not sessions:
            return {
                "analysis_ready": False,
                "sessions_analyzed": 0,
                "actions_generated": 0,
                "message": "No telemetry sessions found for analysis.",
            }

        # 2. Group analytics
        groups = analyze_session_groups(sessions)
        if not groups:
            return {
                "analysis_ready": False,
                "sessions_analyzed": len(sessions),
                "actions_generated": 0,
                "message": "Insufficient session data to form comparable groups.",
            }

        # 3. Candidate action generation
        candidate_actions: List[Dict[str, Any]] = []

        for grp in groups:
            # Check if group has unusual patterns or actionable opportunities
            has_unusual = grp.unusual_session_count > 0 or grp.fuel_deviation_percent > 10.0

            # Estimate fuel opportunity (litres)
            fuel_delta = max(grp.fuel_per_acre_current - grp.fuel_per_acre_baseline, 0.5)
            # representative session area: approx 4 to 6 acres
            representative_acres = 5.0
            total_potential = fuel_delta * representative_acres
            est_min = round(max(total_potential * 0.6, 2.0), 1)
            est_max = round(max(total_potential * 1.0, 4.0), 1)

            # Confidence multiplier for priority scoring
            conf_weight = {"high": 1.0, "medium": 0.75, "low": 0.5}.get(grp.confidence, 0.75)
            base_severity = 70.0 if has_unusual else 30.0

            if grp.operation_type.upper() == "SPRAYING":
                action_type = "review_sprayer_route"
                title_key = "action.sprayerRouteTitle"
                steps = [
                    {"step_id": 1, "action": "step_review_route", "threshold_minutes": None},
                    {"step_id": 2, "action": "step_maintain_speed", "threshold_minutes": None},
                    {"step_id": 3, "action": "step_avoid_repeat_coverage", "threshold_minutes": None},
                    {"step_id": 4, "action": "step_mark_tried", "threshold_minutes": None},
                ]
                expected_outcome = {
                    "unit": "litres",
                    "estimated_min": est_min,
                    "estimated_max": est_max,
                    "label": "estimated_opportunity",
                }
                score = (base_severity * conf_weight) + (grp.unusual_session_count * 6) + (est_max * 1.5)

            elif grp.dominant_contributor == "idle" and has_unusual and grp.confidence in ["medium", "high"]:
                action_type = "reduce_idle_time"
                title_key = "action.reduceIdleTitle"
                steps = [
                    {"step_id": 1, "action": "step_turn_off_engine", "threshold_minutes": 5},
                    {"step_id": 2, "action": "step_observe_idle", "threshold_minutes": None},
                    {"step_id": 3, "action": "step_mark_tried", "threshold_minutes": None},
                ]
                expected_outcome = {
                    "unit": "litres",
                    "estimated_min": est_min,
                    "estimated_max": est_max,
                    "label": "estimated_opportunity",
                }
                score = (base_severity * conf_weight) + (grp.unusual_session_count * 8) + (est_max * 2.0)

            elif grp.dominant_contributor == "speed" and has_unusual and grp.confidence in ["medium", "high"]:
                action_type = "maintain_consistent_speed"
                title_key = "action.consistentSpeedTitle"
                steps = [
                    {"step_id": 1, "action": "step_maintain_speed", "threshold_minutes": None},
                    {"step_id": 2, "action": "step_avoid_rapid_changes", "threshold_minutes": None},
                    {"step_id": 3, "action": "step_mark_tried", "threshold_minutes": None},
                ]
                expected_outcome = {
                    "unit": "litres",
                    "estimated_min": est_min,
                    "estimated_max": est_max,
                    "label": "estimated_opportunity",
                }
                score = (base_severity * conf_weight) + (grp.unusual_session_count * 6) + (est_max * 1.5)

            else:
                action_type = "monitor_next_session"
                title_key = "action.monitorTitle"
                steps = [
                    {"step_id": 1, "action": "step_complete_next", "threshold_minutes": None},
                    {"step_id": 2, "action": "step_mark_tried", "threshold_minutes": None},
                ]
                expected_outcome = None
                score = 25.0 * conf_weight

            evidence = {
                "recent_session_count": grp.recent_session_count,
                "unusual_session_count": grp.unusual_session_count,
                "fuel_per_acre_current": grp.fuel_per_acre_current,
                "fuel_per_acre_baseline": grp.fuel_per_acre_baseline,
                "fuel_deviation_percent": grp.fuel_deviation_percent,
                "idle_ratio_current": grp.idle_ratio_current,
                "idle_ratio_baseline": grp.idle_ratio_baseline,
                "speed_variation_current": grp.speed_variation_current,
                "speed_variation_baseline": grp.speed_variation_baseline,
                "trend_direction": grp.trend_direction,
                "comparable_operation_type": grp.operation_type,
                "confidence": grp.confidence,
            }

            candidate_actions.append({
                "equipment_id": grp.equipment_id,
                "equipment_name": grp.equipment_name,
                "equipment_model": grp.equipment_model,
                "operation_type": grp.operation_type,
                "action_type": action_type,
                "title_key": title_key,
                "confidence": grp.confidence,
                "evidence": evidence,
                "steps": steps,
                "expected_outcome": expected_outcome,
                "score": score,
            })

        # Sort candidates descending by score and pick top 3
        candidate_actions.sort(key=lambda x: x["score"], reverse=True)
        top_candidates = candidate_actions[:3]

        # 4. Persist in database idempotently
        now = datetime.now(timezone.utc)
        generated_action_ids: List[str] = []

        for idx, item in enumerate(top_candidates, start=1):
            action_id = f"act-{farmer_id}-{item['equipment_id']}-{item['action_type']}"
            generated_action_ids.append(action_id)

            existing_action = db.query(FarmAction).filter(FarmAction.id == action_id).first()
            if existing_action:
                existing_action.priority = idx
                existing_action.title_key = item["title_key"]
                existing_action.evidence_json = item["evidence"]
                existing_action.steps_json = item["steps"]
                existing_action.expected_outcome_json = item["expected_outcome"]
                existing_action.confidence = item["confidence"]
                existing_action.updated_at = now
            else:
                new_action = FarmAction(
                    id=action_id,
                    farmer_id=farmer_id,
                    equipment_id=item["equipment_id"],
                    action_type=item["action_type"],
                    priority=idx,
                    status="recommended",
                    title_key=item["title_key"],
                    evidence_json=item["evidence"],
                    steps_json=item["steps"],
                    expected_outcome_json=item["expected_outcome"],
                    confidence=item["confidence"],
                    action_date=now,
                    created_at=now,
                    updated_at=now,
                )
                db.add(new_action)

        # Remove older actions for this farmer that are not in top 3
        if generated_action_ids:
            db.query(FarmAction).filter(
                FarmAction.farmer_id == farmer_id,
                ~FarmAction.id.in_(generated_action_ids),
            ).delete(synchronize_session=False)

        db.commit()

        return {
            "analysis_ready": True,
            "sessions_analyzed": len(sessions),
            "actions_generated": len(generated_action_ids),
            "message": "Farm patterns analysed successfully.",
        }

    @staticmethod
    def get_actions(db: Session, farmer_id: str = DEMO_FARMER_ID) -> List[FarmActionResponse]:
        """Fetch saved farm actions ordered by priority."""
        actions = (
            db.query(FarmAction)
            .filter(FarmAction.farmer_id == farmer_id)
            .order_by(FarmAction.priority.asc())
            .all()
        )

        results: List[FarmActionResponse] = []
        for act in actions:
            equip = db.query(Equipment).filter(Equipment.id == act.equipment_id).first()
            equip_name = equip.model if equip else "Equipment"
            equip_model = equip.model if equip else ""

            evidence_data = act.evidence_json or {}
            steps_data = act.steps_json or []
            expected_data = act.expected_outcome_json

            op_type = evidence_data.get("comparable_operation_type", "GENERAL")

            results.append(
                FarmActionResponse(
                    id=act.id,
                    priority=act.priority,
                    status=act.status,
                    action_type=act.action_type,
                    equipment=ActionEquipmentResponse(
                        id=act.equipment_id,
                        name=equip_name,
                        model=equip_model,
                    ),
                    operation_type=op_type,
                    confidence=act.confidence,
                    evidence=ActionEvidenceResponse(
                        recent_session_count=evidence_data.get("recent_session_count", 0),
                        unusual_session_count=evidence_data.get("unusual_session_count", 0),
                        fuel_per_acre_current=evidence_data.get("fuel_per_acre_current"),
                        fuel_per_acre_baseline=evidence_data.get("fuel_per_acre_baseline"),
                        fuel_deviation_percent=evidence_data.get("fuel_deviation_percent"),
                        idle_ratio_current=evidence_data.get("idle_ratio_current"),
                        idle_ratio_baseline=evidence_data.get("idle_ratio_baseline"),
                        speed_variation_current=evidence_data.get("speed_variation_current"),
                        speed_variation_baseline=evidence_data.get("speed_variation_baseline"),
                        trend_direction=evidence_data.get("trend_direction", "stable"),
                        comparable_operation_type=op_type,
                        confidence=act.confidence,
                    ),
                    steps=[
                        ActionStepResponse(
                            step_id=s.get("step_id", idx + 1),
                            action=s.get("action", ""),
                            threshold_minutes=s.get("threshold_minutes"),
                        )
                        for idx, s in enumerate(steps_data)
                    ],
                    expected_outcome=(
                        ExpectedOutcomeResponse(
                            unit=expected_data.get("unit", "litres"),
                            estimated_min=expected_data.get("estimated_min", 0.0),
                            estimated_max=expected_data.get("estimated_max", 0.0),
                            label=expected_data.get("label", "estimated_opportunity"),
                        )
                        if expected_data
                        else None
                    ),
                    created_at=act.created_at or datetime.now(timezone.utc),
                )
            )

        return results

    @staticmethod
    def update_action_status(
        db: Session, action_id: str, new_status: str, farmer_id: str = DEMO_FARMER_ID
    ) -> Optional[FarmActionResponse]:
        """Updates the status of a farm action record."""
        action = (
            db.query(FarmAction)
            .filter(FarmAction.id == action_id, FarmAction.farmer_id == farmer_id)
            .first()
        )
        if not action:
            return None

        action.status = new_status
        action.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(action)

        equip = db.query(Equipment).filter(Equipment.id == action.equipment_id).first()
        equip_name = equip.model if equip else "Equipment"
        equip_model = equip.model if equip else ""
        evidence_data = action.evidence_json or {}
        steps_data = action.steps_json or []
        expected_data = action.expected_outcome_json

        return FarmActionResponse(
            id=action.id,
            priority=action.priority,
            status=action.status,
            action_type=action.action_type,
            equipment=ActionEquipmentResponse(
                id=action.equipment_id,
                name=equip_name,
                model=equip_model,
            ),
            operation_type=evidence_data.get("comparable_operation_type", "GENERAL"),
            confidence=action.confidence,
            evidence=ActionEvidenceResponse(
                recent_session_count=evidence_data.get("recent_session_count", 0),
                unusual_session_count=evidence_data.get("unusual_session_count", 0),
                fuel_per_acre_current=evidence_data.get("fuel_per_acre_current"),
                fuel_per_acre_baseline=evidence_data.get("fuel_per_acre_baseline"),
                fuel_deviation_percent=evidence_data.get("fuel_deviation_percent"),
                idle_ratio_current=evidence_data.get("idle_ratio_current"),
                idle_ratio_baseline=evidence_data.get("idle_ratio_baseline"),
                speed_variation_current=evidence_data.get("speed_variation_current"),
                speed_variation_baseline=evidence_data.get("speed_variation_baseline"),
                trend_direction=evidence_data.get("trend_direction", "stable"),
                comparable_operation_type=evidence_data.get("comparable_operation_type", "GENERAL"),
                confidence=action.confidence,
            ),
            steps=[
                ActionStepResponse(
                    step_id=s.get("step_id", idx + 1),
                    action=s.get("action", ""),
                    threshold_minutes=s.get("threshold_minutes"),
                )
                for idx, s in enumerate(steps_data)
            ],
            expected_outcome=(
                ExpectedOutcomeResponse(
                    unit=expected_data.get("unit", "litres"),
                    estimated_min=expected_data.get("estimated_min", 0.0),
                    estimated_max=expected_data.get("estimated_max", 0.0),
                    label=expected_data.get("label", "estimated_opportunity"),
                )
                if expected_data
                else None
            ),
            created_at=action.created_at or datetime.now(timezone.utc),
        )
