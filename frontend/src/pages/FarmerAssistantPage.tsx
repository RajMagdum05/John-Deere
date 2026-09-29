import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useLanguage } from '../context/LanguageContext';
import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';

export const FarmerAssistantPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="lg" sx={{ mb: 6, flex: 1 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {t('farmer.assistantTitle')}
          </Typography>
        </Box>

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
          <CardContent sx={{ maxWidth: 540, mx: 'auto' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(47, 107, 59, 0.08)'
                    : 'rgba(139, 203, 120, 0.12)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 44 }} />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('farmer.assistantTitle')}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {t('farmer.assistantEmpty')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default FarmerAssistantPage;
