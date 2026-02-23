import { ConfigProvider, theme as antdTheme } from 'antd';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type ThemePreference = 'system' | ThemeMode;

type ThemeContextValue = {
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

const STORAGE_KEY = 'uni-portal-theme';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [systemMode, setSystemMode] = useState<ThemeMode>(getSystemMode);
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemePreference | null;

    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setPreferenceState(stored);
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', listener);

    return () => {
      media.removeEventListener('change', listener);
    };
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, pref);
    }
  };

  const mode: ThemeMode = preference === 'system' ? systemMode : preference;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.dataset.theme = mode;
  }, [mode]);

  const themeConfig = useMemo(
    () => ({
      token: {
        colorPrimary: '#0f6ad8',
        colorInfo: '#0f6ad8',
        borderRadius: 8,
        fontFamily: '-apple-system, BlinkMacSystemFont, \"SF Pro Text\", system-ui, \"Segoe UI\", sans-serif',
        colorBgLayout: mode === 'dark' ? '#020617' : '#f5f5f5',
      },
      components: {
        Layout: {
          headerBg: mode === 'dark' ? '#020617' : '#ffffff',
          siderBg: mode === 'dark' ? '#020617' : '#ffffff',
          bodyBg: mode === 'dark' ? '#020617' : '#f5f5f5',
        },
        Menu: {
          itemColor: mode === 'dark' ? '#cbd5f5' : '#111827',
          itemHoverColor: mode === 'dark' ? '#e5e7eb' : '#1f2933',
          itemSelectedColor: mode === 'dark' ? '#eff6ff' : '#0f172a',
          itemSelectedBg: mode === 'dark' ? '#1d4ed8' : '#e0edff',
          itemBorderRadius: 6,
        },
        Button: {
          controlHeight: 40,
          fontWeight: 500,
        },
        Card: {
          borderRadiusLG: 16,
        },
      },
      algorithm:
        mode === 'dark'
          ? [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm]
          : [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
    }),
    [mode],
  );

  const value = useMemo(
    () => ({
      mode,
      preference,
      setPreference,
    }),
    [mode, preference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }

  return context;
};

export default ThemeProvider;
