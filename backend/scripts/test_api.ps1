Write-Host "🔍 Testing API endpoints..."

Write-Host "Testing /health..."
Invoke-RestMethod -Uri "http://localhost:8000/health" | ConvertTo-Json

Write-Host "`nTesting /api/farmer/efficiency..."
Invoke-RestMethod -Uri "http://localhost:8000/api/farmer/efficiency" | ConvertTo-Json

Write-Host "`nTesting /api/pm/aggregate-metrics..."
Invoke-RestMethod -Uri "http://localhost:8000/api/pm/aggregate-metrics" | ConvertTo-Json

Write-Host "`n✅ API tests completed!"
