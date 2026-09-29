import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AppHeader from '../components/common/AppHeader';

export const RoleSelectionPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <Container maxWidth="md" sx={{ mt: { xs: 4, md: 8 }, mb: 6, flex: 1 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              borderRadius: 3,
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(47, 107, 59, 0.08)'
                  : 'rgba(139, 203, 120, 0.12)',
              color: 'primary.main',
              mb: 2.5,
            }}
          >
            <ScienceOutlinedIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
              {t('app.conceptPrototype')}
            </Typography>
          </Box>

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2,
            }}
          >
            {t('app.name')}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {t('app.tagline')}
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              mt: 3,
              mb: 1,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
            }}
          >
            {t('role.chooseTitle')}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            {t('role.chooseSubtitle')}
          </Typography>
        </Box>

        {/* Role Cards */}
        <Grid container spacing={4} justifyContent="center">
          {/* Farmer Role Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 12px 30px rgba(0,0,0,0.08)'
                      : '0 12px 30px rgba(0,0,0,0.5)',
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 3.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(47, 107, 59, 0.1)'
                        : 'rgba(139, 203, 120, 0.15)',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <AgricultureIcon sx={{ fontSize: 40 }} />
                </Box>

                <Chip
                  label={t('app.conceptPrototype')}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1.5, fontSize: '0.7rem' }}
                />

                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  {t('role.farmer')}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4, flex: 1, lineHeight: 1.6 }}
                >
                  {t('role.farmerDescription')}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  component={Link}
                  to="/login/farmer"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  {t('role.selectFarmer')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Product Manager Role Card */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 12px 30px rgba(0,0,0,0.08)'
                      : '0 12px 30px rgba(0,0,0,0.5)',
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 3.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light'
                        ? 'rgba(217, 138, 0, 0.1)'
                        : 'rgba(255, 181, 71, 0.15)',
                    color: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2.5,
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 40 }} />
                </Box>

                <Chip
                  label={t('app.conceptPrototype')}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1.5, fontSize: '0.7rem' }}
                />

                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  {t('role.pm')}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 4, flex: 1, lineHeight: 1.6 }}
                >
                  {t('role.pmDescription')}
                </Typography>

                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                  component={Link}
                  to="/login/pm"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  {t('role.selectPM')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RoleSelectionPage;
