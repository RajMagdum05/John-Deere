import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Fade,
  Stack,
  LinearProgress,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HubIcon from '@mui/icons-material/Hub';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getDemoEquipment,
  connectEquipment,
  disconnectEquipment,
  connectAllEquipment,
  resetEquipmentConnections,
} from '../services/demoFarmerApi';
import { DemoEquipment } from '../types/demoFarmer';
import { Device, DEMO_DEVICES, saveConnectedDevicesToStorage } from '../services/deviceApi';

export interface DeviceItem {
  id: string;
  device_id: string;
  stable_key: string;
  name: string;
  model: string;
  icon: 'Agriculture' | 'WaterDrop';
  type: 'tractor' | 'sprayer';
  capacity: string;
  is_connected: boolean;
}

const INITIAL_DEVICES: DeviceItem[] = [
  {
    id: 'device-001',
    device_id: '5050D',
    stable_key: 'demo-5050d',
    name: '5050D Tractor',
    model: '5050D',
    icon: 'Agriculture',
    type: 'tractor',
    capacity: '120L Capacity • 50 HP',
    is_connected: false,
  },
  {
    id: 'device-002',
    device_id: '5310',
    stable_key: 'demo-5310',
    name: '5310 Tractor',
    model: '5310',
    icon: 'Agriculture',
    type: 'tractor',
    capacity: '100L Capacity • 55 HP',
    is_connected: false,
  },
  {
    id: 'device-003',
    device_id: '6120B',
    stable_key: 'demo-6120b',
    name: '6120B Tractor',
    model: '6120B',
    icon: 'Agriculture',
    type: 'tractor',
    capacity: '150L Capacity • 120 HP',
    is_connected: false,
  },
  {
    id: 'device-004',
    device_id: 'R4038',
    stable_key: 'demo-boom-sprayer',
    name: 'Sprayer',
    model: 'R4038',
    icon: 'WaterDrop',
    type: 'sprayer',
    capacity: '80L Tank • 12m Boom',
    is_connected: false,
  },
];

const LOCAL_STORAGE_KEY = 'jd_connected_devices_farmer_001';
const FARMER_ID = 'demo-farmer-001';

