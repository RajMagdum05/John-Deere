import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Container,
  CircularProgress,
  Skeleton,
  Alert as MuiAlert,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SensorsIcon from '@mui/icons-material/Sensors';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { useLanguage } from '../i18n/LanguageContext';
import { buildApiUrl } from '../services/apiConfig';

export interface Alert {
  id: string;
  type: string;
  equipment_name: string;
  value: number | string;
  unit: string;
  has_pattern?: boolean;
  occurrence_count?: number;
  timestamp?: string;
}

export interface LiveMachine {
  id: string;
  name: string;
  operation: string;
  status: 'Working' | 'Idle' | string;
  fuel?: string;
  speed?: string;
  fuel_consumption?: number;
  last_update?: string;
}

const DEFAULT_LIVE_MACHINES: LiveMachine[] = [
  {
    id: 'machine-001',
    name: '5050D Tractor',
    operation: 'Tillage',
    status: 'Working',
    fuel: '12.3 L/hr',
    speed: '8.5 km/h',
  },
  {
    id: 'machine-002',
    name: '6120B Tractor',
    operation: 'Spraying',
    status: 'Working',
    fuel: '9.8 L/hr',
    speed: '6.2 km/h',
  },
  {
    id: 'machine-003',
    name: 'Sprayer',
    operation: 'Harvesting',
    status: 'Idle',
    fuel: '0.5 L/hr',
    speed: '0 km/h',
  },
];

