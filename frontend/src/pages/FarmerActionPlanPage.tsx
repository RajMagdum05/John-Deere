import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useLanguage } from '../i18n/LanguageContext';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { farmActionApi } from '../services/farmActionApi';

export const FarmerActionPlanPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedAction, setGeneratedAction] = useState<string | null>(null);
  const [expectedResult, setExpectedResult] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Action instructions localized for EN and MR
  const actionText =
    language === 'mr'
      ? 'कृपया ५ मिनिटांपेक्षा जास्त वेळ थांबायचे असल्यास इंजिन बंद करा.'
      : 'Please turn off the engine during waits longer than 5 minutes.';

  const expectedImpact =
    language === 'mr'
      ? 'आज ८–१२ लिटर डिझेल वाचवा'
      : 'Save 8-12 litres diesel today';

  const handleGenerateAction = async () => {
    setGenerating(true);
    setGeneratedAction(null);
    setExpectedResult(null);

    try {
      const response = await fetch(`/api/farmer/alerts/${alertId || 'alert-001'}/action`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate action');
      }

      const data = await response.json();
      setGeneratedAction(data.action);
      setExpectedResult(data.expected_result);
    } catch (error) {
      console.error('Failed to generate action:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate action recommendation',
        severity: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleWillTry = async () => {
    setSubmitting(true);
    try {
      await farmActionApi.recordAction({
        alert_id: alertId || 'alert-1',
        action_type: 'reduce_idle_time',
        action_text: generatedAction || actionText,
        expected_impact: expectedResult || expectedImpact,
      });

      setSnackbar({
        open: true,
        message: t('action.recorded'),
        severity: 'success',
      });

      setTimeout(() => {
        if (alertId) {
          navigate(`/farmer/alerts/${alertId}/recorded`);
        } else {
          navigate('/farmer/today');
        }
      }, 1000);
    } catch {
      setSnackbar({
        open: true,
        message: t('action.error'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotRelevant = async () => {
    setSubmitting(true);
    try {
      await farmActionApi.recordAction({
        alert_id: alertId || 'alert-1',
        action_type: 'not_relevant',
        action_text: '',
        expected_impact: '',
      });

      setSnackbar({
        open: true,
        message: t('action.notRelevantRecorded'),
        severity: 'success',
      });

      setTimeout(() => {
        navigate('/farmer/today');
      }, 1000);
    } catch {
      setSnackbar({
        open: true,
        message: t('action.error'),
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="md" sx={{ py: 3.5, px: { xs: 2, sm: 3 }, flex: 1 }}>
        {/* Title */}
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.02em', color: 'text.primary' }}>
          {t('action.whatToDo')}
        </Typography>

        {/* Generate Action Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleGenerateAction}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : null}
            sx={{
              py: 1.5,
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 2.5,
              textTransform: 'none',
              bgcolor: '#36B54A',
              '&:hover': {
                bgcolor: '#2e9e3f',
              },
            }}
          >
            {generating ? t('action.generating') : t('action.generateAction')}
          </Button>
        </Box>

        {/* Skeleton while generating */}
        {generating && (
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" width={150} height={20} />
            </CardContent>
          </Card>
        )}

        {/* Show Generated Action */}
        {generatedAction && (
          <Card
            sx={{
              mb: 3,
              bgcolor: 'background.paper',
              border: '1.5px solid',
              borderColor: '#36B54A',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(54, 181, 74, 0.15)',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'text.primary' }}>
                {t('action.recommendedAction')}
              </Typography>

              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {generatedAction}
              </Typography>

              {expectedResult && (
                <Box sx={{ p: 2, bgcolor: 'rgba(54, 181, 74, 0.1)', borderRadius: 1.5, mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: '#2e9e3f' }}>
                    {t('action.expectedResult')}: {expectedResult}
                  </Typography>
                </Box>
              )}

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleWillTry}
                  disabled={submitting}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  {t('action.saveAction')}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => {
                    setGeneratedAction(null);
                    setExpectedResult(null);
                  }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  {t('action.dismiss')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Action Card */}
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Instruction Header */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {t('action.tellOperator')}
            </Typography>

            {/* Quoted Box */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                bgcolor: 'background.default',
                borderRadius: 2.5,
                mb: 3.5,
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
              }}
            >
              <FormatQuoteRoundedIcon
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 14,
                  fontSize: 34,
                  color: 'action.disabled',
                  opacity: 0.4,
                }}
              />
              <Typography
                variant="body1"
                fontStyle="italic"
                sx={{
                  fontSize: '1.08rem',
                  lineHeight: 1.65,
                  fontWeight: 500,
                  color: 'text.primary',
                  pr: 3,
                }}
              >
                "{actionText}"
              </Typography>
            </Box>

            {/* Expected Result */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {t('action.expectedResult')}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
              <CheckCircleOutlineRoundedIcon sx={{ color: 'success.main', fontSize: 22 }} />
              <Typography variant="body1" sx={{ fontSize: '1.02rem', fontWeight: 600, color: 'text.secondary' }}>
                {expectedImpact}
              </Typography>
            </Stack>

            {/* Action Buttons */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleWillTry}
                disabled={submitting}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.6,
                  fontSize: '1.02rem',
                  bgcolor: '#36B54A',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(54, 181, 74, 0.3)',
                  '&:hover': {
                    bgcolor: '#2e9e3f',
                    boxShadow: '0 4px 16px rgba(54, 181, 74, 0.4)',
                  },
                }}
              >
                {t('action.willTry')}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleNotRelevant}
                disabled={submitting}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  py: 1.5,
                  fontSize: '1rem',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'text.primary',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {t('action.notRelevant')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Snackbar Feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              borderRadius: 2.5,
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default FarmerActionPlanPage;
