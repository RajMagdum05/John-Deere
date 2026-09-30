import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Stack,
  Divider,
  Fade,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SensorsIcon from '@mui/icons-material/Sensors';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { useLanguage } from '../i18n/LanguageContext';
import { Device, DEMO_DEVICES, getConnectedDevicesFromStorage } from '../services/deviceApi';

export const FarmerMachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);

  useEffect(() => {
    // 1. Read from localStorage 'connected_devices'
    const stored = getConnectedDevicesFromStorage();
    if (stored && stored.length > 0) {
      setConnectedDevices(stored);
    } else {
      // 2. Check legacy map 'jd_connected_devices_farmer_001'
      try {
        const rawMap = localStorage.getItem('jd_connected_devices_farmer_001');
        if (rawMap) {
          const parsedMap: Record<string, boolean> = JSON.parse(rawMap);
          const active = DEMO_DEVICES.filter(
            (d) => parsedMap[d.id] || parsedMap[d.device_id] || parsedMap[d.name]
          );
          if (active.length > 0) {
            setConnectedDevices(active);
            return;
          }
        }
      } catch {
        // ignore
      }
      // If nothing saved yet, default to all demo machines for preview
      setConnectedDevices(DEMO_DEVICES);
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="lg" sx={{ py: 4, mb: 6, flex: 1 }}>
        {/* Header Row */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PrecisionManufacturingIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" fontWeight={800} sx={{ color: 'text.primary' }}>
                {t('farmer.machinesTitle')}
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, pl: 5.5 }}>
              {language === 'mr'
                ? 'तुमच्या जोडलेल्या जॉन डीअर यंत्रांचे निरीक्षण आणि व्यवस्थापन करा'
                : 'Monitor and manage your connected John Deere smart farm equipment'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '1rem !important', color: '#FFFFFF !important' }} />}
              label={
                language === 'mr'
                  ? `${connectedDevices.length} यंत्रे जोडलेली आहेत`
                  : `${connectedDevices.length} Machines Connected`
              }
              color="success"
              sx={{ fontWeight: 800, px: 1, py: 2, fontSize: '0.875rem' }}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/farmer/connect')}
              startIcon={<SettingsRemoteIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {language === 'mr' ? 'यंत्र जोडणी बदला' : 'Manage Connections'}
            </Button>
          </Stack>
        </Box>

        {/* Connected Devices Grid */}
        {connectedDevices.length === 0 ? (
          <Card
            sx={{
              py: 8,
              px: 3,
              textAlign: 'center',
              borderRadius: 3.5,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ maxWidth: 480, mx: 'auto' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                }}
              >
                <AgricultureIcon sx={{ fontSize: 44 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {language === 'mr' ? 'कोणतीही यंत्रे जोडलेली नाहीत' : 'No Machines Connected'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {language === 'mr'
                  ? 'शेतातील कार्यक्षमता सूचना आणि शिफारसी मिळवण्यासाठी तुमची ४ डेमो यंत्रे जोडा.'
                  : 'Connect your 4 demo machines to start receiving live telemetry and action loop recommendations.'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/farmer/connect')}
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: 'none', px: 3 }}
              >
                {t('connect_devices')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {connectedDevices.map((device, index) => {
              const isSprayer = device.icon === 'WaterDrop' || device.type === 'sprayer';

              return (
                <Grid item xs={12} sm={6} md={6} lg={3} key={device.id || index}>
                  <Fade in={true} timeout={300 + index * 100}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
                        border: '1.5px solid',
                        borderColor: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(54, 124, 43, 0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Top Icon & Status Badge */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 2.5,
                              bgcolor: 'rgba(54, 124, 43, 0.12)',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSprayer ? <WaterDropIcon sx={{ fontSize: 30 }} /> : <AgricultureIcon sx={{ fontSize: 30 }} />}
                          </Box>

                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
                            label={language === 'mr' ? 'जोडलेले' : 'Connected'}
                            color="success"
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.75rem', px: 0.5 }}
                          />
                        </Box>

                        {/* Machine Details */}
                        <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
                          {device.name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          {language === 'mr' ? 'मॉडेल' : 'Model'}: {device.model}
                        </Typography>

                        {device.capacity && (
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 2.5, display: 'block' }}>
                            {device.capacity}
                          </Typography>
                        )}

                        <Divider sx={{ my: 1.5, mt: 'auto' }} />

                        {/* Card Actions */}
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant="text"
                            color="primary"
                            size="small"
                            fullWidth
                            startIcon={<SensorsIcon fontSize="small" />}
                            onClick={() => navigate('/farmer/live')}
                            sx={{ fontWeight: 700, textTransform: 'none' }}
                          >
                            {language === 'mr' ? 'लाईव्ह टेलिमेट्री' : 'Live Telemetry'}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default FarmerMachinesPage;
