import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types/common';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLanguage: Language | null
  ) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  return (
    <ToggleButtonGroup
      value={language}
      exclusive
      onChange={handleLanguageChange}
      size="small"
      aria-label="Language selection"
      sx={{
        height: 32,
        '& .MuiToggleButton-root': {
          px: 1.5,
          py: 0.5,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: '8px !important',
          mx: 0.25,
          border: '1px solid rgba(128, 128, 128, 0.2)',
        },
      }}
    >
      <ToggleButton value="en" aria-label={t('language.english')}>
        English
      </ToggleButton>
      <ToggleButton value="mr" aria-label={t('language.marathi')}>
        मराठी
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default LanguageToggle;
