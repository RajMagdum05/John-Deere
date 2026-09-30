import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Container,
  IconButton,
  Chip,
  Skeleton,
  Tooltip,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';

import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { useLanguage } from '../i18n/LanguageContext';

export interface PatternData {
  alert_id: string;
  alert_type: string;
  equipment_name: string;
  occurrence_count: number;
  occurrence_dates: string[];
  values: number[];
  unit: string;
  likely_cause: string;
  action_recommendation: string;
  fuel_savings_estimate?: string;
  common_operation_type?: string;
  common_field_name?: string;
}

export const PatternDetailsPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const stateAlert = (location.state as any)?.alert;

  const [loading, setLoading] = useState<boolean>(true);
  const [pattern, setPattern] = useState<PatternData | null>(null);

  useEffect(() => {
    loadPatternData();
  }, [alertId]);

  const loadPatternData = async () => {
    setLoading(true);
    try {
      const targetId = alertId || stateAlert?.id || 'alert-001';
      let response: Response;
      try {
        response = await fetch(`http://localhost:8000/api/farmer/alerts/${targetId}/pattern`);
      } catch {
        response = await fetch(`/api/farmer/alerts/${targetId}/pattern`);
      }

      if (response.ok) {
        const data = await response.json();
        setPattern(data);
      } else {
        throw new Error('Fallback to structured pattern');
      }
    } catch {
      // Deterministic LLM-backed pattern fallback for demo resilience
      const fallback: PatternData = {
        alert_id: alertId || 'alert-001',
        alert_type: stateAlert?.type || 'High Idle Time',
        equipment_name: stateAlert?.equipment_name || '6120B Tractor',
        occurrence_count: 4,
        occurrence_dates: ['Sep 23', 'Sep 25', 'Sep 27', 'Sep 29'],
        values: [46, 52, 41, 44],
        unit: 'minutes',
        likely_cause: 'Operator waits during turnaround and unloading without turning off engine',
        action_recommendation: 'Turn off engine during 5+ minute waits',
        fuel_savings_estimate: 'Can save up to 10 litres per day (approx ₹870/day)',
        common_operation_type: 'Tillage & Haulage',
        common_field_name: 'Field B',
      };
      setPattern(fallback);
    } finally {
      setLoading(false);
    }
  };

  const formatTitle = (typeStr: string = '') => {
    if (language === 'mr') {
      const mrMap: Record<string, string> = {
        high_idle_time: 'जास्त निष्क्रिय वेळ',
        low_fuel_efficiency: 'कमी इंधन कार्यक्षमता',
        speed_anomaly: 'कामाच्या वेगात बदल',
        gps_boundary: 'GPS सीमा चेतावणी',
      };
      if (mrMap[typeStr]) return mrMap[typeStr];
    }
    const map: Record<string, string> = {
      high_idle_time: 'High Idle Time',
      low_fuel_efficiency: 'Low Fuel Efficiency',
      speed_anomaly: 'Speed Anomaly',
      gps_boundary: 'GPS Boundary Warning',
    };
    return map[typeStr] || typeStr.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatLikelyCause = (cause: string) => {
    if (language === 'mr') {
      if (cause.includes('turnaround') || cause.includes('engine') || cause.includes('unloading')) {
        return 'ऑपरेटर इंजिन बंद न करता वळताना आणि माल उतरवताना वाट पाहतो';
      }
      if (cause.includes('throttle') || cause.includes('speed')) {
        return 'कठीण किंवा खडकाळ जमिनीवर अचानक थ्रॉटल बदलल्यामुळे इंधन जास्त वापरले जाते';
      }
      if (cause.includes('spraying') || cause.includes('route')) {
        return 'फवारणी फेरीत एकाच क्षेत्रावर ओव्हरलॅप झाल्यामुळे वेळ जास्त लागतो';
      }
    }
    return cause;
  };

  const formatActionRecommendation = (action: string) => {
    if (language === 'mr') {
      if (action.includes('Turn off engine') || action.includes('wait')) {
        return '५+ मिनिटांपेक्षा जास्त थांबताना इंजिन बंद करा';
      }
      if (action.includes('speed') || action.includes('steady')) {
        return 'सपाट जमिनीवर प्रवासाचा वेग स्थिर ठेवा';
      }
      if (action.includes('throttle')) {
        return 'चढावर जाताना थ्रॉटल नियंत्रित ठेवा';
      }
    }
    return action;
  };

  const formatFuelSavings = (savings?: string) => {
    if (language === 'mr') {
      return 'दररोज १० लिटरपर्यंत डिझेल बचत शक्य (सुमारे ₹८७०/दिवस)';
    }
    return savings || 'Can save up to 10 litres per day';
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

  const handleCommit = async () => {
    if (!pattern) return;
    try {
      let response: Response;
      try {
        response = await fetch('http://localhost:8000/api/farmer/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert_id: pattern.alert_id,
            action_type: pattern.alert_type,
            action_text: pattern.action_recommendation,
            commitment: 'committed',
            farmer_id: 'demo-farmer-001',
          }),
        });
      } catch {
        response = await fetch('/api/farmer/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert_id: pattern.alert_id,
            action_type: pattern.alert_type,
            action_text: pattern.action_recommendation,
            commitment: 'committed',
            farmer_id: 'demo-farmer-001',
          }),
        });
      }
    } catch {
      // ignore
    }

    const actionPayload = {
      alert_id: pattern.alert_id,
      alert_type: pattern.alert_type,
      equipment_name: pattern.equipment_name,
      action: formatActionRecommendation(pattern.action_recommendation),
      likely_cause: formatLikelyCause(pattern.likely_cause),
      fuel_savings: formatFuelSavings(pattern.fuel_savings_estimate),
      occurrence_count: pattern.occurrence_count,
    };
    navigate('/farmer/recorded', {
      state: {
        alert: pattern,
        action: actionPayload,
      },
    });
  };

  const handleIgnore = async () => {
    if (!pattern) return;
    try {
      try {
        await fetch('http://localhost:8000/api/farmer/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert_id: pattern.alert_id,
            action_type: pattern.alert_type,
            action_text: pattern.action_recommendation,
            commitment: 'ignored',
            farmer_id: 'demo-farmer-001',
          }),
        });
      } catch {
        await fetch('/api/farmer/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert_id: pattern.alert_id,
            action_type: pattern.alert_type,
            action_text: pattern.action_recommendation,
            commitment: 'ignored',
            farmer_id: 'demo-farmer-001',
          }),
        });
      }
    } catch {
      // ignore
    }
    navigate('/farmer/today');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F9FAFB' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="sm" sx={{ py: 3, px: { xs: 2, sm: 3 }, flex: 1, maxWidth: 640 }}>
        {/* Header Section with Back Button */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate('/farmer/today')}
            sx={{
              bgcolor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#374151',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: '#F3F4F6' },
            }}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>

          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#111827', letterSpacing: '-0.3px' }}>
              {formatTitle(pattern?.alert_type || stateAlert?.type || 'High Idle Time')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
              {pattern?.equipment_name || stateAlert?.equipment_name || '6120B Tractor'}
            </Typography>
          </Box>
        </Stack>

        {loading ? (
          <Stack spacing={2.5}>
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />
          </Stack>
        ) : (
          pattern && (
            <Stack spacing={2.5}>
              {/* 1. Pattern Summary Card */}
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid #E5E7EB',
                  bgcolor: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h2"
                  fontWeight={900}
                  sx={{
                    color: '#367C2B',
                    lineHeight: 1,
                    letterSpacing: '-1px',
                    mb: 0.5,
                  }}
                >
                  {pattern.occurrence_count}
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#374151', mb: 2.5 }}>
                  {language === 'mr' ? '७ दिवसांत वेळा' : 'times in 7 days'}
                </Typography>

                {/* Timeline Dots Visualization */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#F9FAFB',
                    borderRadius: 2.5,
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {pattern.occurrence_dates.map((dStr, idx) => (
                      <Box key={idx} sx={{ textAlign: 'center', flex: 1 }}>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: '#367C2B',
                            mx: 'auto',
                            mb: 0.8,
                            boxShadow: '0 0 8px rgba(54, 124, 43, 0.4)',
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#4B5563', fontSize: '0.72rem' }}>
                          {dStr}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>

              {/* 2. Occurrences List Card */}
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  border: '1px solid #E5E7EB',
                  bgcolor: '#FFFFFF',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <TimelineRoundedIcon sx={{ color: '#367C2B', fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#111827' }}>
                    {t('pattern.occurrencesHistory')}
                  </Typography>
                </Stack>

                <Stack spacing={1.5}>
                  {pattern.occurrence_dates.map((dateStr, idx) => {
                    const val = pattern.values[idx] || pattern.values[0];
                    const isToday = idx === pattern.occurrence_dates.length - 1;

                    return (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          px: 2,
                          borderRadius: 2,
                          bgcolor: isToday ? 'rgba(54, 124, 43, 0.05)' : '#F9FAFB',
                          border: '1px solid',
                          borderColor: isToday ? '#C8E6C9' : '#E5E7EB',
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
                              bgcolor: isToday ? '#367C2B' : '#9CA3AF',
                            }}
                          />
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#1F2937' }}>
                            {dateStr}
                            {isToday && (
                              <Chip
                                label={t('pattern.today')}
                                size="small"
                                sx={{
                                  ml: 1,
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  bgcolor: '#E8F5E9',
                                  color: '#2E7D32',
                                }}
                              />
                            )}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" fontWeight={800} sx={{ color: '#111827' }}>
                          {val} {formatUnit(pattern.unit)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>

              {/* 3. Likely Cause (LLM Generated) */}
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  bgcolor: '#FFFDE7',
                  border: '1.5px solid #FFF59D',
                  position: 'relative',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#FFF9C4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#F57F17',
                      flexShrink: 0,
                    }}
                  >
                    <LightbulbOutlinedIcon sx={{ fontSize: 24, color: '#F57F17' }} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#795548' }}>
                        💡 {t('pattern.likelyCause')}
                      </Typography>
                      <Chip
                        icon={<AutoAwesomeRoundedIcon style={{ fontSize: 12, color: '#F57F17' }} />}
                        label={t('pattern.aiAnalysis')}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: '#FFF9C4',
                          color: '#E65100',
                          border: '1px solid #FFE082',
                        }}
                      />
                    </Stack>

                    <Typography variant="body1" fontWeight={700} sx={{ color: '#212121', mb: 0.5 }}>
                      "{formatLikelyCause(pattern.likely_cause)}"
                    </Typography>

                    <Typography variant="caption" sx={{ color: '#616161', fontWeight: 600 }}>
                      {t('pattern.synthesized', { count: pattern.occurrence_count })}
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* 4. Action Recommendation (LLM Generated - Shown Directly) */}
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  bgcolor: '#E8F5E9',
                  border: '1.5px solid #C8E6C9',
                  boxShadow: '0 4px 20px rgba(54, 124, 43, 0.12)',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: '#C8E6C9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ fontSize: 24, color: '#2E7D32' }} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#1B5E20', mb: 0.5 }}>
                      ✓ {t('recommended_action')}
                    </Typography>

                    <Typography variant="body1" fontWeight={800} sx={{ color: '#111827', fontSize: '1.05rem', mb: 0.5 }}>
                      "{formatActionRecommendation(pattern.action_recommendation)}"
                    </Typography>

                    <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                      {formatFuelSavings(pattern.fuel_savings_estimate)}
                    </Typography>
                  </Box>
                </Stack>

                {/* Action Decision Buttons (Direct Commitment) */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleCommit}
                    sx={{
                      py: 1.4,
                      bgcolor: '#367C2B',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '1rem',
                      borderRadius: 2.5,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(54, 124, 43, 0.4)',
                      '&:hover': {
                        bgcolor: '#2D6623',
                        boxShadow: '0 6px 18px rgba(54, 124, 43, 0.5)',
                      },
                    }}
                  >
                    {t('i_will_try')}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={handleIgnore}
                    sx={{
                      py: 1.4,
                      borderColor: '#A5D6A7',
                      color: '#2E7D32',
                      bgcolor: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '1rem',
                      borderRadius: 2.5,
                      textTransform: 'none',
                      borderWidth: '1.5px',
                      '&:hover': {
                        borderColor: '#81C784',
                        bgcolor: '#F1F8E9',
                        borderWidth: '1.5px',
                      },
                    }}
                  >
                    {t('not_now')}
                  </Button>
                </Box>
              </Card>
            </Stack>
          )
        )}
      </Container>
    </Box>
  );
};

export default PatternDetailsPage;
