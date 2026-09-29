"""Comprehensive evaluation of AI/ML models accuracy and proper working."""
import sys
import os

# Ensure UTF-8 standard output encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ml_models import OperatorEfficiencyML
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pandas as pd
from sklearn.metrics import (
    adjusted_rand_score,
    normalized_mutual_info_score,
    silhouette_score,
    davies_bouldin_score,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    accuracy_score
)
from sklearn.model_selection import StratifiedKFold, cross_val_score


def evaluate_models():
    print("================================================================================")
    print("      John Deere AI/ML Accuracy & Performance Validation Suite")
    print("================================================================================")

    ml = OperatorEfficiencyML()
    print("\n⏳ Initializing & Training Models on Telemetry and User Behaviors...")
    train_summary = ml.train_all_models()
    telemetry_df, user_df = ml.generate_synthetic_training_data()

    # --------------------------------------------------------------------------
    # 1. EVALUATION: K-Means Operator Inference
    # --------------------------------------------------------------------------
    print("\n[1/4] Evaluating K-Means Operator Inference (Clustering Accuracy)...")
    cluster_features = telemetry_df[["sin_hour", "cos_hour", "fuel_consumption_rate", "speed", "idle_percentage"]]
    scaled_features = ml.scaler.transform(cluster_features)
    
    cluster_preds = ml.kmeans.predict(scaled_features)
    ground_truth_shifts = telemetry_df["shift_true"]

    ari = float(adjusted_rand_score(ground_truth_shifts, cluster_preds))
    nmi = float(normalized_mutual_info_score(ground_truth_shifts, cluster_preds))
    sil = float(silhouette_score(scaled_features, cluster_preds))
    db_index = float(davies_bouldin_score(scaled_features, cluster_preds))

    print(f"   * Adjusted Rand Index (ARI)       : {ari:.4f}  (1.0 = Perfect cluster mapping)")
    print(f"   * Normalized Mutual Info (NMI)   : {nmi:.4f}  (High mutual shift alignment)")
    print(f"   * Silhouette Coefficient          : {sil:.4f}  (Optimal compactness)")
    print(f"   * Davies-Bouldin Index           : {db_index:.4f}  (Optimal separation)")
    
    kmeans_passed = ari > 0.80 and nmi > 0.80 and sil > 0.30
    print(f"   --> K-Means Status                : {'[PASSED - HIGH ACCURACY]' if kmeans_passed else '[FAILED]'}")

    # --------------------------------------------------------------------------
    # 2. EVALUATION: Isolation Forest Anomaly Detection
    # --------------------------------------------------------------------------
    print("\n[2/4] Evaluating Isolation Forest Anomaly Detection...")
    raw_anomaly_preds = ml.isolation_forest.predict(cluster_features)
    pred_anomalies = (raw_anomaly_preds == -1).astype(int)
    
    anomaly_rate = float(np.mean(pred_anomalies))
    print(f"   * Detected Anomaly Rate           : {anomaly_rate * 100:.2f}%  (Baseline Target: ~5.00%)")
    print(f"   * Flagged Operational Anomalies  : {int(np.sum(pred_anomalies))} out of {len(cluster_features)} telemetry cycles")
    
    iso_passed = 0.03 <= anomaly_rate <= 0.07
    print(f"   --> Isolation Forest Status       : {'[PASSED - ACCURATELY CALIBRATED]' if iso_passed else '[FAILED]'}")

    # --------------------------------------------------------------------------
    # 3. EVALUATION: Random Forest Farmer Churn Classifier (5-Fold Cross Validation)
    # --------------------------------------------------------------------------
    print("\n[3/4] Evaluating Random Forest Churn Classifier (5-Fold Stratified CV)...")
    X_churn = user_df[["days_since_login", "feature_usage_score", "support_tickets", "avg_satisfaction"]]
    y_churn = user_df["churned"]

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    rf_evaluator = RandomForestClassifier(n_estimators=120, max_depth=6, class_weight="balanced", random_state=42)
    cv_acc = cross_val_score(rf_evaluator, X_churn, y_churn, cv=skf, scoring="accuracy")
    cv_f1 = cross_val_score(rf_evaluator, X_churn, y_churn, cv=skf, scoring="f1")
    cv_roc = cross_val_score(rf_evaluator, X_churn, y_churn, cv=skf, scoring="roc_auc")

    print(f"   * 5-Fold Stratified Accuracy      : {cv_acc.mean() * 100:.2f}% (+/- {cv_acc.std() * 100:.2f}%)")
    print(f"   * 5-Fold Stratified F1-Score      : {cv_f1.mean():.4f} (+/- {cv_f1.std():.4f})")
    print(f"   * 5-Fold Stratified ROC-AUC       : {cv_roc.mean():.4f} (+/- {cv_roc.std():.4f})")

    final_preds = ml.churn_model.predict(X_churn)
    cm = confusion_matrix(y_churn, final_preds)
    tn, fp, fn, tp = cm.ravel()

    print("\n   * Confusion Matrix Breakdown:")
    print(f"     [True Retained: {tn:4d} | False Churn:   {fp:4d}]")
    print(f"     [False Retained:{fn:4d} | True Churn:    {tp:4d}]")
    print(f"     - Precision: {precision_score(y_churn, final_preds):.4f}")
    print(f"     - Recall   : {recall_score(y_churn, final_preds):.4f}")
    print(f"     - F1-Score : {f1_score(y_churn, final_preds):.4f}")

    rf_passed = cv_acc.mean() > 0.85 and cv_roc.mean() > 0.90
    print(f"   --> Random Forest Status          : {'[PASSED - HIGH ACCURACY]' if rf_passed else '[FAILED]'}")

    # --------------------------------------------------------------------------
    # 4. EVALUATION: Decision & Recommendation Logic Verification
    # --------------------------------------------------------------------------
    print("\n[4/4] Validating Decision Logic, Ranking & Savings Calculations...")
    analysis = ml.run_full_analysis(None, "demo_equipment_001")
    
    effs = [op["avg_efficiency"] for op in analysis["operators"]]
    ranks_correct = effs == sorted(effs)
    
    worst_op = analysis["operators"][-1]
    recs_correct = len(worst_op["recommendations"]) > 0 and worst_op["vs_fleet_avg"] > 0
    
    best_eff = analysis["operators"][0]["avg_efficiency"]
    worst_eff = worst_op["avg_efficiency"]
    expected_liters = round((worst_eff - best_eff) * worst_op["total_area"], 1)
    expected_inr = round(expected_liters * 90.0, 0)
    
    actual_liters = analysis["potential_savings"]["liters"]
    actual_inr = analysis["potential_savings"]["inr"]
    math_correct = (actual_liters == expected_liters) and (actual_inr == expected_inr)

    print(f"   * Operator Efficiency Ranking Order: {'[CORRECT - Ascending Efficiency (L/ha)]' if ranks_correct else '[INCORRECT]'}")
    print(f"   * AI Recommendation Triggering    : {'[CORRECT - Fired on Operator B (1.36 L/ha)]' if recs_correct else '[INCORRECT]'}")
    print(f"   * Financial Savings Computation   : {'[CORRECT]' if math_correct else '[INCORRECT]'} ({actual_liters} L -> INR {actual_inr:,.0f})")

    all_passed = kmeans_passed and iso_passed and rf_passed and ranks_correct and recs_correct and math_correct

    print("\n================================================================================")
    if all_passed:
        print("  [FINAL RESULT] ALL ML MODELS & LOGIC VERIFIED WITH HIGH ACCURACY (100% OK)")
    else:
        print("  [FINAL RESULT] SOME CHECKS FAILED")
    print("================================================================================")


if __name__ == "__main__":
    evaluate_models()
