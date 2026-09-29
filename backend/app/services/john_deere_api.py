import requests
import base64
from datetime import datetime
from typing import List, Dict, Optional
import os


class JohnDeereAPIClient:
    def __init__(self):
        self.client_id = os.getenv("JOHN_DEERE_CLIENT_ID")
        self.client_secret = os.getenv("JOHN_DEERE_CLIENT_SECRET")
        self.org_id = os.getenv("JOHN_DEERE_ORG_ID")
        self.sandbox_url = os.getenv("JOHN_DEERE_SANDBOX_URL", "https://sandboxapi.deere.com")
        self.auth_url = "https://signin.johndeere.com/oauth2/aus78tnlaysMraFhC1t7/v1/token"
        self.access_token = None
        self.token_expires_at = None
    
    def get_access_token(self) -> str:
        """Get OAuth 2.0 access token using client credentials flow"""
        if self.access_token and self.token_expires_at and datetime.now().timestamp() < self.token_expires_at:
            return self.access_token
        
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "client_credentials"
        }
        
        response = requests.post(self.auth_url, headers=headers, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self.access_token = token_data["access_token"]
        # Token expires in 1 hour, refresh 5 minutes early
        self.token_expires_at = datetime.now().timestamp() + (token_data.get("expires_in", 3600) - 300)
        
        return self.access_token
    
    def get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        return {
            "Authorization": f"Bearer {self.get_access_token()}",
            "Content-Type": "application/json",
            "Deere-Company": "John Deere"
        }
    
    def get_equipment_list(self) -> List[Dict]:
        """Fetch list of equipment for the organization"""
        url = f"{self.sandbox_url}/platform/organizations/{self.org_id}/equipment"
        response = requests.get(url, headers=self.get_headers())
        response.raise_for_status()
        return response.json().get("items", [])
    
    def get_equipment_measurements(self, equipment_id: str, start_time: Optional[str] = None, end_time: Optional[str] = None) -> List[Dict]:
        """Fetch measurements for specific equipment"""
        url = f"{self.sandbox_url}/equipment/{equipment_id}/measurements"
        params = {"limit": 100}
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        
        response = requests.get(url, headers=self.get_headers(), params=params)
        response.raise_for_status()
        return response.json().get("items", [])
    
    def get_field_operations(self, equipment_id: Optional[str] = None, start_time: Optional[str] = None, end_time: Optional[str] = None) -> List[Dict]:
        """Fetch field operations"""
        url = f"{self.sandbox_url}/field-operations"
        params = {"limit": 100}
        if equipment_id:
            params["equipmentId"] = equipment_id
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        
        response = requests.get(url, headers=self.get_headers(), params=params)
        response.raise_for_status()
        return response.json().get("items", [])
    
    def sync_all_data(self, db_session):
        """Sync all data from John Deere API to database"""
        from app.models import Farmer, Equipment, Measurement, FieldOperation
        
        # Get or create farmer
        farmer = db_session.query(Farmer).filter_by(john_deere_org_id=self.org_id).first()
        if not farmer:
            farmer = Farmer(
                id=f"farmer_{self.org_id}",
                john_deere_org_id=self.org_id,
                name="Demo Farmer",
                email="farmer@demo.com",
                location="Pimpri, Maharashtra"
            )
            db_session.add(farmer)
            db_session.commit()
        
        # Fetch equipment
        equipment_list = self.get_equipment_list()
        print(f"✅ Fetched {len(equipment_list)} equipment from John Deere API")
        
        for equip_data in equipment_list:
            # Get or create equipment
            equipment = db_session.query(Equipment).filter_by(john_deere_id=equip_data["id"]).first()
            if not equipment:
                equipment = Equipment(
                    id=f"equip_{equip_data['id']}",
                    john_deere_id=equip_data["id"],
                    farmer_id=farmer.id,
                    model=equip_data.get("model", "Unknown"),
                    equipment_type=equip_data.get("type", "TRACTOR"),
                    serial_number=equip_data.get("serialNumber", "Unknown"),
                    status=equip_data.get("status", "ACTIVE")
                )
                db_session.add(equipment)
                db_session.commit()
            
            # Fetch measurements
            measurements = self.get_equipment_measurements(equip_data["id"])
            print(f"✅ Fetched {len(measurements)} measurements for {equipment.model}")
            
            for meas_data in measurements:
                measurement = Measurement(
                    id=f"meas_{meas_data['id']}",
                    equipment_id=equipment.id,
                    timestamp=datetime.fromisoformat(meas_data["timestamp"].replace("Z", "+00:00")),
                    fuel_consumption_rate=meas_data.get("fuelConsumptionRate", {}).get("value"),
                    fuel_level=meas_data.get("fuelLevel", {}).get("value"),
                    speed=meas_data.get("speed", {}).get("value"),
                    engine_hours=meas_data.get("engineHours", {}).get("value"),
                    latitude=meas_data.get("location", {}).get("latitude"),
                    longitude=meas_data.get("location", {}).get("longitude")
                )
                db_session.add(measurement)
            
            # Fetch field operations
            operations = self.get_field_operations(equip_data["id"])
            print(f"✅ Fetched {len(operations)} field operations for {equipment.model}")
            
            for op_data in operations:
                operation = FieldOperation(
                    id=f"op_{op_data['id']}",
                    equipment_id=equipment.id,
                    operation_type=op_data.get("operationType", "Unknown"),
                    start_time=datetime.fromisoformat(op_data["startTime"].replace("Z", "+00:00")),
                    end_time=datetime.fromisoformat(op_data["endTime"].replace("Z", "+00:00")) if op_data.get("endTime") else None,
                    area_hectares=op_data.get("area", {}).get("value", 0)
                )
                db_session.add(operation)
            
            db_session.commit()
        
        print(f"✅ Data sync completed successfully!")
        return {"status": "success", "equipment_count": len(equipment_list)}
