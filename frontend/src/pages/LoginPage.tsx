import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AppHeader from '../components/common/AppHeader';

export const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (role !== 'farmer' && role !== 'pm') {
      navigate('/', { replace: true });
    }
  }, [role, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Exactly 900ms delay for visual simulation
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'farmer') {
        navigate('/farmer/connect');
      } else {
        navigate('/pm/dashboard');
      }
    }, 900);
  };

  const isFarmer = role === 'farmer';
  const pageTitle = isFarmer ? t('login.farmerTitle') : t('login.pmTitle');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <Container maxWidth="sm" sx={{ mt: { xs: 4, md: 8 }, mb: 6, flex: 1 }}>
        <Box mb={3}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.backToHome')}
          </Button>
        </Box>

        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  bgcolor: isFarmer ? 'primary.main' : 'secondary.main',
                  color: isFarmer ? 'primary.contrastText' : 'secondary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                {isFarmer ? <AgricultureIcon /> : <AnalyticsIcon />}
              </Box>

              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                {pageTitle}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {isFarmer ? t('role.farmer') : t('role.pm')} &bull; {t('app.conceptPrototype')}
              </Typography>
            </Box>

            <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              {t('common.demoNotice')}
            </Alert>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="identifier"
                label={t('login.mobileOrEmail')}
                name="identifier"
                autoComplete="email"
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('login.password')}
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color={isFarmer ? 'primary' : 'secondary'}
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LockOutlinedIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                {isLoading ? t('login.signingIn') : t('login.signIn')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
