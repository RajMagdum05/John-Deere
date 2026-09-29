Write-Host "🔍 Testing PostgreSQL connection..."
docker exec jd_efficiency_db psql -U jd_user -d john_deere_efficiency -c "SELECT version();"
Write-Host "✅ Database connection successful!`n"

Write-Host "📊 Database info:"
docker exec jd_efficiency_db psql -U jd_user -d john_deere_efficiency -c "\l"

Write-Host "`n📝 Tables (should be empty for now):"
docker exec jd_efficiency_db psql -U jd_user -d john_deere_efficiency -c "\dt"
