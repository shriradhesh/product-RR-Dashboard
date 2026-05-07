import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import { fetchProducts, setFilters, setPage } from '../../store/slices/productSlice';

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 2 }}>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

const DataTable = () => {
  const dispatch = useDispatch();
  const { products, pagination, filters, loading, error, categories } = useSelector(
    (state) => state.products
  );
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    dispatch(fetchProducts({ ...filters, page: pagination.page }));
  }, [dispatch, filters, pagination.page]);

  const handleSearch = () => {
    dispatch(setFilters({ search: searchInput }));
    dispatch(setPage(1));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value }));
    dispatch(setPage(1));
  };

  const handleRatingChange = (e) => {
    dispatch(setFilters({ minRating: e.target.value }));
    dispatch(setPage(1));
  };

  const columns = [
    {
      field: 'product_name',
      headerName: 'Product Name',
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value?.substring(0, 50)}
          {params.value?.length > 50 ? '...' : ''}
        </Typography>
      ),
    },
    {
      field: 'main_category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value || 'N/A'} size="small" variant="outlined" />
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={params.value} readOnly size="small" precision={0.1} />
          <Typography variant="body2" color="text.secondary">
            ({params.value})
          </Typography>
        </Box>
      ),
    },
    {
      field: 'rating_count',
      headerName: 'Reviews',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'discounted_price',
      headerName: 'Price (₹)',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
          ₹{parseFloat(params.value).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'actual_price',
      headerName: 'Original (₹)',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
          ₹{parseFloat(params.value).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'discount_percentage',
      headerName: 'Discount',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Chip 
          label={`${parseFloat(params.value).toFixed(0)}% OFF`} 
          size="small" 
          color="error" 
          variant="outlined"
        />
      ),
    },
    {
      field: 'user_name',
      headerName: 'Reviewer',
      width: 150,
    },
    {
      field: 'review_title',
      headerName: 'Review Title',
      width: 200,
    },
  ];

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error" align="center">
            Error loading products: {error.message}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select value={filters.category} onChange={handleCategoryChange} label="Category">
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Min Rating</InputLabel>
            <Select value={filters.minRating} onChange={handleRatingChange} label="Min Rating">
              <MenuItem value={0}>All Ratings</MenuItem>
              <MenuItem value={4}>4+ Stars</MenuItem>
              <MenuItem value={4.5}>4.5+ Stars</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Data Grid */}
        <DataGrid
          rows={products}
          columns={columns}
          paginationMode="server"
          rowCount={pagination.total}
          page={pagination.page - 1}
          pageSize={pagination.limit}
          onPageChange={(newPage) => dispatch(setPage(newPage + 1))}
          loading={loading}
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              wordWrap: 'break-word',
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default DataTable;