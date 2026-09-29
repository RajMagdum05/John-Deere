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
  Alert,
  Skeleton,
  Snackbar,
  CircularProgress,
  Stack,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HubIcon from '@mui/icons-material/Hub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { DemoEquipment } from '../types/demoFarmer';
import {
  getDemoEquipment,
  connectEquipment,
  disconnectEquipment,
  connectAllEquipment,
  resetEquipmentConnections,
} from '../services/demoFarmerApi';
import { TranslationKey } from '../i18n/translations';

interface DeviceMetadata {
  categoryKey: TranslationKey;
  purposeKey: TranslationKey;
  isSprayer?: boolean;
}

const DEVICE_METADATA_MAP: Record<string, DeviceMetadata> = {
  'demo-5050d': {
    categoryKey: 'equipment.tractor',
    purposeKey: 'equipment.generalFieldWork',
  },
  'demo-5310': {
    categoryKey: 'equipment.tractor',
    purposeKey: 'equipment.heavyFieldWork',
  },
  'demo-6120b': {
    categoryKey: 'equipment.tractor',
    purposeKey: 'equipment.highPowerWork',
  },
  'demo-boom-sprayer': {
    categoryKey: 'equipment.sprayer',
    purposeKey: 'equipment.cropSpraying',
    isSprayer: true,
  },
};

