import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import App from './App';
import './index.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#C8A951' },
    secondary: { main: '#D32F2F' },
    background: { default: '#0F1119', paper: '#1A1D2E' },
    divider: '#1E2340',
    text: { primary: '#E8EAF0', secondary: '#8890A8' },
  },
  typography: {
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#0F1119',
            '& fieldset': { borderColor: '#2A2F45', borderWidth: 1.5 },
            '&:hover fieldset': { borderColor: '#3A3F58' },
            '&.Mui-focused fieldset': { borderColor: '#C8A951' },
          },
          '& .MuiInputLabel-root': { color: '#8890A8' },
          '& .MuiInputBase-input': { color: '#E8EAF0' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 10,
          padding: '8px 20px',
        },
        containedPrimary: {
          color: '#0F1119',
          '&:hover': { backgroundColor: '#B8942E' },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #D32F2F, #E53935)',
          color: '#FFFFFF',
          '&:hover': { background: 'linear-gradient(135deg, #B71C1C, #D32F2F)' },
        },
        sizeLarge: { padding: '12px 24px', fontSize: 15 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1D2E',
          border: '1px solid #1E2340',
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: 12 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1D2E',
          border: '1px solid #2A2F45',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #1E2340',
          color: '#E8EAF0',
        },
        head: { fontWeight: 700, color: '#8890A8' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(200,169,81,0.04)' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardInfo: {
          backgroundColor: 'rgba(2,136,209,0.1)',
          color: '#4FC3F7',
          '& .MuiAlert-icon': { color: '#4FC3F7' },
        },
        standardWarning: {
          backgroundColor: 'rgba(255,152,0,0.1)',
          color: '#FFB74D',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#C8A951' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: '#8890A8',
          '&.Mui-selected': { color: '#C8A951' },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
