import { DemoEquipment } from '../types/demoFarmer';

export interface Device {
  id: string;
  device_id: string;
  name: string;
  model: string;
  icon: 'Agriculture' | 'WaterDrop';
  capacity?: string;
  type?: 'tractor' | 'sprayer';
  is_connected?: boolean;
}

export const DEMO_DEVICES: Device[] = [
  {
    id: 'device-001',
    device_id: '5050D',
    name: '5050D Tractor',
    model: '5050D',
    icon: 'Agriculture',
    type: 'tractor',
    capacity: '120L Capacity • 50 HP',
    is_connected: true,
  },
  {
    id: 'device-002',
    device_id: '5310',
    name: '5310 Tractor',
    model: '5310',
    icon: 'Agriculture',
    type: 'tractor',
    capacity: '100L Capacity • 55 HP',
    is_connected: true,
  },
  {
    id: 'device-003',
    device_id: '6120B',
    name: '6120B Tractor',
    model: '6120B',
    icon: 'Agriculture',
    type: 'tractor',
    capacity: '150L Capacity • 120 HP',
    is_connected: true,
  },
  {
    id: 'device-004',
    device_id: 'R4038',
    name: 'Sprayer',
    model: 'R4038',
    icon: 'WaterDrop',
    type: 'sprayer',
    capacity: '80L Tank • 12m Boom',
    is_connected: true,
  },
];

export const getConnectedDevicesFromStorage = (): Device[] => {
  try {
    const raw = localStorage.getItem('connected_devices');
    if (raw) {
      const parsed: Device[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read connected_devices from localStorage:', e);
  }
  return [];
};

export const saveConnectedDevicesToStorage = (devices: Device[]) => {
  try {
    localStorage.setItem('connected_devices', JSON.stringify(devices));
  } catch (e) {
    console.error('Failed to write connected_devices to localStorage:', e);
  }
};
