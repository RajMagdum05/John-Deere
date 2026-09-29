import React from 'react';
import { Box, Typography, Container, IconButton, Tooltip } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import DemoModeChip from './DemoModeChip';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

export const AppHeader: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Box
      component="header"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 1.5,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? '0 1px 3px rgba(0,0,0,0.05)'
            : '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {/* Left branding */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <AgricultureIcon />
          </Box>

          <Box>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                lineHeight: 1.2,
                color: 'text.primary',
              }}
            >
              {t('app.name')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: { xs: 'none', md: 'block' },
                fontSize: '0.75rem',
              }}
            >
              {t('app.tagline')}
            </Typography>
          </Box>

          <DemoModeChip />
        </Box>

        {/* Right controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {!isHomePage && (
            <Tooltip title={t('common.home')} arrow>
              <IconButton
                component={Link}
                to="/"
                color="inherit"
                size="small"
                aria-label={t('common.backToHome')}
                sx={{
                  border: '1px solid rgba(128, 128, 128, 0.2)',
                  borderRadius: 2,
                  p: 0.75,
                }}
              >
                <HomeOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <LanguageToggle />
          <ThemeToggle />
        </Box>
      </Container>
    </Box>
  );
};

export default AppHeader;
