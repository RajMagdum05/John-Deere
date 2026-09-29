import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AppHeader from '../components/common/AppHeader';

export const PMDashboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {t('pm.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('app.conceptPrototype')} &bull; {t('role.pm')}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.backToHome')}
          </Button>
        </Box>

        {/* Safe Prototype Notice */}
        <Alert
          icon={<InfoOutlinedIcon />}
          severity="info"
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {t('pm.noFakeDataNotice')}
        </Alert>

        {/* Empty State Card */}
        <Card
          sx={{
            py: { xs: 6, md: 10 },
            px: 3,
            textAlign: 'center',
            borderRadius: 3.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardContent sx={{ maxWidth: 580, mx: 'auto' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(217, 138, 0, 0.08)'
                    : 'rgba(255, 181, 71, 0.12)',
                color: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 44 }} />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('pm.title')}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {t('pm.empty')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PMDashboard;
