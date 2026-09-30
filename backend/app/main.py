from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import (
    farmer_routes,
    pm_routes,
    pm_dashboard_routes,
    sync_routes,
    demo_farmer_routes,
    farm_action_routes,
    live,
    actions,
)

app = FastAPI(
    title="John Deere Operator Efficiency API",
    description="Backend API for John Deere Operator Efficiency Intelligence Platform",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(farmer_routes.router)
app.include_router(pm_routes.router)
app.include_router(pm_dashboard_routes.router)
app.include_router(sync_routes.router)
app.include_router(demo_farmer_routes.router)
app.include_router(farm_action_routes.router)
app.include_router(live.router)
app.include_router(actions.router)


@app.get("/")
def read_root():
    return {"message": "John Deere Operator Efficiency API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
