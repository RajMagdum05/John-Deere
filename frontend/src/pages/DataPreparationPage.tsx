import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Fade,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FastForwardIcon from '@mui/icons-material/FastForward';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckIcon from '@mui/icons-material/Check';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/common/AppHeader';
import DataPreparationAnimation from '../components/DataPreparationAnimation';
import { useLanguage } from '../i18n/LanguageContext';

interface DayAlert {
  id: string;
  type: string;
  equipmentName: string;
  value: string;
  isRepeated?: boolean;
  repeatCount?: number;
}

interface DayData {
  dayNumber: number;
  dateStr: string;
  alerts: DayAlert[];
}

// 7-day deterministic mock telemetry analysis alerts
const DAYS_DATA: Record<number, DayData> = {
  1: {
    dayNumber: 1,
    dateStr: 'Sep 23, 2026',
    alerts: [
      { id: 'd1-1', type: 'High Idle Time', equipmentName: '6120B Tractor', value: '46 minutes', isRepeated: false },
      { id: 'd1-2', type: 'Low Fuel Efficiency', equipmentName: '5050D Tractor', value: '8.2 L/hr', isRepeated: false },
    ],
  },
  2: {
    dayNumber: 2,
    dateStr: 'Sep 24, 2026',
    alerts: [
      { id: 'd2-1', type: 'High Idle Time', equipmentName: '6120B Tractor', value: '52 minutes', isRepeated: true, repeatCount: 2 },
      { id: 'd2-2', type: 'Speed Anomaly', equipmentName: '5310 Tractor', value: '3.2 km/h', isRepeated: false },
      { id: 'd2-3', type: 'Low Fuel Efficiency', equipmentName: '5050D Tractor', value: '7.9 L/hr', isRepeated: false },
    ],
  },
  3: {
    dayNumber: 3,
    dateStr: 'Sep 25, 2026',
    alerts: [
      { id: 'd3-1', type: 'High Idle Time', equipmentName: '6120B Tractor', value: '41 minutes', isRepeated: true, repeatCount: 3 },
      { id: 'd3-2', type: 'GPS Boundary Warning', equipmentName: 'Boom Sprayer', value: '2.3 ha area', isRepeated: false },
    ],
  },
  4: {
    dayNumber: 4,
    dateStr: 'Sep 26, 2026',
    alerts: [
      { id: 'd4-1', type: 'Low Fuel Efficiency', equipmentName: '5050D Tractor', value: '9.1 L/hr', isRepeated: false },
      { id: 'd4-2', type: 'High Idle Time', equipmentName: '6120B Tractor', value: '48 minutes', isRepeated: true, repeatCount: 4 },
      { id: 'd4-3', type: 'Speed Anomaly', equipmentName: '5310 Tractor', value: '2.8 km/h', isRepeated: false },
    ],
  },
  5: {
    dayNumber: 5,
    dateStr: 'Sep 27, 2026',
    alerts: [
      { id: 'd5-1', type: 'High Idle Time', equipmentName: '6120B Tractor', value: '44 minutes', isRepeated: true, repeatCount: 5 },
      { id: 'd5-2', type: 'Low Fuel Efficiency', equipmentName: '5050D Tractor', value: '8.5 L/hr', isRepeated: false },
    ],
  },
  6: {
    dayNumber: 6,
    dateStr: 'Sep 28, 2026',
    alerts: [
      { id: 'd6-1', type: 'Speed Anomaly', equipmentName: '5310 Tractor', value: '3.5 km/h', isRepeated: false },
      { id: 'd6-2', type: 'High Idle Time', equipmentName: '6120B Tractor', value: '49 minutes', isRepeated: true, repeatCount: 6 },
      { id: 'd6-3', type: 'GPS Boundary Warning', equipmentName: 'Boom Sprayer', value: '1.8 ha area', isRepeated: false },
    ],
  },
  7: {
    dayNumber: 7,
    dateStr: 'Sep 29, 2026',
    alerts: [
      { id: 'd7-1', type: 'High Idle Time', equipmentName: '6120B Tractor', value: '46 minutes', isRepeated: true, repeatCount: 7 },
      { id: 'd7-2', type: 'Low Fuel Efficiency', equipmentName: '5050D Tractor', value: '8.8 L/hr', isRepeated: false },
      { id: 'd7-3', type: 'Speed Anomaly', equipmentName: '5310 Tractor', value: '3.1 km/h', isRepeated: false },
      { id: 'd7-4', type: 'GPS Boundary Warning', equipmentName: 'Boom Sprayer', value: '2.1 ha area', isRepeated: false },
    ],
  },
};

