#!/bin/bash
echo "🤖 Testing ML models..."

# Test ML analysis endpoint
echo "Testing /api/farmer/operators..."
if command -v curl >/dev/null 2>&1; then
    curl -s http://localhost:8000/api/farmer/operators
else
    python -c "import requests; print(requests.get('http://localhost:8000/api/farmer/operators').text)"
fi

echo ""
echo "Testing /api/farmer/recommendations..."
if command -v curl >/dev/null 2>&1; then
    curl -s http://localhost:8000/api/farmer/recommendations
else
    python -c "import requests; print(requests.get('http://localhost:8000/api/farmer/recommendations').text)"
fi

echo ""
echo "Testing /api/pm/churn-prediction..."
if command -v curl >/dev/null 2>&1; then
    curl -s http://localhost:8000/api/pm/churn-prediction
else
    python -c "import requests; print(requests.get('http://localhost:8000/api/pm/churn-prediction').text)"
fi

echo ""
echo "✅ ML tests completed!"
