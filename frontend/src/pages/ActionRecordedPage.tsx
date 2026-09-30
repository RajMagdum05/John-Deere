import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useLanguage } from '../i18n/LanguageContext';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';

export const ActionRecordedPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const youWillTryText =
    language === 'mr'
      ? '६१२०बी ट्रॅक्टरवर निष्क्रिय वेळ कमी करा'
      : 'Reduce idle time on 6120B';

  const nextStepText =
    language === 'mr'
      ? 'आणखी एक नांगरणीचे काम पूर्ण करा'
      : 'Complete one more tillage job';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="md" sx={{ py: 3.5, px: { xs: 2, sm: 3 }, flex: 1 }}>
        {/* Success Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 34, color: 'success.main' }} />
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', color: 'text.primary' }}>
            {t('actionRecorded.title')}
          </Typography>
        </Stack>

        {/* Confirmation Card */}
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Section 1: You Will Try */}
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
              {t('actionRecorded.youWillTry')}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mb: 3, fontSize: '1.2rem' }}>
              {youWillTryText}
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            {/* Section 2: Next Step */}
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
              {t('actionRecorded.nextStep')}
            </Typography>
            <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 3, fontSize: '1.05rem' }}>
              {nextStepText}
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            {/* Section 3: We Will Show You */}
            <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
              {t('actionRecorded.weWillShow')}
            </Typography>
            <List sx={{ p: 0, mb: 4 }}>
              <ListItem sx={{ py: 0.75, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 26 }}>
                  <CircleIcon sx={{ fontSize: 8, color: '#36B54A' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1rem', color: 'text.primary' }}>
                      {t('actionRecorded.idleComparison')}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem sx={{ py: 0.75, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 26 }}>
                  <CircleIcon sx={{ fontSize: 8, color: '#36B54A' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1rem', color: 'text.primary' }}>
                      {t('actionRecorded.dieselSaved')}
                    </Typography>
                  }
                />
              </ListItem>
            </List>

            {/* Actions Stack: OK & Demo Result */}
            <Stack spacing={2}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/farmer/today')}
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
                {t('actionRecorded.ok')}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                size="medium"
                onClick={() => navigate('/farmer/alerts/demo-alert/before-after')}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                  fontSize: '0.95rem',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {language === 'mr' ? '📊 निकालाचे प्रात्यक्षिक पहा (डेमो)' : '📊 View Before/After Proof (Demo)'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ActionRecordedPage;
