#!/bin/bash
echo "🔍 Testing API endpoints..."

# Test health check
echo "Testing /health..."
if command -v curl >/dev/null 2>&1; then
    curl -s http://localhost:8000/health
else
    python -c "import requests; print(requests.get('http://localhost:8000/health').text)"
fi

echo ""
echo "Testing /api/farmer/efficiency..."
if command -v curl >/dev/null 2>&1; then
    curl -s http://localhost:8000/api/farmer/efficiency
else
    python -c "import requests; print(requests.get('http://localhost:8000/api/farmer/efficiency').text)"
fi

echo ""
echo "Testing /api/pm/aggregate-metrics..."
if command -v curl >/dev/null 2>&1; then
    curl -s http://localhost:8000/api/pm/aggregate-metrics
else
    python -c "import requests; print(requests.get('http://localhost:8000/api/pm/aggregate-metrics').text)"
fi

echo ""
echo "✅ API tests completed!"
