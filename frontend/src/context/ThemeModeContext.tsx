import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, Theme } from '@mui/material';
import { ThemeMode } from '../types/common';

interface ThemeModeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  theme: Theme;
}

const STORAGE_KEY = 'farm_action_loop_theme';

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const ThemeModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
    } catch {
      // Fallback on error
    }
    return 'light';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const theme = useMemo(() => {
    if (mode === 'dark') {
      return createTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: '#8BCB78',
            contrastText: '#121712',
          },
          secondary: {
            main: '#FFB547',
            contrastText: '#121712',
          },
          error: {
            main: '#FF8A80',
          },
          background: {
            default: '#121712',
            paper: '#1C241C',
          },
          text: {
            primary: '#F4F7F1',
            secondary: '#B8C4B6',
          },
        },
        shape: {
          borderRadius: 14,
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Noto Sans"',
            'sans-serif',
          ].join(','),
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: '#1C241C',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      });
    }

    return createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#2F6B3B',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#D98A00',
          contrastText: '#FFFFFF',
        },
        error: {
          main: '#C62828',
        },
        background: {
          default: '#F7F9F5',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#1B1F1B',
          secondary: '#5E665E',
        },
      },
      shape: {
        borderRadius: 14,
      },
      typography: {
        fontFamily: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans"',
          'sans-serif',
        ].join(','),
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggleMode, theme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = (): ThemeModeContextType => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
