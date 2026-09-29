import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLanguage } from '../../context/LanguageContext';

export const DemoModeChip: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Tooltip title={t('app.simulatedDataTooltip')} arrow>
      <Chip
        icon={<InfoOutlinedIcon sx={{ fontSize: '1rem !important' }} />}
        label={t('app.demoMode')}
        size="small"
        variant="outlined"
        color="secondary"
        aria-label={t('app.demoMode')}
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 2,
          cursor: 'help',
          px: 0.5,
        }}
      />
    </Tooltip>
  );
};

export default DemoModeChip;