export const ConnectDevicesPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [equipmentList, setEquipmentList] = useState<DemoEquipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [connectingAll, setConnectingAll] = useState<boolean>(false);
  const [resettingAll, setResettingAll] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDemoEquipment();
      setEquipmentList(data.equipment);
    } catch (err: unknown) {
      console.error('Failed to load demo equipment:', err);
      setError(t('connect.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleToggleSingle = async (item: DemoEquipment) => {
    try {
      setActiveActionId(item.id);
      if (item.is_connected) {
        const updated = await disconnectEquipment(item.id);
        setEquipmentList((prev) =>
          prev.map((eq) => (eq.id === updated.id ? updated : eq))
        );
        setSnackbarMessage(t('connect.disconnectedSuccess'));
      } else {
        const updated = await connectEquipment(item.id);
        setEquipmentList((prev) =>
          prev.map((eq) => (eq.id === updated.id ? updated : eq))
        );
        setSnackbarMessage(t('connect.connectionSuccess'));
      }
    } catch (err) {
      console.error('Failed to toggle equipment connection:', err);
      setSnackbarMessage(t('connect.connectionError'));
    } finally {
      setActiveActionId(null);
    }
  };

  const handleConnectAll = async () => {
    try {
      setConnectingAll(true);
      const updatedList = await connectAllEquipment();
      setEquipmentList(updatedList);
      setSnackbarMessage(t('connect.connectionSuccess'));
    } catch (err) {
      console.error('Failed to connect all equipment:', err);
      setSnackbarMessage(t('connect.connectionError'));
    } finally {
      setConnectingAll(false);
    }
  };

  const handleResetAll = async () => {
    try {
      setResettingAll(true);
      const updatedList = await resetEquipmentConnections();
      setEquipmentList(updatedList);
      setSnackbarMessage(t('connect.resetSuccess'));
    } catch (err) {
      console.error('Failed to reset equipment connections:', err);
      setSnackbarMessage(t('connect.connectionError'));
    } finally {
      setResettingAll(false);
    }
  };

  const connectedCount = equipmentList.filter((item) => item.is_connected).length;
  const hasConnectedEquipment = connectedCount > 0;

  const handleContinue = () => {
    if (!hasConnectedEquipment) {
      setSnackbarMessage(t('connect.selectAtLeastOne'));
      return;
    }
    navigate('/farmer/sync');
  };

  const getMetadata = (item: DemoEquipment): DeviceMetadata => {
    return (
      DEVICE_METADATA_MAP[item.stable_key] ||
      DEVICE_METADATA_MAP[item.id] || {
        categoryKey: 'equipment.tractor',
        purposeKey: 'equipment.generalFieldWork',
      }
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="lg" sx={{ mb: 6, flex: 1 }}>
        {/* Page Heading & Header Buttons */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={4}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {t('connect.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('connect.subtitle')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {connectedCount > 0 && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={
                  resettingAll ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <PowerOffIcon />
                  )
                }
                onClick={handleResetAll}
                disabled={loading || resettingAll || connectingAll}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2,
                  py: 1,
                }}
              >
                {resettingAll ? t('connect.resetting') : t('connect.resetAll')}
              </Button>
            )}

            <Button
              variant="outlined"
              color="primary"
              startIcon={
                connectingAll ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <HubIcon />
                )
              }
              onClick={handleConnectAll}
              disabled={loading || connectingAll || resettingAll || (equipmentList.length > 0 && connectedCount === equipmentList.length)}
              sx={{
                borderRadius: 2.5,
                fontWeight: 600,
                textTransform: 'none',
                px: 2.5,
                py: 1,
              }}
            >
              {t('connect.connectAll')}
            </Button>
          </Stack>
        </Box>

        {/* Phase Note Alert */}
        <Alert
          icon={<InfoOutlinedIcon />}
          severity="info"
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {t('connect.deviceConnectionNote')}
        </Alert>

        {/* Error Alert with Retry */}
        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchEquipment}
                startIcon={<RefreshIcon />}
              >
                {t('common.retry')}
              </Button>
            }
            sx={{ mb: 4, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Device Cards Grid */}
        <Grid container spacing={3} mb={5}>
          {loading
            ? Array.from(new Array(4)).map((_, idx) => (
                <Grid item xs={12} sm={6} md={3} key={`skel-${idx}`}>
                  <Card sx={{ height: '100%', borderRadius: 3, p: 3 }}>
                    <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="80%" height={32} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={50} sx={{ mb: 3, borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 2 }} />
                  </Card>
                </Grid>
              ))
            : equipmentList.map((item) => {
                const meta = getMetadata(item);
                const isActingOnThis = activeActionId === item.id;

                return (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        border: item.is_connected
                          ? '2px solid'
                          : '1px solid',
                        borderColor: item.is_connected
                          ? 'primary.main'
                          : 'divider',
                        transition: 'all 0.25s ease-in-out',
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2.5,
                              bgcolor: (theme) =>
                                item.is_connected
                                  ? theme.palette.mode === 'light'
                                    ? 'rgba(47, 107, 59, 0.15)'
                                    : 'rgba(139, 203, 120, 0.25)'
                                  : theme.palette.mode === 'light'
                                  ? 'rgba(47, 107, 59, 0.08)'
                                  : 'rgba(139, 203, 120, 0.12)',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {meta.isSprayer ? <WaterDropIcon /> : <AgricultureIcon />}
                          </Box>

                          <Chip
                            label={
                              item.is_connected
                                ? t('connect.connected')
                                : t('connect.notConnected')
                            }
                            size="small"
                            color={item.is_connected ? 'success' : 'default'}
                            variant={item.is_connected ? 'filled' : 'outlined'}
                            icon={
                              item.is_connected ? (
                                <CheckCircleOutlineIcon fontSize="small" />
                              ) : undefined
                            }
                            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                          />
                        </Box>

                        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                          {item.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          {t(meta.categoryKey)}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3, flex: 1, lineHeight: 1.5 }}
                        >
                          {t(meta.purposeKey)}
                        </Typography>

                        <Button
                          variant={item.is_connected ? 'outlined' : 'contained'}
                          color={item.is_connected ? 'inherit' : 'primary'}
                          disabled={isActingOnThis || connectingAll || resettingAll}
                          onClick={() => handleToggleSingle(item)}
                          fullWidth
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          {isActingOnThis ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <CircularProgress size={16} color="inherit" />
                              <span>
                                {item.is_connected
                                  ? t('connect.disconnecting')
                                  : t('connect.connecting')}
                              </span>
                            </Box>
                          ) : item.is_connected ? (
                            t('connect.disconnect')
                          ) : (
                            t('connect.connect')
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
        </Grid>

        {/* Continue Action */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          {!hasConnectedEquipment && !loading && (
            <Typography variant="caption" color="text.secondary">
              {t('connect.selectAtLeastOne')}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!hasConnectedEquipment || loading}
            onClick={handleContinue}
            endIcon={<ArrowForwardIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {t('connect.continueToData')}
          </Button>
        </Box>

        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={3000}
          onClose={() => setSnackbarMessage(null)}
          message={snackbarMessage}
        />
      </Container>
    </Box>
  );
};

export default ConnectDevicesPage;
