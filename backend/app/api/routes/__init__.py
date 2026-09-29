from .farmer_routes import router as farmer_router
from .pm_routes import router as pm_router
from .sync_routes import router as sync_router
from .demo_farmer_routes import router as demo_farmer_router
from .farm_action_routes import router as farm_action_router

__all__ = [
    "farmer_router",
    "pm_router",
    "sync_router",
    "demo_farmer_router",
    "farm_action_router",
]
