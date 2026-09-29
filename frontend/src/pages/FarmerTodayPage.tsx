import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  Container,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLanguage } from '../i18n/LanguageContext';
import { farmAlertApi } from '../services/farmAlertApi';
import { Alert as AlertType, TodaySummary } from '../types/farmAlert';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';

export const FarmerTodayPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<TodaySummary | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    setLoading(true);
    try {
      const [summaryData, alertsData] = await Promise.all([
        farmAlertApi.getTodaySummary(),
        farmAlertApi.getAlerts(),
      ]);
      
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAlertType = (type: string): string => {
    const map: Record<string, string> = {
      high_idle_time: t('alert.highIdleTime'),
      low_fuel: t('alert.lowFuel'),
      high_speed_variation: t('alert.highSpeedVariation'),
    };
    return map[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <AppHeader />
        <FarmerNavigation />
        <Container maxWidth="md" sx={{ p: 3, flex: 1 }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Container>
      </Box>
    );
  }

  // Data not ready state
  if (summary && !summary.data_ready) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        <AppHeader />
        <FarmerNavigation />
        <Container maxWidth="md" sx={{ p: 3, flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('nav.today')}
          </Typography>
          <Card sx={{ 
            mt: 3,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {t('dataNotReady.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {t('dataNotReady.description')}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
                onClick={() => navigate('/farmer/connect')}
              >
                {t('dataNotReady.connectDevices')}
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Data ready, no analysis yet
  if (summary && summary.data_ready && !summary.analysis_ready) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        <AppHeader />
        <FarmerNavigation />
        <Container maxWidth="md" sx={{ p: 3, flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('nav.today')}
          </Typography>
          <Card sx={{ 
            mt: 3,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {t('dataReady.title')}
              </Typography>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircleIcon color="success" />
                  <Typography variant="body1">
                    {t('dataReady.machines')}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircleIcon color="success" />
                  <Typography variant="body1">
                    {t('dataReady.days')}
                  </Typography>
                </Stack>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" color="text.secondary">
                {t('dataReady.description')}
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Show alerts
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="md" sx={{ p: 3, flex: 1 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            {t('nav.today')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            September 29, 2026
          </Typography>
        </Stack>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Card sx={{ 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {t('today.noAlerts')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('today.noAlertsDescription')}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2.5}>
            {alerts.map((alert) => {
              // For demo: show "Repeated" badge on high_idle_time alerts
              const hasPattern = alert.type === 'high_idle_time';
              const repeatCount = hasPattern ? 4 : 0;
              
              return (
                <Card 
                  key={alert.id}
                  sx={{ 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Alert Header */}
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <WarningIcon 
                        color="warning" 
                        sx={{ fontSize: 24, mt: 0.5 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {alert.equipment_name}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {formatAlertType(alert.type)}{alert.value ? `: ${alert.value} ${alert.unit}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {/* Repeated Badge */}
                    {hasPattern && (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={`🔁 ${t('alert.repeated')} ${repeatCount} ${t('alert.times')}`}
                          size="small"
                          color="warning"
                          sx={{ 
                            fontWeight: 'bold',
                            height: 28,
                            borderRadius: 1.5,
                          }}
                        />
                      </Box>
                    )}
                    
                    {/* Action Button */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => 
                        navigate(`/farmer/alerts/${alert.id}/pattern`)
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        px: 2.5,
                        py: 0.75
                      }}
                    >
                      {hasPattern ? t('alert.viewPattern') : t('alert.viewDetails')}
                    </Button>
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
