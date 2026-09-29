import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Stack,
  Divider,
  Chip,
  Container,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CircleIcon from '@mui/icons-material/Circle';
import { useLanguage } from '../i18n/LanguageContext';
import { Pattern } from '../types/farmPattern';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';

export const PatternDetailsPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [pattern, setPattern] = useState<Pattern | null>(null);

  useEffect(() => {
    loadPattern();
  }, [alertId]);

  const loadPattern = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/farmer/alerts/${alertId}/pattern`);
      
      if (!response.ok) {
        // Demo fallback data
        const demoPattern: Pattern = {
          id: 'pattern-001',
          alert_id: alertId || 'alert-1',
          alert_type: t('alert.highIdleTime'),
          equipment_id: 'equip-6120b',
          equipment_name: '6120B Tractor',
          occurrence_count: 4,
          occurrence_dates: ['Sep 23', 'Sep 25', 'Sep 27', 'Sep 29'],
          values: [46, 52, 38, 44],
          unit: t('action.litres') === 'litres' ? 'min' : 'मि',
          common_operation_type: 'Tillage',
          common_field_name: 'Field B',
          likely_cause: 'Operator waits during turnaround without turning off engine',
          confidence: 'high',
        };
        setPattern(demoPattern);
        return;
      }
      
      const data = await response.json();
      setPattern(data);
    } catch (error) {
      console.error('Failed to load pattern:', error);
      const demoPattern: Pattern = {
        id: 'pattern-001',
        alert_id: alertId || 'alert-1',
        alert_type: t('alert.highIdleTime'),
        equipment_id: 'equip-6120b',
        equipment_name: '6120B Tractor',
        occurrence_count: 4,
        occurrence_dates: ['Sep 23', 'Sep 25', 'Sep 27', 'Sep 29'],
        values: [46, 52, 38, 44],
        unit: 'min',
        common_operation_type: 'Tillage',
        common_field_name: 'Field B',
        likely_cause: 'Operator waits during turnaround without turning off engine',
        confidence: 'high',
      };
      setPattern(demoPattern);
    } finally {
      setLoading(false);
    }
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

  if (!pattern) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <AppHeader />
        <FarmerNavigation />
        <Container maxWidth="md" sx={{ p: 3, flex: 1 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 'bold' }}>{t('pattern.notFound')}</AlertTitle>
            {t('pattern.notFoundDescription')}
          </Alert>
          <Button
            variant="contained"
            sx={{ 
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              py: 1.5,
            }}
            onClick={() => navigate('/farmer/today')}
          >
            {t('nav.today')}
          </Button>
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
          {t('nav.patternDetails')}
        </Typography>

        {/* Alert Banner */}
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            fontWeight: 'bold',
            border: '1px solid',
            borderColor: 'warning.light',
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold', fontSize: '1.05rem', mb: 0 }}>
            {t('pattern.repeatedPattern')}
          </AlertTitle>
        </Alert>

        {/* Pattern Details Card */}
        <Card sx={{ 
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {/* What's happening */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
              {t('pattern.whatsHappening')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, fontSize: '1rem', lineHeight: 1.6 }}>
              <strong>{pattern.equipment_name}</strong> {t('pattern.had')} <strong>{pattern.alert_type}</strong>
              <br />
              {pattern.occurrence_count} {t('pattern.timesIn7Days')}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* When it happens */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
              {t('pattern.whenItHappens')}
            </Typography>
            <List sx={{ mb: 3 }}>
              {pattern.occurrence_dates.map((date, index) => (
                <ListItem key={date} sx={{ py: 0.75, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CircleIcon sx={{ fontSize: 8, color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
                        <strong>{date}</strong>: {pattern.values?.[index]} {pattern.unit}
                        {pattern.common_operation_type && ` (${pattern.common_operation_type})`}
                        {index === pattern.occurrence_dates.length - 1 && (
                          <Chip
                            label={t('pattern.now')}
                            size="small"
                            color="warning"
                            sx={{ ml: 1, height: 20, fontWeight: 'bold', fontSize: '0.75rem' }}
                          />
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            {/* Likely reason */}
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
              {t('pattern.likelyReason')}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, fontSize: '1rem', lineHeight: 1.6 }}>
              {pattern.likely_cause}
            </Typography>

            {/* Confidence badge */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={`${t('pattern.confidence')}: ${t(pattern.confidence === 'high' ? 'action.confidenceHigh' : pattern.confidence === 'medium' ? 'action.confidenceMedium' : 'action.confidenceLow')}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>

            {/* Action button */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={() => navigate(`/farmer/action-plan`)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1.5,
                fontSize: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              {t('pattern.whatShouldIDo')}
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PatternDetailsPage;
