import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export const JDAIBadge: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const location = useLocation();
  const { t, language } = useLanguage();

  // Hide badge on high-focus workflows like data preparation and action plan execution
  const hideRoutes = [
    '/prepare-data',
    '/sync',
    '/farmer/action/',
    '/farmer/alerts/',
    '/role-selection',
  ];

  const currentPath = location.pathname;
  const isHidden = hideRoutes.some((route) => currentPath.includes(route));

  if (isHidden) {
    return null;
  }

  return (
    <>
      {/* Floating Badge */}
      <Tooltip title="JD AI Assistant" placement="left" arrow>
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            width: { xs: 52, sm: 60 },
            height: { xs: 52, sm: 60 },
            borderRadius: '50%',
            bgcolor: '#367C2B',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 6px 20px rgba(54, 124, 43, 0.4)',
            border: '2px solid #FFD100',
            zIndex: 9990,
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            userSelect: 'none',
            '&:hover': {
              bgcolor: '#2E6924',
              transform: 'scale(1.08)',
              boxShadow: '0px 8px 25px rgba(54, 124, 43, 0.55)',
            },
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: { xs: 22, sm: 26 }, color: '#FFD100' }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: '0.62rem', sm: '0.68rem' },
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: 0.5,
              mt: 0.2,
            }}
          >
            JD AI
          </Typography>
        </Box>
      </Tooltip>

      {/* JD AI Announcement Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1,
            boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: 'rgba(54, 124, 43, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#367C2B',
              }}
            >
              <AutoAwesomeIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620' }}>
              {language === 'mr' ? 'JD AI सहाय्यक' : 'JD AI Assistant'}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 2, pt: 1 }}>
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                bgcolor: '#367C2B',
                color: '#FFD100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 24px rgba(54, 124, 43, 0.25)',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620', mb: 0.5 }}>
              {language === 'mr' ? '🎉 JD AI लवकरच येत आहे!' : '🎉 JD AI is coming soon!'}
            </Typography>

            <Chip
              label={language === 'mr' ? 'सप्टेंबर २०२६ मध्ये लाँच' : 'Launched September 2026'}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: 'rgba(255, 209, 0, 0.2)',
                color: '#7B5E00',
                mb: 2,
                fontSize: '0.75rem',
              }}
            />

            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {language === 'mr'
                ? 'शेतकरी आणि उत्पादन व्यवस्थापकांना सर्व शेती कामकाजात बुद्धिमान, डेटा-चालित निर्णय घेण्यास मदत करणारा जॉन डीअरचा नवीन AI सहाय्यक.'
                : "John Deere's new AI assistant to help farmers and product managers make intelligent, data-driven decisions across all field operations."}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setOpen(false)}
            sx={{
              py: 1.25,
              borderRadius: 2.5,
              bgcolor: '#367C2B',
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(54, 124, 43, 0.3)',
              '&:hover': {
                bgcolor: '#2E6924',
              },
            }}
          >
            {language === 'mr' ? 'बंद करा' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JDAIBadge;
