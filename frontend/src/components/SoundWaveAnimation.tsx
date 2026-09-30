import React from 'react';
import { Box, Typography, Stack, keyframes } from '@mui/material';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import { useLanguage } from '../i18n/LanguageContext';

const ripple = keyframes`
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(0.95);
  }
`;

interface SoundWaveAnimationProps {
  isComplete?: boolean;
  statusText?: string;
  equipmentName?: string;
}

export const SoundWaveAnimation: React.FC<SoundWaveAnimationProps> = ({
  isComplete = false,
  statusText,
  equipmentName = '6120B Tractor',
}) => {
  const { t } = useLanguage();
  const effectiveStatusText = statusText || t('anim.sendingToTractor');
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 5,
        position: 'relative',
      }}
    >
      {/* Concentric Expanding Circles Container */}
      <Box
        sx={{
          position: 'relative',
          width: 140,
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        {!isComplete && (
          <>
            {/* Wave 1 */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2.5px solid #367C2B',
                animation: `${ripple} 2s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
              }}
            />
            {/* Wave 2 */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid #4CAF50',
                animation: `${ripple} 2s cubic-bezier(0, 0.2, 0.8, 1) infinite 0.5s`,
              }}
            />
            {/* Wave 3 */}
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '1.5px solid #81C784',
                animation: `${ripple} 2s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.0s`,
              }}
            />
          </>
        )}

        {/* Center Icon Badge */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: isComplete ? '#2E7D32' : '#367C2B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isComplete
              ? '0 8px 24px rgba(46, 125, 50, 0.4)'
              : '0 8px 24px rgba(54, 124, 43, 0.4)',
            zIndex: 2,
            transition: 'all 0.3s ease',
            animation: !isComplete ? `${pulse} 1.5s ease-in-out infinite` : 'none',
          }}
        >
          {isComplete ? (
            <CheckCircleRoundedIcon sx={{ fontSize: 44, color: '#FFFFFF' }} />
          ) : (
            <VolumeUpRoundedIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
          )}
        </Box>
      </Box>

      {/* Status Messaging */}
      <Stack spacing={0.8} alignItems="center" textAlign="center">
        <Typography variant="h6" fontWeight={800} sx={{ color: isComplete ? '#2E7D32' : '#111827' }}>
          {isComplete ? `✓ ${t('anim.actionRecorded')}` : effectiveStatusText}
        </Typography>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <PrecisionManufacturingRoundedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
          <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
            {isComplete
              ? t('anim.guidanceDispatched', { equipment: equipmentName })
              : t('anim.connectingTerminal', { equipment: equipmentName })}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SoundWaveAnimation;
