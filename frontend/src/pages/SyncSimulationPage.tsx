import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { SimulationStatusResponse } from '../types/demoFarmer';
import { getSimulationStatus, startSimulation } from '../services/demoFarmerApi';
import { TranslationKey } from '../i18n/translations';

interface DayStep {
  day: number;
  labelKey: TranslationKey;
}

const DAYS: DayStep[] = [
  { day: 1, labelKey: 'sync.dayOne' },
  { day: 2, labelKey: 'sync.dayTwo' },
  { day: 3, labelKey: 'sync.dayThree' },
  { day: 4, labelKey: 'sync.dayFour' },
  { day: 5, labelKey: 'sync.dayFive' },
  { day: 6, labelKey: 'sync.daySix' },
  { day: 7, labelKey: 'sync.daySeven' },
];

export const SyncSimulationPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [simStatus, setSimStatus] = useState<SimulationStatusResponse>({
    status: 'not_started',
    progress: 0,
    current_day: 0,
    message: '',
    started_at: null,
    completed_at: null,
    error: null,
  });

  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchStatus = async (): Promise<SimulationStatusResponse | null> => {
    try {
      const data = await getSimulationStatus();
      setSimStatus(data);
      return data;
    } catch (err: unknown) {
      console.error('Failed to fetch simulation status:', err);
      setErrorMessage(t('sync.simulationError'));
      return null;
    }
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      const data = await fetchStatus();
      if (data) {
        if (data.status === 'completed') {
          stopPolling();
          // Auto-navigate after 1200ms
          autoNavTimerRef.current = setTimeout(() => {
            navigate('/farmer/today');
          }, 1200);
        } else if (data.status === 'failed') {
          stopPolling();
          setErrorMessage(data.error || t('sync.simulationError'));
        }
      }
    }, 700);
  };

  useEffect(() => {
    const init = async () => {
      setLoadingInitial(true);
      const data = await fetchStatus();
      setLoadingInitial(false);

      if (data && data.status === 'running') {
        startPolling();
      }
    };

    init();

    return () => {
      stopPolling();
      if (autoNavTimerRef.current) {
        clearTimeout(autoNavTimerRef.current);
      }
    };
  }, []);

  const handleStart = async (reset: boolean = false) => {
    try {
      setIsStarting(true);
      setErrorMessage(null);
      await startSimulation(reset);
      setSimStatus((prev) => ({
        ...prev,
        status: 'running',
        progress: 0,
        current_day: 0,
        message: t('sync.simulating'),
      }));
      startPolling();
    } catch (err: unknown) {
      console.error('Failed to start simulation:', err);
      setErrorMessage(t('sync.simulationError'));
    } finally {
      setIsStarting(false);
    }
  };

  const renderDayProgressText = () => {
    const raw = t('sync.dayProgress');
    return raw.replace('{day}', String(simStatus.current_day || 0));
  };

  const isRunning = simStatus.status === 'running';
  const isCompleted = simStatus.status === 'completed';
  const isFailed = simStatus.status === 'failed';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="lg" sx={{ mb: 6, flex: 1 }}>
        {/* Heading */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {t('sync.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('sync.subtitle')}
          </Typography>
        </Box>

        {/* Phase Note Alert */}
        <Alert
          icon={<InfoOutlinedIcon />}
          severity="info"
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {t('sync.simulationNote')}
        </Alert>

        {/* Error Alert with Retry */}
        {errorMessage && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => handleStart(true)}
                startIcon={<RefreshIcon />}
              >
                {t('common.retry')}
              </Button>
            }
            sx={{ mb: 4, borderRadius: 2 }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Completed Alert */}
        {isCompleted && (
          <Alert
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            sx={{ mb: 4, borderRadius: 2 }}
          >
            {t('sync.dataReady')}
          </Alert>
        )}

        {/* Progress Card */}
        <Card sx={{ mb: 4, p: 3, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {isRunning
                ? renderDayProgressText()
                : isCompleted
                ? t('sync.dataReady')
                : t('sync.title')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {simStatus.progress}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={simStatus.progress}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(0, 0, 0, 0.06)'
                  : 'rgba(255, 255, 255, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                transition: 'transform 0.4s ease-in-out',
              },
            }}
          />

          {simStatus.message && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}
            >
              {simStatus.message}
            </Typography>
          )}
        </Card>

        {/* 7-Day Simulation Cards Grid */}
        <Grid container spacing={2} mb={5}>
          {DAYS.map((dayItem) => {
            const isDayFinished = simStatus.current_day >= dayItem.day || isCompleted;
            const isDayCurrent = simStatus.current_day === dayItem.day && isRunning;

            return (
              <Grid item xs={12} sm={6} md={3} lg={1.71} key={dayItem.day} sx={{ flexGrow: 1 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isDayFinished
                      ? 'primary.main'
                      : isDayCurrent
                      ? 'secondary.main'
                      : 'divider',
                    bgcolor: isDayFinished
                      ? (theme) =>
                          theme.palette.mode === 'light'
                            ? 'rgba(47, 107, 59, 0.06)'
                            : 'rgba(139, 203, 120, 0.08)'
                      : 'background.paper',
                    opacity: isDayFinished || isDayCurrent ? 1 : 0.65,
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: isDayFinished
                          ? 'primary.main'
                          : isDayCurrent
                          ? 'secondary.main'
                          : (theme) =>
                              theme.palette.mode === 'light'
                                ? 'rgba(0, 0, 0, 0.04)'
                                : 'rgba(255, 255, 255, 0.06)',
                        color: isDayFinished || isDayCurrent
                          ? '#FFFFFF'
                          : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      {isDayFinished ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <CalendarMonthIcon fontSize="small" />
                      )}
                    </Box>

                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t(dayItem.labelKey)}
                    </Typography>

                    <Typography variant="caption" color={isDayFinished ? 'primary.main' : 'text.secondary'}>
                      {isDayFinished
                        ? t('connect.connected')
                        : isDayCurrent
                        ? t('sync.simulating')
                        : t('common.comingSoon')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {(!isRunning && !isCompleted) || isFailed ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => handleStart(isFailed || simStatus.status === 'completed')}
              disabled={loadingInitial || isStarting || isRunning}
              startIcon={
                isStarting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PlayArrowIcon />
                )
              }
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {t('sync.startSimulation')}
            </Button>
          ) : isCompleted ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/farmer/today')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {t('sync.goToFarm')}
            </Button>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
};

export default SyncSimulationPage;
