"""Machine learning models unit tests."""
from app.services.ml_models import OperatorEfficiencyML


def test_ml_operator_inference():
    ml = OperatorEfficiencyML()
    operators = ml.infer_operators_from_time_patterns(None, "dummy_eq")
    assert len(operators) == 3
    assert "Operator A" in operators
    assert "Operator B" in operators
    assert "Operator C" in operators


def test_ml_efficiency_calculation():
    ml = OperatorEfficiencyML()
    stats_a = ml.calculate_operator_efficiency(None, "dummy_eq", "Operator A")
    assert stats_a["avg_efficiency"] == 1.08
    assert stats_a["total_fuel"] == 1150.0

    stats_b = ml.calculate_operator_efficiency(None, "dummy_eq", "Operator B")
    assert stats_b["avg_efficiency"] == 1.36


def test_ml_recommendations_and_anomalies():
    ml = OperatorEfficiencyML()
    recs = ml.generate_recommendations(1.50, 1.20)
    assert len(recs) > 0

    anomalies = ml.detect_anomalies(None, "dummy_eq")
    assert len(anomalies) > 0


def test_ml_churn_and_full_analysis():
    ml = OperatorEfficiencyML()
    churn = ml.predict_churn_risk(None, "farmer_123")
    assert 0.0 <= churn <= 1.0

    analysis = ml.run_full_analysis(None, "dummy_eq")
    assert "operators" in analysis
    assert "fleet_avg_efficiency" in analysis
    assert "potential_savings" in analysis
    assert len(analysis["operators"]) == 3
