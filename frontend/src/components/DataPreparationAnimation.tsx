import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Fade,
} from '@mui/material';
import { useLanguage } from '../i18n/LanguageContext';

export interface DataPreparationAnimationProps {
  onComplete?: () => void;
  duration?: number; // default 4000ms
  open?: boolean;
}

export const DataPreparationAnimation: React.FC<DataPreparationAnimationProps> = ({
  onComplete,
  duration = 4000,
  open = true,
}) => {
  const { t } = useLanguage();
  const [stage, setStage] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(open);

  const messages = [
    t('prep.fetchingData'),
    t('prep.analyzingPatterns'),
    t('prep.almostDone'),
  ];

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setStage(0);

    const stage1Timer = setTimeout(() => {
      setStage(1);
    }, 1500);

    const stage2Timer = setTimeout(() => {
      setStage(2);
    }, 3000);

    const completeTimer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
      clearTimeout(completeTimer);
    };
  }, [open, duration, onComplete]);

  if (!visible) return null;

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          backdropFilter: 'blur(4px)',
        }}
      >
        <CircularProgress
          size={72}
          thickness={4}
          sx={{
            color: '#367C2B',
            mb: 3.5,
            filter: 'drop-shadow(0 4px 12px rgba(54, 124, 43, 0.25))',
          }}
        />

        <Fade key={stage} in={true} timeout={400}>
          <Typography
            variant="h5"
            fontWeight={800}
            color="text.primary"
            sx={{
              textAlign: 'center',
              letterSpacing: '-0.3px',
              maxWidth: 480,
            }}
          >
            {messages[stage]}
          </Typography>
        </Fade>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1.5, textAlign: 'center', fontWeight: 500 }}
        >
          {t('prep.telemetrySubtitle')}
        </Typography>
      </Box>
    </Fade>
  );
};

export default DataPreparationAnimation;

