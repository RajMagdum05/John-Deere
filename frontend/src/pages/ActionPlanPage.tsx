import React, { useState } from 'react';
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
  Fade,
  CircularProgress,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EnergySavingsLeafRoundedIcon from '@mui/icons-material/EnergySavingsLeafRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';

import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import SoundWaveAnimation from '../components/SoundWaveAnimation';
import { playNotificationSound } from '../utils/soundUtil';
import { useLanguage } from '../i18n/LanguageContext';
import { buildApiUrl } from '../services/apiConfig';

export const ActionPlanPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const stateData = location.state as any;
  const alert = stateData?.alert;
  const passedAction = stateData?.action;

  const targetAlertId = alertId || alert?.id || alert?.alert_id || 'alert-001';
  const equipmentName = alert?.equipment_name || '6120B Tractor';
  const actionText =
    typeof passedAction === 'string'
      ? passedAction
      : passedAction?.action || alert?.action_recommendation || 'Turn off engine during 5+ minute waits';
  const impactText =
    passedAction?.fuel_savings || alert?.fuel_savings_estimate || 'Can save up to 10 litres per day';
  const occurrenceCount = alert?.occurrence_count || 4;
  const alertType = alert?.alert_type || alert?.type || 'High Idle Time';

  const [committing, setCommitting] = useState<boolean>(false);
  const [commitComplete, setCommitComplete] = useState<boolean>(false);

  const handleCommitAction = async () => {
    setCommitting(true);
    playNotificationSound();

    try {
      // POST to backend
      const payload = {
        alert_id: targetAlertId,
        action_type: 'reduce_idle_time',
        action_text: actionText,
        commitment: 'committed',
        timestamp: new Date().toISOString(),
      };

      try {
        await fetch(buildApiUrl('/api/farmer/actions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        await fetch('/api/farmer/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (e) {
      console.debug('Recorded locally:', e);
    }

    // Sound wave animation completes after 2 seconds
    setTimeout(() => {
      setCommitComplete(true);

      // Navigate to /farmer/recorded after confirmation
      setTimeout(() => {
        navigate('/farmer/recorded', {
          state: {
            action_id: `action-${targetAlertId.replace('alert-', '')}`,
            alert: {
              ...alert,
              id: targetAlertId,
              equipment_name: equipmentName,
              alert_type: alertType,
            },
            action: {
              action_text: actionText,
              fuel_savings: impactText,
              status: 'committed',
            },
          },
        });
      }, 1000);
    }, 2000);
  };

  const handleIgnoreAction = async () => {
    try {
      const payload = {
        alert_id: targetAlertId,
        action_type: 'reduce_idle_time',
        action_text: actionText,
        commitment: 'ignored',
        timestamp: new Date().toISOString(),
      };

      try {
        await fetch(buildApiUrl('/api/farmer/actions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        await fetch('/api/farmer/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (e) {
      console.debug('Ignore logged:', e);
    }

    navigate('/farmer/today');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F9FAFB' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container
        maxWidth="sm"
        sx={{
          py: 3.5,
          px: { xs: 2, sm: 3 },
          flex: 1,
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Header Back Button */}
        {!committing && (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <IconButton
              onClick={() => navigate(-1)}
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
                {language === 'mr' ? 'कृती शिफारस' : 'Action Recommendation'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                {equipmentName}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* Sound Wave Animation View when committing */}
        {committing ? (
          <Card
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3.5,
              border: '1px solid #C8E6C9',
              bgcolor: '#FFFFFF',
              boxShadow: '0 12px 36px rgba(54, 124, 43, 0.12)',
              textAlign: 'center',
            }}
          >
            <SoundWaveAnimation
              isComplete={commitComplete}
              statusText={language === 'mr' ? 'ट्रॅक्टरला सूचना पाठवत आहे...' : 'Sending notification to tractor...'}
              equipmentName={equipmentName}
            />
          </Card>
        ) : (
          /* Main Action Card & Buttons */
          <Fade in={true} timeout={300}>
            <Stack spacing={3}>
              {/* Recommended Action Card */}
              <Card
                elevation={3}
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3.5,
                  border: '1.5px solid #C8E6C9',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 8px 28px rgba(54, 124, 43, 0.08)',
                }}
              >
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  {/* Top Badge */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        bgcolor: '#E8F5E9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2E7D32',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleRoundedIcon sx={{ fontSize: 26, color: '#2E7D32' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#1B5E20' }}>
                        ✓ {t('recommended_action')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
                        {language === 'mr' ? 'जॉन डीअर इन-कॅब ऑपरेटर मार्गदर्शन' : 'John Deere In-Cab Operator Guidance'}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Main Action Text */}
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      color: '#111827',
                      lineHeight: 1.35,
                      letterSpacing: '-0.3px',
                      mb: 2.5,
                    }}
                  >
                    "{actionText}"
                  </Typography>

                  {/* Impact & Context Box */}
                  <Box
                    sx={{
                      p: 2.2,
                      bgcolor: '#F8FAF8',
                      border: '1px solid #E5E7EB',
                      borderRadius: 2.5,
                    }}
                  >
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EnergySavingsLeafRoundedIcon sx={{ color: '#2E7D32', fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={800} sx={{ color: '#2E7D32' }}>
                          {impactText}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <PrecisionManufacturingRoundedIcon sx={{ color: '#6B7280', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: 600 }}>
                          {language === 'mr'
                            ? `${alertType} च्या ${occurrenceCount} घटनांवर आधारित`
                            : `Based on ${occurrenceCount} occurrences of ${alertType}`}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Stack spacing={1.8}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCommitAction}
                  sx={{
                    py: 1.6,
                    bgcolor: '#367C2B',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    borderRadius: 2.5,
                    textTransform: 'none',
                    letterSpacing: '0.2px',
                    boxShadow: '0 6px 20px rgba(54, 124, 43, 0.4)',
                    '&:hover': {
                      bgcolor: '#2D6623',
                      boxShadow: '0 8px 24px rgba(54, 124, 43, 0.5)',
                    },
                  }}
                >
                  {t('i_will_try')}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleIgnoreAction}
                  sx={{
                    py: 1.4,
                    color: '#6B7280',
                    borderColor: '#D1D5DB',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    borderRadius: 2.5,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      bgcolor: 'rgba(0,0,0,0.03)',
                    },
                  }}
                >
                  {t('not_now')}
                </Button>
              </Stack>
            </Stack>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default ActionPlanPage;
