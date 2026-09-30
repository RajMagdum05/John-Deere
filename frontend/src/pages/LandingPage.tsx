import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import {
  Agriculture as AgricultureIcon,
  Insights as InsightsIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/common/AppHeader';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAF9' }}>
      <AppHeader />

      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Header with John Deere Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
          <Box
            component="img"
            src="/logo/john-deere-logo.png"
            alt="John Deere"
            sx={{
              width: { xs: 120, sm: 140 },
              height: 'auto',
              maxHeight: 120,
              objectFit: 'contain',
              mb: 2,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
            }}
          />

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              color: '#1E4620',
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              letterSpacing: -0.5,
              mb: 1,
            }}
          >
            {t('splash_welcome')}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.2rem' },
            }}
          >
            {t('select_role')}
          </Typography>
        </Box>

        {/* Two Cards: Farmer and Product Manager */}
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {/* Card 1: Farmer */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                border: '1px solid #E0E0E0',
                transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 16px 40px rgba(54, 124, 43, 0.15)',
                  borderColor: '#367C2B',
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3.5, sm: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3.5,
                    bgcolor: 'rgba(54, 124, 43, 0.1)',
                    color: '#367C2B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <AgricultureIcon sx={{ fontSize: 52 }} />
                </Box>

                <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#1E4620', mb: 1 }}>
                  {t('im_farmer')}
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, flex: 1, lineHeight: 1.6 }}>
                  {t('farmer_desc')}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/login/farmer')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.75,
                    borderRadius: 2.5,
                    bgcolor: '#367C2B',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(54, 124, 43, 0.35)',
                    '&:hover': {
                      bgcolor: '#2E6924',
                      boxShadow: '0 6px 20px rgba(54, 124, 43, 0.45)',
                    },
                  }}
                >
                  {t('continue_farmer')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Product Manager */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                border: '1px solid #E0E0E0',
                transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 16px 40px rgba(54, 124, 43, 0.15)',
                  borderColor: '#367C2B',
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3.5, sm: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 3.5,
                    bgcolor: 'rgba(54, 124, 43, 0.1)',
                    color: '#367C2B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <InsightsIcon sx={{ fontSize: 52 }} />
                </Box>

                <Typography variant="h5" component="h2" sx={{ fontWeight: 800, color: '#1E4620', mb: 1 }}>
                  {t('im_pm')}
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, flex: 1, lineHeight: 1.6 }}>
                  {t('pm_desc')}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/pm/dashboard')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.75,
                    borderRadius: 2.5,
                    bgcolor: '#367C2B',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(54, 124, 43, 0.35)',
                    '&:hover': {
                      bgcolor: '#2E6924',
                      boxShadow: '0 6px 20px rgba(54, 124, 43, 0.45)',
                    },
                  }}
                >
                  {t('continue_pm')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
