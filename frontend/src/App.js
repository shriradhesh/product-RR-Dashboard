import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import Dashboard from './components/Dashboard/Dashboard';
import DataTable from './components/DataTable/DataTable';
import FileUpload from './components/FileUpload/FileUpload';
import { fetchAnalytics } from './store/slices/analyticsSlice';
import { fetchCategories } from './store/slices/productSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [tabValue, setTabValue] = React.useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'white', color: 'primary.main', borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Product Analytics Dashboard
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Amazon Product Ratings & Reviews
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '1rem' } }}>
              <Tab icon={<AssessmentIcon />} iconPosition="start" label="Dashboard" />
              <Tab icon={<StorageIcon />} iconPosition="start" label="Data Table" />
              <Tab icon={<CloudUploadIcon />} iconPosition="start" label="Import Data" />
            </Tabs>
          </Box>

          {tabValue === 0 && <Dashboard />}
          {tabValue === 1 && <DataTable />}
          {tabValue === 2 && <FileUpload />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;