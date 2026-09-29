#!/bin/bash
echo "🔧 Initializing database..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL..."
until docker exec jd_efficiency_db psql -U jd_user -d john_deere_efficiency -c "SELECT 1" > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Database is ready!"

# Initialize Alembic
echo "📝 Initializing Alembic..."
cd /app
alembic init alembic

# Generate initial migration
echo "🔄 Generating initial migration..."
alembic revision --autogenerate -m "Initial migration - create all tables"

# Run migrations
echo "⬆️  Running migrations..."
alembic upgrade head

echo "✅ Database initialized successfully!"
echo ""
echo "📊 Tables created:"
docker exec jd_efficiency_db psql -U jd_user -d john_deere_efficiency -c "\dt"
