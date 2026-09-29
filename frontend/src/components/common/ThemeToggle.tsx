import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../../context/ThemeModeContext';
import { useLanguage } from '../../context/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleMode } = useThemeMode();
  const { t } = useLanguage();

  const tooltipTitle = mode === 'light' ? t('theme.switchToDark') : t('theme.switchToLight');

  return (
    <Tooltip title={tooltipTitle} arrow>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        size="small"
        aria-label={tooltipTitle}
        sx={{
          border: '1px solid rgba(128, 128, 128, 0.2)',
          borderRadius: 2,
          p: 0.75,
        }}
      >
        {mode === 'light' ? (
          <DarkModeIcon fontSize="small" sx={{ color: 'text.primary' }} />
        ) : (
          <LightModeIcon fontSize="small" sx={{ color: 'secondary.main' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
