import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Import products from Excel/CSV file
 */
export const importProducts = createAsyncThunk(
  'products/import',
  async (file, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Import failed');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to import products');
    }
  }
);

/**
 * Fetch products with filters and pagination
 */
export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch products');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

/**
 * Fetch available categories
 */
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to fetch categories');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    categories: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
    filters: {
      search: '',
      category: '',
      minRating: 0,
      sortBy: 'rating',
      sortOrder: 'DESC',
    },
    loading: false,
    error: null,
    importStatus: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to page 1 on filter change
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        minRating: 0,
        sortBy: 'rating',
        sortOrder: 'DESC',
      };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Import products
      .addCase(importProducts.pending, (state) => {
        state.loading = true;
        state.importStatus = null;
        state.error = null;
      })
      .addCase(importProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.importStatus = action.payload.data;
        state.error = null;
      })
      .addCase(importProducts.rejected, (state, action) => {
        state.loading = false;
        state.importStatus = null;
        state.error = action.payload || 'Import failed';
      })
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data?.products || [];
        state.pagination = action.payload.data?.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch categories';
      });
  },
});

export const { setFilters, resetFilters, setPage, clearError } = productSlice.actions;
export default productSlice.reducer;