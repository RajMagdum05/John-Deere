import React from 'react';
import {
  Box,
  Slider,
  Button,
  Typography,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useLanguage } from '../i18n/LanguageContext';

interface DayByDayAnimationProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export const DayByDayAnimation: React.FC<DayByDayAnimationProps> = ({
  currentDay,
  onDayChange,
  isPlaying,
  onPlayToggle,
}) => {
  const { t } = useLanguage();

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    onDayChange(newValue as number);
  };

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) =>
          theme.palette.mode === 'light' ? 'background.paper' : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {t('day.dayXofY', [currentDay, 7])}
        </Typography>
        <Chip
          label={isPlaying ? t('day.playing') : t('day.paused')}
          color={isPlaying ? 'primary' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {/* Timeline Slider */}
      <Slider
        value={currentDay}
        onChange={handleSliderChange}
        min={1}
        max={7}
        step={1}
        marks
        valueLabelDisplay="auto"
        sx={{
          mb: 1.5,
          color: 'primary.main',
          '& .MuiSlider-thumb': {
            width: 22,
            height: 22,
          },
        }}
        disabled={isPlaying}
      />

      {/* Day Labels */}
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2.5, px: 0.5 }}>
        {days.map((day) => (
          <Typography
            key={day}
            variant="caption"
            color={day === currentDay ? 'primary.main' : 'text.secondary'}
            fontWeight={day === currentDay ? 700 : 500}
          >
            {t('day.dayX', [day])}
          </Typography>
        ))}
      </Stack>

      {/* Play/Pause Button */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          onClick={onPlayToggle}
          color={isPlaying ? 'warning' : 'primary'}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            py: 0.9,
          }}
        >
          {isPlaying ? t('day.pause') : t('day.playAnimation')}
        </Button>
      </Stack>
    </Paper>
  );
};

export default DayByDayAnimation;
