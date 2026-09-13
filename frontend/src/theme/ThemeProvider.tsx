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
        colorBgContainer: mode === 'dark' ? '#0f172a' : '#ffffff',
        colorBgElevated: mode === 'dark' ? '#1e293b' : '#ffffff',
        colorBorderSecondary: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(226, 232, 240, 0.8)',
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
          colorBgContainer: mode === 'dark' ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
        },
        Input: {
          colorBgContainer: mode === 'dark' ? '#1e293b' : '#ffffff',
          colorText: mode === 'dark' ? '#f1f5f9' : '#111827',
          colorTextPlaceholder: mode === 'dark' ? '#94a3b8' : '#9ca3af',
          colorBorder: mode === 'dark' ? 'rgba(148, 163, 184, 0.25)' : '#d9d9d9',
          hoverBorderColor: mode === 'dark' ? '#38bdf8' : '#4096ff',
          activeBorderColor: '#0f6ad8',
        },
        Select: {
          colorBgContainer: mode === 'dark' ? '#1e293b' : '#ffffff',
          colorText: mode === 'dark' ? '#f1f5f9' : '#111827',
          colorTextPlaceholder: mode === 'dark' ? '#94a3b8' : '#9ca3af',
          colorBorder: mode === 'dark' ? 'rgba(148, 163, 184, 0.25)' : '#d9d9d9',
          optionSelectedBg: mode === 'dark' ? 'rgba(15, 106, 216, 0.2)' : '#e6f4ff',
        },
        Form: {
          labelColor: mode === 'dark' ? '#cbd5e1' : '#374151',
        },
        Modal: {
          contentBg: mode === 'dark' ? '#0f172a' : '#ffffff',
          headerBg: mode === 'dark' ? '#0f172a' : '#ffffff',
        },
        Table: {
          headerBg: mode === 'dark' ? '#1e293b' : '#fafafa',
          headerColor: mode === 'dark' ? '#e2e8f0' : 'rgba(0, 0, 0, 0.88)',
          headerSplitColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(0, 0, 0, 0.06)',
          rowHoverBg: mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : '#f5f5f5',
          rowSelectedBg: mode === 'dark' ? 'rgba(15, 106, 216, 0.18)' : '#e6f4ff',
          rowSelectedHoverBg: mode === 'dark' ? 'rgba(15, 106, 216, 0.28)' : '#bae0ff',
          borderColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : '#f0f0f0',
          footerBg: mode === 'dark' ? '#1e293b' : '#fafafa',
          footerColor: mode === 'dark' ? '#94a3b8' : 'rgba(0, 0, 0, 0.65)',
        },
        Pagination: {
          itemActiveBg: '#0f6ad8',
          colorPrimaryText: '#ffffff',
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
