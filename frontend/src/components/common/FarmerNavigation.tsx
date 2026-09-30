import React from 'react';
import { Tabs, Tab, Container, Paper } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import TableChartIcon from '@mui/icons-material/TableChart';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const FarmerNavigation: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/farmer/today', label: t('nav.today'), icon: <TodayIcon fontSize="small" /> },
    { path: '/farmer/live', label: t('nav.liveDashboard'), icon: <PrecisionManufacturingIcon fontSize="small" /> },
    { path: '/farmer/view-data', label: t('nav.viewData'), icon: <TableChartIcon fontSize="small" /> },
    { path: '/farmer/action-plan', label: t('nav.actionPlan'), icon: <AssignmentTurnedInIcon fontSize="small" /> },
    { path: '/farmer/machines', label: t('nav.machines'), icon: <PrecisionManufacturingIcon fontSize="small" /> },
  ];

  const currentTab = navItems.findIndex((item) => item.path === location.pathname);
  const tabValue = currentTab >= 0 ? currentTab : false;

  const shouldHideNav = location.pathname.includes('/prepare-data');
  if (shouldHideNav) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderRadius: 0,
        mb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Tabs
          value={tabValue}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Farmer navigation"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          {navItems.map((item) => (
            <Tab
              key={item.path}
              component={Link}
              to={item.path}
              label={item.label}
              icon={item.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Container>
    </Paper>
  );
};

export default FarmerNavigation;
