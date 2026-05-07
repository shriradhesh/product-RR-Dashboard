import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { importProducts, fetchProducts } from '../../store/slices/productSlice';
import { fetchAnalytics } from '../../store/slices/analyticsSlice';

const FileUpload = () => {
  const dispatch = useDispatch();
  const { loading, importStatus } = useSelector((state) => state.products);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadError(null);
      const result = await dispatch(importProducts(file));
      
      if (result.payload?.success) {
        dispatch(fetchProducts({ page: 1, limit: 20 }));
        dispatch(fetchAnalytics());
      } else if (result.error) {
        setUploadError(result.payload?.message || 'Upload failed');
      }
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            Import Product Data
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload your product data in CSV or Excel format. The file should contain product information
            including ratings, reviews, pricing, and categories.
          </Typography>

          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            {isDragActive ? (
              <Typography variant="body1">Drop the file here...</Typography>
            ) : (
              <>
                <Typography variant="body1" gutterBottom>
                  Drag & drop your file here, or click to select
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
                </Typography>
              </>
            )}
          </Box>

          {loading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Processing file...
              </Typography>
            </Box>
          )}

          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Upload Error</AlertTitle>
              {uploadError}
            </Alert>
          )}

          {importStatus && importStatus.success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <AlertTitle>Import Successful</AlertTitle>
              <Typography variant="body2">
                Processed: {importStatus.data?.total_processed} records |
                Inserted: {importStatus.data?.inserted} |
                Updated: {importStatus.data?.updated}
              </Typography>
            </Alert>
          )}

          {importStatus && importStatus.success && importStatus.data?.import_errors?.length > 0 && (
            <Paper sx={{ mt: 2, maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {importStatus.data.import_errors.map((err, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <ErrorIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Product ID: ${err.product_id}`}
                      secondary={err.error}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Format Guide */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            File Format Guide
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your Excel/CSV file should contain the following columns:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Required Columns:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="product_id" secondary="Unique product identifier" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="product_name" secondary="Name of the product" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Optional Columns:
                </Typography>
                <List dense>
                  <ListItem><ListItemText primary="category" /></ListItem>
                  <ListItem><ListItemText primary="discounted_price" /></ListItem>
                  <ListItem><ListItemText primary="actual_price" /></ListItem>
                  <ListItem><ListItemText primary="discount_percentage" /></ListItem>
                  <ListItem><ListItemText primary="rating" /></ListItem>
                  <ListItem><ListItemText primary="rating_count" /></ListItem>
                  <ListItem><ListItemText primary="user_name" /></ListItem>
                  <ListItem><ListItemText primary="review_title" /></ListItem>
                  <ListItem><ListItemText primary="review_content" /></ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FileUpload;