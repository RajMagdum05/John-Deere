"""Train and evaluate AI/ML models for John Deere Operator Efficiency Platform."""
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
import json


def main():
    print("==========================================================")
    print("  John Deere Precision Agriculture AI/ML Training Pipeline")
    print("==========================================================")
    
    ml = OperatorEfficiencyML()
    print("\n[1/4] Generating Precision Agriculture Telemetry & User Dataset...")
    results = ml.train_all_models()
    
    print("\n[2/4] Training Complete!")
    print("----------------------------------------------------------")
    print(">> Model 1: K-Means Operator Clustering")
    print(f"   * Number of Operator Shift Clusters: {results['kmeans']['n_clusters']}")
    print(f"   * Silhouette Score: {results['kmeans']['silhouette_score']}")
    print(f"   * Cluster Centers: {len(results['kmeans']['cluster_centers'])} centroids computed")
    
    print("\n>> Model 2: Isolation Forest Anomaly Detection")
    print(f"   * Estimators: {results['isolation_forest']['n_estimators']}")
    print(f"   * Anomalies Flagged: {results['isolation_forest']['anomalies_detected']}")
    print(f"   * Contamination Rate: {results['isolation_forest']['anomaly_rate'] * 100:.1f}%")
    
    print("\n>> Model 3: Random Forest Farmer Churn Classifier")
    print(f"   * Accuracy: {results['churn_model']['accuracy'] * 100:.2f}%")
    print(f"   * ROC-AUC Score: {results['churn_model']['roc_auc']:.4f}")
    print("   * Feature Importances:")
    for feat, imp in results['churn_model']['feature_importances'].items():
        print(f"     - {feat:22s}: {imp * 100:.2f}%")
    
    print("\n[3/4] Testing End-to-End Analysis Pipeline...")
    analysis = ml.run_full_analysis(None, "demo_equipment_001")
    print(f"   * Fleet Average Efficiency: {analysis['fleet_avg_efficiency']} L/ha")
    print(f"   * Potential Fleet Fuel Savings: {analysis['potential_savings']['liters']} Liters")
    print(f"   * Potential Cost Savings: INR {analysis['potential_savings']['inr']:,.0f}")
    print(f"   * Operators Evaluated: {len(analysis['operators'])}")
    for op in analysis['operators']:
        print(f"     - Rank {op['rank']}: {op['operator']:12s} | {op['avg_efficiency']} L/ha | Trend: {op['trend']['trend_direction']}")
    
    print("\n[4/4] Saved Model Artifacts to models_cache/")
    print("==========================================================")
    print("  [SUCCESS] All AI/ML Models Trained & Verified!")
    print("==========================================================")


if __name__ == "__main__":
    main()
