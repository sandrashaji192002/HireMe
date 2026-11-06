import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth-context.jsx';
import { ConfigProvider, App as AntdApp, theme } from 'antd';

const appTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
    colorPrimary: '#8b5cf6',
    colorPrimaryHover: '#9d75f7',
    colorPrimaryActive: '#7c3aed',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#6366f1',
    colorBgBase: '#0c0a1a',
    colorBgLayout: '#0c0a1a',
    colorBgContainer: '#141026',
    colorBgElevated: '#1c1636',
    colorBorder: '#272045',
    colorBorderSecondary: '#1f1938',
    colorText: '#f3f1fa',
    colorTextSecondary: '#a39cb8',
    colorTextTertiary: '#766f8e',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
  },
  components: {
    Card: {
      colorBgContainer: 'rgba(20, 16, 38, 0.75)',
      headerBg: 'transparent',
    },
    Button: {
      controlHeight: 40,
      borderRadius: 10,
      fontWeight: 600,
    },
    Input: {
      colorBgContainer: '#100c22',
      controlHeight: 40,
      borderRadius: 10,
    },
    Select: {
      colorBgContainer: '#100c22',
      controlHeight: 40,
      borderRadius: 10,
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};

ConfigProvider.config({ theme: appTheme });

createRoot(document.getElementById('root')).render(
  <ConfigProvider theme={appTheme}>
    <AntdApp>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>
);
