import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 3000,
}) => {
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  useEffect(() => {
    // 1. Trigger initial fade in immediately on mount
    const mountTimer = setTimeout(() => {
      setFadeIn(true);
    }, 50);

    // 2. Trigger fade out 500ms before completion
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, Math.max(durationMs - 500, 500));

    // 3. Call onComplete callback when total duration finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete]);

  return (
    <Box
      onClick={onComplete}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: '#F3F4F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: { xs: 6, sm: 8 },
        px: 3,
        zIndex: 9999,
        opacity: fadeOut ? 0 : fadeIn ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Top spacing */}
      <Box sx={{ height: 40 }} />

      {/* Center Section: Anubhuti App Icon & Hindi Tagline */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: fadeIn && !fadeOut ? 'scale(1)' : 'scale(0.96)',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Anubhuti Rounded Square Green Icon */}
        <Box
          sx={{
            width: { xs: 150, sm: 165 },
            height: { xs: 150, sm: 165 },
            bgcolor: '#367C2B',
            borderRadius: { xs: 4.5, sm: 5 },
            boxShadow: '0 12px 32px rgba(54, 124, 43, 0.28)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.5,
            mb: 2.5,
          }}
        >
          {/* Yellow Circular Border with Handshake Icon */}
          <Box
            sx={{
              width: { xs: 78, sm: 86 },
              height: { xs: 78, sm: 86 },
              borderRadius: '50%',
              border: '4.5px solid #FFD100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#367C2B',
              mb: 1.25,
            }}
          >
            <HandshakeIcon
              sx={{
                color: '#FFFFFF',
                fontSize: { xs: 44, sm: 48 },
              }}
            />
          </Box>

          {/* ANUBHUTI Text */}
          <Typography
            sx={{
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: { xs: '1.05rem', sm: '1.18rem' },
              letterSpacing: 2,
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              textTransform: 'uppercase',
            }}
          >
            ANUBHUTI
          </Typography>
        </Box>

        {/* Hindi Tagline */}
        <Typography
          sx={{
            color: '#367C2B',
            fontWeight: 800,
            fontSize: { xs: '1.25rem', sm: '1.45rem' },
            letterSpacing: 0.5,
            textAlign: 'center',
            fontFamily: '"Noto Sans Devanagari", "Mukta", "Roboto", sans-serif',
            mt: 0.5,
          }}
        >
          कल की शुरूआत, अभी
        </Typography>
      </Box>

      {/* Bottom Section: Official John Deere Logo & Wordmark */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1.25}
        sx={{
          pb: { xs: 2, sm: 3 },
          opacity: 0.95,
        }}
      >
        <Box
          component="img"
          src="/logo/john-deere-logo.png"
          alt="John Deere"
          sx={{
            height: { xs: 26, sm: 30 },
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <Typography
          sx={{
            fontWeight: 900,
            color: '#367C2B',
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            letterSpacing: 2,
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
          }}
        >
          JOHN DEERE
        </Typography>
      </Stack>
    </Box>
  );
};

export default SplashScreen;
