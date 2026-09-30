import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
  Stack,
  Fade,
  CircularProgress,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TimerIcon from '@mui/icons-material/Timer';
import { useLanguage } from '../i18n/LanguageContext';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { DayByDayAnimation } from '../components/DayByDayAnimation';

interface MachineTelemetry {
  speed?: number;
  fuel_level?: number;
  location?: string;
  idle_minutes?: number;
}

interface MachineLive {
  id: string;
  name: string;
  model: string;
  status: 'working' | 'rest' | 'starting';
  telemetry?: MachineTelemetry;
}

interface LiveDataResponse {
  day?: number;
  farmer_id: string;
  timestamp: string;
  machines: MachineLive[];
}

const DEFAULT_MACHINES: MachineLive[] = [
  {
    id: 'demo-6120b',
    name: '6120B Tractor',
    model: '6120B',
    status: 'working',
    telemetry: {
      speed: 8.2,
      fuel_level: 67,
      location: 'Field B',
      idle_minutes: 12,
    },
  },
  {
    id: 'demo-5050d',
    name: '5050D Tractor',
    model: '5050D',
    status: 'working',
    telemetry: {
      speed: 6.5,
      fuel_level: 82,
      location: 'Field A',
      idle_minutes: 5,
    },
  },
  {
    id: 'demo-5310',
    name: '5310 Tractor',
    model: '5310',
    status: 'rest',
    telemetry: {
      speed: 0.0,
      fuel_level: 0,
      location: 'Garage/Shed',
      idle_minutes: 0,
    },
  },
  {
    id: 'demo-boom-sprayer',
    name: 'Boom Sprayer',
    model: 'Boom Sprayer',
    status: 'rest',
    telemetry: {
      speed: 0.0,
      fuel_level: 88,
      location: 'Shed',
      idle_minutes: 0,
    },
  },
];

