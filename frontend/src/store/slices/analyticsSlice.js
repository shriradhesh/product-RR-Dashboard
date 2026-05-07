import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Fetch analytics data from backend
 */
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics');
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch analytics');
      }
      
      return response.data;
    } catch (error) {
      // Handle different error types
      if (error.message) {
        return rejectWithValue(error.message);
      }
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue('Failed to fetch analytics data');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || null;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error occurred';
        state.data = null;
      });
  },
});

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;