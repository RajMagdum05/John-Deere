Write-Host "🤖 Testing ML models..."

Write-Host "Testing /api/farmer/operators..."
Invoke-RestMethod -Uri "http://localhost:8000/api/farmer/operators" | ConvertTo-Json -Depth 4

Write-Host "`nTesting /api/farmer/recommendations..."
Invoke-RestMethod -Uri "http://localhost:8000/api/farmer/recommendations" | ConvertTo-Json -Depth 4

Write-Host "`nTesting /api/pm/churn-prediction..."
Invoke-RestMethod -Uri "http://localhost:8000/api/pm/churn-prediction" | ConvertTo-Json -Depth 4

Write-Host "`n✅ ML tests completed!"