export const LiveDashboard: React.FC = () => {
  const { t } = useLanguage();
  const [machines, setMachines] = useState<MachineLive[]>(DEFAULT_MACHINES);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingDay, setFetchingDay] = useState<boolean>(false);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const getStatusColor = (status: string) => {
    if (status === 'working') return 'success.main';
    if (status === 'starting') return 'warning.main';
    return 'grey.400';
  };

  // 1. Error handling and retry logic for Live Data
  const fetchLiveData = async () => {
    try {
      const response = await fetch('/api/farmer/demo-farmer-001/live');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMachines(data.machines);
      setLoading(false);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Failed to fetch live data:', error);
      setRetryCount((prev) => prev + 1);
      if (retryCount >= 3) {
        setLoading(false);
      }
    }
  };

  // 2. Error handling for Day Data with fetchingDay state
  const fetchDayData = async () => {
    setFetchingDay(true);
    try {
      const response = await fetch(`/api/farmer/demo-farmer-001/day/${currentDay}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMachines(data.machines);
    } catch (error) {
      console.error('Failed to fetch day data:', error);
    } finally {
      setFetchingDay(false);
      setLoading(false);
    }
  };

  // Day data fetch effect
  useEffect(() => {
    fetchDayData();
  }, [currentDay]);

  // Live polling effect when on Day 7 and not playing animation
  useEffect(() => {
    if (currentDay === 7 && !isPlaying) {
      fetchLiveData();
      const interval = setInterval(fetchLiveData, 5000);
      return () => clearInterval(interval);
    }
  }, [currentDay, isPlaying, retryCount]);

  // Sequential animation effect (Day 1 -> Day 7)
  useEffect(() => {
    if (isPlaying && currentDay < 7) {
      const timer = setTimeout(() => {
        setCurrentDay((prev) => prev + 1);
      }, 2000); // 2 seconds per day

      return () => clearTimeout(timer);
    } else if (currentDay === 7) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentDay]);

  // 1. Initial Skeleton loader
  if (loading && machines.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <FarmerNavigation />
        <Container maxWidth="lg" sx={{ py: 3, mb: 6, flex: 1 }}>
          {/* Header skeleton */}
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          
          {/* Machine card skeletons */}
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={6} lg={3} key={i}>
                <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width={100} height={20} sx={{ mb: 2 }} />
                    <Stack spacing={1.5}>
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="100%" height={20} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="lg" sx={{ mb: 6, flex: 1, position: 'relative' }}>
        {/* 3. Loading indicator when changing days */}
        {fetchingDay && (
          <Box sx={{ position: 'absolute', top: 10, right: 24, zIndex: 10 }}>
            <CircularProgress size={24} color="primary" />
          </Box>
        )}

        {/* Header section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            {t('nav.liveDashboard')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={currentDay === 7 ? '● Live' : `Day ${currentDay}`}
              color={currentDay === 7 ? 'success' : 'primary'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary">
              {currentDay === 7 ? t('live.updatesEvery5Sec') : t('day.historicalData')}
            </Typography>
          </Stack>
        </Stack>

        {/* Error message UI when retryCount >= 3 */}
        {retryCount >= 3 && (
          <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, mb: 3, border: '1px solid', borderColor: 'error.main' }}>
            <Typography variant="body2" color="error.dark" fontWeight={600}>
              Unable to load live data. Please refresh the page.
            </Typography>
          </Box>
        )}

        {/* Day by Day Animation Timeline Control */}
        <DayByDayAnimation
          currentDay={currentDay}
          onDayChange={setCurrentDay}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying(!isPlaying)}
        />

        {/* Machine Cards */}
        <Grid container spacing={3}>
          {machines.map((machine) => {
            const isWorking = machine.status === 'working';
            const isStarting = machine.status === 'starting';

            return (
              <Grid item xs={12} sm={6} md={6} lg={3} key={machine.id}>
                <Fade in={true} timeout={isStarting ? 1000 : 0}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: (theme) =>
                        theme.palette.mode === 'light'
                          ? '0 4px 18px rgba(0,0,0,0.06)'
                          : '0 4px 18px rgba(0,0,0,0.4)',
                      border: '1px solid',
                      borderColor:
                        isWorking
                          ? 'success.light'
                          : isStarting
                          ? 'warning.light'
                          : 'divider',
                      animation: isStarting ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(255, 167, 38, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(255, 167, 38, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(255, 167, 38, 0)' },
                      },
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header with icon & model */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            bgcolor: isWorking
                              ? 'rgba(54, 181, 74, 0.12)'
                              : isStarting
                              ? 'rgba(255, 167, 38, 0.15)'
                              : 'action.hover',
                            color: isWorking
                              ? '#36B54A'
                              : isStarting
                              ? '#FFA726'
                              : 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AgricultureIcon />
                        </Box>
                        <Chip
                          icon={
                            <CircleIcon
                              sx={{
                                fontSize: '10px !important',
                                color: `${getStatusColor(machine.status)} !important`,
                              }}
                            />
                          }
                          label={
                            isWorking
                              ? t('live.working')
                              : isStarting
                              ? t('live.starting')
                              : t('live.atRest')
                          }
                          size="small"
                          color={
                            isWorking
                              ? 'success'
                              : isStarting
                              ? 'warning'
                              : 'default'
                          }
                          variant={isWorking || isStarting ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>

                      {/* Machine Name */}
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {machine.name}
                      </Typography>

                      {/* Status */}
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {t('live.status')}: {
                          machine.status === 'working'
                            ? t('live.working')
                            : machine.status === 'starting'
                            ? t('live.starting')
                            : t('live.atRest')
                        }
                      </Typography>

                      {/* Fallback for missing telemetry data with Stacks */}
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.2,
                          mt: 'auto',
                        }}
                      >
                        {/* Location */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <LocationOnIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {t('live.location')}:
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {(machine.telemetry?.location === 'Field C'
                              ? t('live.fieldC')
                              : machine.telemetry?.location) || 'Unknown'}
                          </Typography>
                        </Stack>

                        {/* Speed */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <SpeedIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {t('live.speed')}:
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {machine.telemetry?.speed ?? 0} km/h
                          </Typography>
                        </Stack>

                        {/* Fuel */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <LocalGasStationIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {t('live.fuel')}:
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {machine.telemetry?.fuel_level ?? 0}%
                          </Typography>
                        </Stack>

                        {/* Idle */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={0.8}>
                            <TimerIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {t('live.idle')}:
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={(machine.telemetry?.idle_minutes ?? 0) > 10 ? 'warning.main' : 'inherit'}
                          >
                            {machine.telemetry?.idle_minutes ?? 0} min
                          </Typography>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default LiveDashboard;
