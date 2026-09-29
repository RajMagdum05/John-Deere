import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import { useLanguage } from '../context/LanguageContext';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { farmActionApi } from '../services/farmActionApi';

export const FarmerActionPlanPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [loading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Demo action data (in production, load from API)
  const action = {
    action_type: 'reduce_idle_time',
    action_text: 'Please turn off the engine during waits longer than 5 minutes.',
    expected_impact: 'Save 8-12 litres diesel today',
  };

  const handleWillTry = async () => {
    setSubmitting(true);
    try {
      await farmActionApi.recordAction({
        alert_id: alertId || 'alert-1',
        action_type: action.action_type,
        action_text: action.action_text,
        expected_impact: action.expected_impact,
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

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <AppHeader />
        <FarmerNavigation />
        <Container maxWidth="md" sx={{ p: 3, flex: 1 }}>
          <LinearProgress />
        </Container>
      </Box>
    );
  }

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
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          {t('action.whatToDo')}
        </Typography>

        {/* Action Card */}
        <Card sx={{ 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Instruction */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
              {t('action.tellOperator')}
            </Typography>
            
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2,
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography 
                variant="body1" 
                fontStyle="italic"
                sx={{ 
                  fontSize: '1.05rem',
                  lineHeight: 1.6
                }}
              >
                "{action.action_text}"
              </Typography>
            </Box>
            
            {/* Expected Result */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
              {t('action.expectedResult')}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              paragraph 
              sx={{ 
                mb: 3,
                fontSize: '1rem'
              }}
            >
              {action.expected_impact}
            </Typography>
            
            {/* Action Buttons */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleWillTry}
                disabled={submitting}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                {t('action.notRelevant')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              fontWeight: 'bold'
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