export const FarmerConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [devices, setDevices] = useState<DeviceItem[]>(() => {
    try {
      // 1. Check connected_devices array format
      const rawConnected = localStorage.getItem('connected_devices');
      if (rawConnected) {
        const parsedConnected: Device[] = JSON.parse(rawConnected);
        if (Array.isArray(parsedConnected) && parsedConnected.length > 0) {
          const connectedIds = new Set(parsedConnected.map((d) => d.id || d.device_id));
          return INITIAL_DEVICES.map((d) => ({
            ...d,
            is_connected: connectedIds.has(d.id) || connectedIds.has(d.device_id) || connectedIds.has(d.stable_key),
          }));
        }
      }

      // 2. Check legacy map format
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: Record<string, boolean> = JSON.parse(saved);
        return INITIAL_DEVICES.map((d) => ({
          ...d,
          is_connected: Boolean(parsed[d.id] || parsed[d.stable_key] || parsed[d.device_id]),
        }));
      }
    } catch {
      // ignore
    }
    return INITIAL_DEVICES;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [connectingAll, setConnectingAll] = useState<boolean>(false);
  const [resettingAll, setResettingAll] = useState<boolean>(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  // Sync with backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteState = async () => {
      try {
        setLoading(true);
        const data = await getDemoEquipment();
        if (data && data.equipment && isMounted) {
          setDevices((prev) =>
            prev.map((d) => {
              const remote = data.equipment.find(
                (e: DemoEquipment) =>
                  e.id === d.id ||
                  e.id === d.stable_key ||
                  e.stable_key === d.stable_key ||
                  e.model === d.model
              );
              return remote ? { ...d, is_connected: remote.is_connected } : d;
            })
          );
        }
      } catch {
        // Fall back to local state
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRemoteState();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save state to localStorage whenever devices change
  useEffect(() => {
    const stateMap = devices.reduce((acc, d) => {
      acc[d.id] = d.is_connected;
      acc[d.stable_key] = d.is_connected;
      return acc;
    }, {} as Record<string, boolean>);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateMap));

    // Save connected_devices list format
    const connectedList: Device[] = devices
      .filter((d) => d.is_connected)
      .map((d) => ({
        id: d.id,
        device_id: d.device_id,
        name: d.name,
        model: d.model,
        icon: d.icon,
        type: d.type,
        capacity: d.capacity,
        is_connected: true,
      }));
    saveConnectedDevicesToStorage(connectedList);
  }, [devices]);

  const connectedCount = devices.filter((d) => d.is_connected).length;
  const allConnected = connectedCount === 4;

  const handleToggleDevice = async (device: DeviceItem) => {
    setActingId(device.id);
    try {
      if (device.is_connected) {
        try {
          await disconnectEquipment(device.id);
        } catch {
          // ignore API error in offline demo
        }
        setDevices((prev) =>
          prev.map((d) => (d.id === device.id ? { ...d, is_connected: false } : d))
        );
        setSnackbarMsg(`${device.name} disconnected.`);
      } else {
        try {
          await connectEquipment(device.id);
        } catch {
          // ignore API error in offline demo
        }
        setDevices((prev) =>
          prev.map((d) => (d.id === device.id ? { ...d, is_connected: true } : d))
        );
        setSnackbarMsg(`${device.name} successfully connected.`);
      }
    } finally {
      setActingId(null);
    }
  };

  const handleConnectAll = async () => {
    setConnectingAll(true);
    try {
      try {
        await connectAllEquipment();
      } catch {
        // ignore
      }
      setDevices((prev) => prev.map((d) => ({ ...d, is_connected: true })));
      setSnackbarMsg('All 4 machines successfully connected!');
    } finally {
      setConnectingAll(false);
    }
  };

  const handleResetAll = async () => {
    setResettingAll(true);
    try {
      try {
        await resetEquipmentConnections();
      } catch {
        // ignore
      }
      setDevices((prev) => prev.map((d) => ({ ...d, is_connected: false })));
      setSnackbarMsg('All machine connections reset.');
    } finally {
      setResettingAll(false);
    }
  };

  const handleStartDataPreparation = () => {
    if (!allConnected) return;

    // Store farmer ID and setup timestamp
    localStorage.setItem('farmer_id', FARMER_ID);
    localStorage.setItem('farmer_setup_timestamp', new Date().toISOString());

    navigate('/farmer/prepare-data');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="md" sx={{ py: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
              {t('connect_devices')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('connect.linkDevices')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {connectedCount > 0 && (
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={resettingAll ? <CircularProgress size={16} color="inherit" /> : <PowerOffIcon fontSize="small" />}
                onClick={handleResetAll}
                disabled={loading || resettingAll || connectingAll}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                {t('connect.resetAll')}
              </Button>
            )}

            {!allConnected && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={connectingAll ? <CircularProgress size={16} color="inherit" /> : <HubIcon fontSize="small" />}
                onClick={handleConnectAll}
                disabled={loading || connectingAll || resettingAll}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2 }}
              >
                {t('connect.connectAll')}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Progress Bar & Status Indicator */}
        <Card sx={{ mb: 4, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {t('connect.progress')}
              </Typography>
              <Chip
                label={t('connect.devicesConnected', { connected: connectedCount, total: 4 })}
                color={allConnected ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              />
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(connectedCount / 4) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: (theme) => (theme.palette.mode === 'light' ? 'rgba(54, 124, 43, 0.12)' : 'rgba(255, 255, 255, 0.08)'),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: allConnected ? 'success.main' : 'primary.main',
                },
              }}
            />
          </CardContent>
        </Card>

        {/* 2x2 Device Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {devices.map((device, index) => {
            const isActing = actingId === device.id;
            const isSprayer = device.type === 'sprayer';

            return (
              <Grid item xs={12} sm={6} key={device.id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    elevation={device.is_connected ? 3 : 1}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2.5,
                      border: '1.5px solid',
                      borderColor: device.is_connected ? 'primary.main' : 'divider',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 6px 20px rgba(54, 124, 43, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Icon & Status Chip Row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: device.is_connected ? 'rgba(54, 124, 43, 0.15)' : 'action.hover',
                            color: device.is_connected ? 'primary.main' : 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isSprayer ? <WaterDropIcon fontSize="medium" /> : <AgricultureIcon fontSize="medium" />}
                        </Box>

                        <Chip
                          label={device.is_connected ? t('connect.connected') : t('connect.notConnected')}
                          size="small"
                          color={device.is_connected ? 'success' : 'default'}
                          variant={device.is_connected ? 'filled' : 'outlined'}
                          icon={device.is_connected ? <CheckCircleIcon fontSize="small" /> : undefined}
                          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                        />
                      </Box>

                      {/* Device Name & Model */}
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
                        {device.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {language === 'mr' ? 'मॉडेल' : 'Model'}: {device.model}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                        {device.capacity}
                      </Typography>

                      {/* Connect / Disconnect Action */}
                      <Button
                        variant={device.is_connected ? 'outlined' : 'contained'}
                        color={device.is_connected ? 'inherit' : 'primary'}
                        fullWidth
                        disabled={isActing || connectingAll || resettingAll}
                        onClick={() => handleToggleDevice(device)}
                        sx={{
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: 'none',
                        }}
                      >
                        {isActing ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} color="inherit" />
                            <span>{device.is_connected ? t('connect.disconnecting') : t('connect.connecting')}</span>
                          </Box>
                        ) : device.is_connected ? (
                          t('connect.disconnect')
                        ) : (
                          t('connect.connect')
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>

        {/* Bottom Action Section */}
        <Box sx={{ mt: 'auto', pt: 2, textAlign: 'center' }}>
          {allConnected ? (
            <Fade in={true} timeout={400}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body1" fontWeight={700} color="success.main">
                  {t('connect.allDevicesConnected')}
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('connect.connectAllToContinue', { connected: connectedCount })}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!allConnected || loading}
            onClick={handleStartDataPreparation}
            endIcon={<ArrowForwardIcon />}
            sx={{
              py: 1.8,
              fontSize: '1.05rem',
              fontWeight: 800,
              borderRadius: 2.5,
              textTransform: 'none',
              bgcolor: allConnected ? 'primary.main' : undefined,
              boxShadow: allConnected ? '0 6px 20px rgba(54, 124, 43, 0.4)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {t('start_data_prep')}
          </Button>
        </Box>

        <Snackbar
          open={Boolean(snackbarMsg)}
          autoHideDuration={3000}
          onClose={() => setSnackbarMsg(null)}
          message={snackbarMsg}
        />
      </Container>
    </Box>
  );
};

export default FarmerConnectPage;