export const DataPreparationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [currentDay, setCurrentDay] = useState<number>(1);
  const [processingState, setProcessingState] = useState<'processing' | 'complete'>('processing');

  // Trigger processing animation whenever day changes
  useEffect(() => {
    setProcessingState('processing');
  }, [currentDay]);

  const handleAnimationComplete = () => {
    setProcessingState('complete');
  };

  const handleNextDay = () => {
    if (currentDay < 7) {
      setCurrentDay((prev) => prev + 1);
    }
  };

  const handleCompleteSetup = () => {
    localStorage.setItem('farmer_id', 'demo-farmer-001');
    localStorage.setItem('data_prep_complete', 'true');
    navigate('/farmer/today');
  };

  const handleSkipAnimation = () => {
    setProcessingState('complete');
  };

  const formatAlertType = (typeStr: string) => {
    if (language === 'mr') {
      const mrMap: Record<string, string> = {
        'High Idle Time': 'जास्त निष्क्रिय वेळ',
        'Low Fuel Efficiency': 'कमी इंधन कार्यक्षमता',
        'Speed Anomaly': 'कामाच्या वेगात बदल',
        'GPS Boundary Warning': 'GPS सीमा चेतावणी',
      };
      return mrMap[typeStr] || typeStr;
    }
    return typeStr;
  };

  const formatAlertValue = (valStr: string) => {
    if (language === 'mr') {
      return valStr
        .replace('minutes', 'मिनिटे')
        .replace('L/hr', 'लिटर/तास')
        .replace('km/h', 'किमी/तास')
        .replace('ha area', 'हेक्टर क्षेत्र');
    }
    return valStr;
  };

  const currentDayData = DAYS_DATA[currentDay] || DAYS_DATA[1];
  const isFinalDay = currentDay === 7;

  const getAlertIcon = (type: string) => {
    if (type.includes('Idle')) return <AccessTimeIcon sx={{ color: '#E65100', fontSize: 22 }} />;
    if (type.includes('Fuel')) return <LocalGasStationIcon sx={{ color: '#C62828', fontSize: 22 }} />;
    if (type.includes('Speed')) return <SpeedIcon sx={{ color: '#0277BD', fontSize: 22 }} />;
    if (type.includes('GPS')) return <LocationOnIcon sx={{ color: '#2E7D32', fontSize: 22 }} />;
    return <WarningAmberIcon sx={{ color: '#ED6C02', fontSize: 22 }} />;
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F9FAFB' }}>
      <AppHeader />

      <Container
        maxWidth="md"
        sx={{
          py: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Top Center Day Badge Card */}
        <Card
          elevation={2}
          sx={{
            px: 4,
            py: 2,
            mb: 3,
            borderRadius: 3,
            textAlign: 'center',
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            minWidth: 280,
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              color: '#367C2B',
              letterSpacing: '-0.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {t('sync.dayProgress', { day: currentDay })}
          </Typography>
          <Typography variant="body2" sx={{ color: '#616161', fontWeight: 600, mt: 0.3 }}>
            {processingState === 'processing' ? t('sync.simulating') : t('sync.dataReady')}
          </Typography>
          <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="center" sx={{ mt: 0.8 }}>
            <CalendarMonthIcon sx={{ fontSize: 15, color: '#757575' }} />
            <Typography variant="caption" sx={{ color: '#757575', fontWeight: 700 }}>
              {currentDayData.dateStr} • {language === 'mr' ? '(२३ - २९ सप्टें, २०२६)' : '(Sep 23 - 29, 2026)'}
            </Typography>
          </Stack>
        </Card>

        {/* Main Processing & Alerts Card */}
        <Card
          elevation={4}
          sx={{
            width: '100%',
            maxWidth: 680,
            borderRadius: 3,
            position: 'relative',
            bgcolor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          {/* Top Quick Actions Bar (Skip Button) */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: '#F4F7F4',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: processingState === 'processing' ? '#FFD100' : '#367C2B',
                  boxShadow: processingState === 'processing' ? '0 0 6px #FFD100' : 'none',
                }}
              />
              <Typography variant="caption" sx={{ color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {processingState === 'processing' ? t('prep.activeIngestion') : t('prep.analysisComplete')}
              </Typography>
            </Stack>

            {processingState === 'processing' && (
              <Tooltip title={language === 'mr' ? 'ॲनिमेशन वगळा' : 'Skip animation'}>
                <IconButton
                  size="small"
                  onClick={handleSkipAnimation}
                  sx={{ color: '#367C2B', '&:hover': { bgcolor: 'rgba(54, 124, 43, 0.1)' } }}
                >
                  <FastForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <CardContent sx={{ p: { xs: 2.5, sm: 4 }, minHeight: 340, position: 'relative' }}>
            {/* Reusable Data Preparation Animation */}
            {processingState === 'processing' && (
              <DataPreparationAnimation
                duration={3500}
                onComplete={handleAnimationComplete}
              />
            )}

            {/* Alerts List (Displayed when processing is complete) */}
            {processingState === 'complete' && (
              <Fade in={true} timeout={400}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 2,
                      fontWeight: 800,
                      color: '#4B5563',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.75rem',
                    }}
                  >
                    {t('prep.identifiedAlerts', { count: currentDayData.alerts.length })}
                  </Typography>

                  {/* Alert Cards List */}
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {currentDayData.alerts.map((alert) => (
                      <Box
                        key={alert.id}
                        sx={{
                          p: 2.2,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: alert.isRepeated ? '#367C2B' : '#E5E7EB',
                          bgcolor: alert.isRepeated ? 'rgba(54, 124, 43, 0.04)' : '#FFFFFF',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                          },
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          spacing={2}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: '#F3F4F6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {getAlertIcon(alert.type)}
                            </Box>

                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#111827' }}>
                                  ⚠️ {formatAlertType(alert.type)}
                                </Typography>
                                {alert.isRepeated && (
                                  <Chip
                                    icon={<CheckIcon style={{ fontSize: 13, color: '#FFFFFF' }} />}
                                    label={language === 'mr' ? 'पुनरावृत्ती ✓' : 'Repeated ✓'}
                                    size="small"
                                    sx={{
                                      bgcolor: '#367C2B',
                                      color: '#FFFFFF',
                                      fontWeight: 800,
                                      fontSize: '0.7rem',
                                      height: 22,
                                    }}
                                  />
                                )}
                              </Stack>
                              <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 500, mt: 0.3 }}>
                                {alert.equipmentName} — <strong style={{ color: '#111827' }}>{formatAlertValue(alert.value)}</strong>
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>

                  {/* Day Completed Status Banner */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: '#E8F5E9',
                      border: '1px solid #C8E6C9',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
                    <Typography variant="body1" fontWeight={800} sx={{ color: '#1B5E20' }}>
                      ✓ {t('day_completed', { day: currentDay })}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}

            {/* Bottom Actions Row */}
            <Box
              sx={{
                mt: 2,
                pt: 2.5,
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                {t('prep.step', { day: currentDay, total: 7 })}
              </Typography>

              {isFinalDay ? (
                <Button
                  variant="contained"
                  size="large"
                  disabled={processingState !== 'complete'}
                  onClick={handleCompleteSetup}
                  endIcon={<DoneAllIcon />}
                  sx={{
                    px: 4,
                    py: 1.3,
                    bgcolor: '#367C2B',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 16px rgba(54, 124, 43, 0.4)',
                    '&:hover': {
                      bgcolor: '#2D6623',
                    },
                  }}
                >
                  {t('prep.completeSetup')}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  disabled={processingState !== 'complete'}
                  onClick={handleNextDay}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.2,
                    bgcolor: '#367C2B',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    '&:hover': {
                      bgcolor: '#2D6623',
                    },
                  }}
                >
                  {t('next_day')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* 7-Dot Timeline: Timeline: ● ○ ○ ○ ○ ○ ○ */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 700, mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('prep.timeline', { day: currentDay, total: 7 })}
          </Typography>

          <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const isPast = dayNum < currentDay;
              const isCurrent = dayNum === currentDay;
              const isFuture = dayNum > currentDay;

              return (
                <Tooltip
                  key={dayNum}
                  title={
                    language === 'mr'
                      ? `दिवस ${dayNum}${isPast ? ' (पूर्ण)' : isCurrent ? ' (सक्रिय)' : ' (प्रलंबित)'}`
                      : `Day ${dayNum}${isPast ? ' (Completed)' : isCurrent ? ' (Active)' : ' (Pending)'}`
                  }
                >
                  <Box
                    sx={{
                      width: isCurrent ? 28 : 16,
                      height: isCurrent ? 28 : 16,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      color: '#FFFFFF',
                      bgcolor: isCurrent ? '#367C2B' : isPast ? '#6B7280' : 'transparent',
                      border: isFuture ? '2px solid #D1D5DB' : 'none',
                      boxShadow: isCurrent ? '0 0 12px rgba(54, 124, 43, 0.6)' : 'none',
                      transition: 'all 0.25s ease',
                      cursor: isPast ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (isPast) {
                        setCurrentDay(dayNum);
                      }
                    }}
                  >
                    {isCurrent ? dayNum : null}
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default DataPreparationPage;