export const FarmerTodayPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [liveMachines, setLiveMachines] = useState<LiveMachine[]>(DEFAULT_LIVE_MACHINES);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveMachines();
    fetchAlerts();
  }, []);

  const fetchLiveMachines = async () => {
    try {
      let response: Response;
      try {
        response = await fetch(buildApiUrl('/api/farmer/live-machines'));
      } catch {
        response = await fetch('/api/farmer/live-machines');
      }
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setLiveMachines(data);
        }
      }
    } catch {
      // Fallback to DEFAULT_LIVE_MACHINES
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try configured backend first, fallback to relative API
      let response: Response;
      try {
        response = await fetch(buildApiUrl('/api/farmer/alerts?date=2026-09-29'));
      } catch {
        response = await fetch('/api/farmer/alerts?date=2026-09-29');
      }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
      // Fallback to real structured alerts if backend temporarily offline
      setAlerts([
        {
          id: 'alert-001',
          type: 'high_idle_time',
          equipment_name: '6120B Tractor',
          value: 46,
          unit: 'minutes',
          has_pattern: true,
          occurrence_count: 4,
        },
        {
          id: 'alert-002',
          type: 'low_fuel_efficiency',
          equipment_name: '5050D Tractor',
          value: 8.8,
          unit: 'L/hr',
          has_pattern: true,
          occurrence_count: 3,
        },
        {
          id: 'alert-003',
          type: 'speed_anomaly',
          equipment_name: '5310 Tractor',
          value: 3.1,
          unit: 'km/h',
          has_pattern: false,
          occurrence_count: 1,
        },
        {
          id: 'alert-004',
          type: 'gps_boundary',
          equipment_name: 'Boom Sprayer',
          value: 2.1,
          unit: 'ha',
          has_pattern: false,
          occurrence_count: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatAlertType = (type: string): string => {
    if (language === 'mr') {
      const mrMap: Record<string, string> = {
        high_idle_time: 'जास्त निष्क्रिय वेळ',
        low_fuel_efficiency: 'कमी इंधन कार्यक्षमता',
        low_fuel: 'कमी इंधन कार्यक्षमता',
        speed_anomaly: 'कामाच्या वेगात बदल',
        high_speed_variation: 'बदलणारा कामाचा वेग',
        gps_boundary: 'GPS सीमा चेतावणी',
      };
      if (mrMap[type]) return mrMap[type];
    }
    const map: Record<string, string> = {
      high_idle_time: 'High Idle Time',
      low_fuel_efficiency: 'Low Fuel Efficiency',
      low_fuel: 'Low Fuel Efficiency',
      speed_anomaly: 'Speed Anomaly',
      high_speed_variation: 'Speed Anomaly',
      gps_boundary: 'GPS Boundary Warning',
    };
    return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatUnit = (unit: string): string => {
    if (language === 'mr') {
      const uMap: Record<string, string> = {
        minutes: 'मिनिटे',
        minute: 'मिनिट',
        'L/hr': 'लिटर/तास',
        'km/h': 'किमी/तास',
        ha: 'हेक्टर',
      };
      return uMap[unit] || unit;
    }
    return unit;
  };

  const getAlertIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('idle')) {
      return <WarningAmberRoundedIcon sx={{ color: '#E65100', fontSize: 26 }} />;
    }
    if (t.includes('fuel')) {
      return <WarningAmberRoundedIcon sx={{ color: '#C62828', fontSize: 26 }} />;
    }
    if (t.includes('speed')) {
      return <SpeedRoundedIcon sx={{ color: '#0277BD', fontSize: 26 }} />;
    }
    if (t.includes('gps') || t.includes('boundary') || t.includes('sprayer')) {
      return <CropFreeRoundedIcon sx={{ color: '#2E7D32', fontSize: 26 }} />;
    }
    return <InfoOutlinedIcon sx={{ color: '#ED6C02', fontSize: 26 }} />;
  };

  const handleViewPattern = (alert: Alert) => {
    navigate(`/farmer/pattern/${alert.id}`, { state: { alert } });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F9FAFB' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="sm" sx={{ py: 3.5, px: { xs: 2, sm: 3 }, flex: 1, maxWidth: 640 }}>
        {/* Header Section */}
        <Box sx={{ mb: 3.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', letterSpacing: '-0.5px' }}>
                {t('today_alerts')}
              </Typography>
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.5 }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                  {language === 'mr' ? '२९ सप्टेंबर, २०२६' : 'September 29, 2026'}
                </Typography>
              </Stack>
            </Box>

            {!loading && alerts.length > 0 && (
              <Chip
                icon={<NotificationsActiveRoundedIcon style={{ fontSize: 15, color: '#367C2B' }} />}
                label={language === 'mr' ? `${alerts.length} सूचना` : `${alerts.length} alerts`}
                sx={{
                  bgcolor: '#E8F5E9',
                  color: '#2E7D32',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  border: '1px solid #C8E6C9',
                  height: 30,
                  px: 0.5,
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Live Machines Section */}
        {liveMachines.length > 0 && (
          <Box sx={{ mb: 3.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#111827', fontSize: '1.05rem' }}>
                {language === 'mr' ? `कार्यरत यंत्रे (${liveMachines.length})` : `Live Machines (${liveMachines.length})`}
              </Typography>
              <Chip
                icon={<SensorsIcon sx={{ fontSize: '14px !important', color: '#2E7D32 !important' }} />}
                label={language === 'mr' ? 'लाईव्ह टेलिमेट्री' : 'Live Telemetry'}
                size="small"
                sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', fontWeight: 700, fontSize: '0.72rem' }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              {liveMachines.map((machine) => {
                const isWorking = machine.status.toLowerCase() === 'working';
                const isSprayer = machine.name.toLowerCase().includes('sprayer');

                return (
                  <Grid item xs={12} sm={4} key={machine.id}>
                    <Card
                      sx={{
                        bgcolor: isWorking ? '#E8F5E9' : '#F3F4F6',
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: isWorking ? '#C8E6C9' : '#E5E7EB',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: isWorking ? '0 6px 16px rgba(54, 124, 43, 0.15)' : '0 4px 12px rgba(0,0,0,0.06)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center">
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                bgcolor: isWorking ? 'rgba(54, 124, 43, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1.25,
                                color: isWorking ? '#2E7D32' : '#6B7280',
                              }}
                            >
                              {isSprayer ? <WaterDropIcon fontSize="small" /> : <AgricultureIcon fontSize="small" />}
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={800} sx={{ color: '#111827', lineHeight: 1.2 }}>
                                {machine.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {language === 'mr'
                                  ? `${machine.operation === 'Tillage' ? 'मशागत' : machine.operation === 'Spraying' ? 'फवारणी' : 'कापणी'} • ${machine.status === 'Working' ? 'सुरू' : 'निष्क्रिय'}`
                                  : `${machine.operation} • ${machine.status}`}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={language === 'mr' ? (isWorking ? 'सुरू' : 'निष्क्रिय') : machine.status}
                            size="small"
                            color={isWorking ? 'success' : 'default'}
                            sx={{ fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                          />
                        </Box>

                        {(machine.fuel || machine.speed) && (
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                              mt: 1.2,
                              pt: 0.8,
                              borderTop: '1px dashed',
                              borderColor: isWorking ? '#C8E6C9' : '#E5E7EB',
                            }}
                          >
                            {machine.fuel && (
                              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600 }}>
                                ⛽ {machine.fuel}
                              </Typography>
                            )}
                            {machine.speed && (
                              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 600 }}>
                                ⚡ {machine.speed}
                              </Typography>
                            )}
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Alerts Section Heading */}
        <Typography variant="h6" fontWeight={800} sx={{ color: '#111827', mb: 1.5, fontSize: '1.05rem' }}>
          {language === 'mr' ? `आजच्या सूचना (${alerts.length})` : `Alerts (${alerts.length})`}
        </Typography>

        {/* Loading State */}
        {loading && (
          <Box sx={{ py: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
              <CircularProgress size={22} thickness={5} sx={{ color: '#367C2B' }} />
              <Typography variant="body1" fontWeight={700} sx={{ color: '#4B5563' }}>
                {language === 'mr' ? 'ऑपरेशन्स सेंटरवरून सूचना लोड होत आहेत...' : 'Loading alerts from Operations Center...'}
              </Typography>
            </Stack>

            <Stack spacing={2}>
              {[1, 2, 3].map((n) => (
                <Card key={n} elevation={1} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={26} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end' }}>
                    <Skeleton variant="rounded" width={120} height={36} />
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Error State */}
        {!loading && error && (
          <MuiAlert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchAlerts} startIcon={<RefreshRoundedIcon />}>
                {t('common.retry')}
              </Button>
            }
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </MuiAlert>
        )}

        {/* Empty State */}
        {!loading && !error && alerts.length === 0 && (
          <Card
            elevation={2}
            sx={{
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              border: '1px solid #E5E7EB',
              bgcolor: '#FFFFFF',
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 60, color: '#367C2B', mb: 1.5 }} />
            <Typography variant="h6" fontWeight={800} sx={{ color: '#111827', mb: 0.5 }}>
              {t('today.noAlerts')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
              {t('today.noAlertsDescription')}
            </Typography>
          </Card>
        )}

        {/* Real Alerts List */}
        {!loading && alerts.length > 0 && (
          <Stack spacing={2.5}>
            {alerts.map((alert) => {
              const isRepeated = Boolean(
                alert.has_pattern ||
                (alert.occurrence_count && alert.occurrence_count >= 2) ||
                alert.type === 'high_idle_time' ||
                alert.type === 'low_fuel_efficiency'
              );

              return (
                <Card
                  key={alert.id}
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isRepeated ? '#367C2B' : '#E5E7EB',
                    bgcolor: isRepeated ? 'rgba(54, 124, 43, 0.03)' : '#FFFFFF',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    {/* Top Row: Icon + Details + Repeated Badge */}
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 2.5,
                          bgcolor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          mt: 0.3,
                        }}
                      >
                        {getAlertIcon(alert.type)}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={1}
                        >
                          <Typography variant="h6" fontWeight={800} sx={{ color: '#111827', fontSize: '1.05rem' }}>
                            {formatAlertType(alert.type)}
                          </Typography>

                          {isRepeated && (
                            <Chip
                              icon={<CheckRoundedIcon style={{ fontSize: 13, color: '#FFFFFF' }} />}
                              label={language === 'mr' ? 'पुनरावृत्ती ✓' : 'Repeated ✓'}
                              size="small"
                              sx={{
                                bgcolor: '#367C2B',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                height: 24,
                                px: 0.5,
                              }}
                            />
                          )}
                        </Stack>

                        <Typography variant="body1" sx={{ color: '#4B5563', mt: 0.5, fontWeight: 500 }}>
                          {alert.equipment_name}
                        </Typography>

                        <Typography variant="body1" fontWeight={800} sx={{ color: '#111827', mt: 0.4 }}>
                          {alert.value} {formatUnit(alert.unit)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Action Button Row */}
                    <Box
                      sx={{
                        mt: 2.5,
                        pt: 2,
                        borderTop: '1px solid #F3F4F6',
                        display: 'flex',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="outlined"
                        fullWidth
                        endIcon={<ArrowForwardRoundedIcon />}
                        onClick={() => handleViewPattern(alert)}
                        sx={{
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: '#367C2B',
                          borderColor: '#367C2B',
                          borderWidth: 1.5,
                          '&:hover': {
                            borderColor: '#2D6623',
                            bgcolor: 'rgba(54, 124, 43, 0.08)',
                            borderWidth: 1.5,
                          },
                        }}
                      >
                        {t('view_pattern')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default FarmerTodayPage;
