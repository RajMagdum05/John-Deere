export type Language = 'en' | 'mr';

export type ThemeMode = 'light' | 'dark';

export type UserRole = 'farmer' | 'pm';

export interface DeviceCardInfo {
  id: string;
  name: string;
  categoryKey: 'equipment.tractor' | 'equipment.sprayer';
  purposeKey:
    | 'equipment.generalFieldWork'
    | 'equipment.heavyFieldWork'
    | 'equipment.highPowerWork'
    | 'equipment.cropSpraying';
  isSprayer?: boolean;
}
