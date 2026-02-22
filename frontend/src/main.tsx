import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes/routes.tsx';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store.ts';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'sonner';
import { ConfigProvider, theme as antdTheme } from 'antd';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#0f6ad8',
              colorInfo: '#0f6ad8',
              borderRadius: 8,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI", sans-serif',
              colorBgLayout: '#020617',
            },
            components: {
              Layout: {
                headerBg: '#020617',
                siderBg: '#020617',
                bodyBg: '#020617',
              },
              Menu: {
                itemColor: '#cbd5f5',
                itemHoverColor: '#e5e7eb',
                itemSelectedColor: '#eff6ff',
                itemSelectedBg: '#1d4ed8',
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
            algorithm: [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </PersistGate>
      <Toaster richColors position="top-right" />
    </Provider>
  </React.StrictMode>
);
