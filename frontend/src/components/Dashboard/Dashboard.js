import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import StarIcon from '@mui/icons-material/Star';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReviewsIcon from '@mui/icons-material/Reviews';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { fetchAnalytics } from '../../store/slices/analyticsSlice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
        <Typography color="error" variant="h6" gutterBottom>
          Unable to Load Dashboard
        </Typography>
        <Typography color="error" variant="body2">
          {typeof error === 'string' ? error : 'An error occurred while loading analytics data'}
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const stats = data.overall_stats;
  const categoryData = data.products_per_category?.map(item => ({
    name: item.main_category || 'Other',
    value: parseInt(item.count),
  })) || [];

  const topProductsData = data.top_reviewed_products?.map(item => ({
    name: item.product_name?.substring(0, 30) + (item.product_name?.length > 30 ? '...' : ''),
    reviews: item.rating_count,
    rating: parseFloat(item.rating),
  })) || [];

  const discountData = data.discount_distribution?.map(item => ({
    range: item.discount_range,
    count: parseInt(item.count),
  })) || [];

  const categoryRatingData = data.category_avg_rating?.map(item => ({
    name: item.main_category,
    rating: parseFloat(item.avg_rating),
    count: parseInt(item.product_count),
  })) || [];

  const ratingDistributionData = data.rating_distribution?.map(item => ({
    rating: `${item.rating_bucket}+`,
    count: parseInt(item.count),
  })) || [];

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats?.total_products?.toLocaleString() || 0}
            icon={<ShoppingBagIcon sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={parseFloat(stats?.avg_rating || 0).toFixed(1)}
            icon={<StarIcon sx={{ color: 'white' }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Reviews"
            value={stats?.total_reviews?.toLocaleString() || 0}
            icon={<ReviewsIcon sx={{ color: 'white' }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Discount"
            value={`${parseFloat(stats?.avg_discount || 0).toFixed(1)}%`}
            icon={<LocalOfferIcon sx={{ color: 'white' }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Products per Category */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Products per Category
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1976d2" name="Number of Products" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Reviewed Products */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Top Reviewed Products
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reviews" fill="#ff9800" name="Review Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Discount Distribution */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Discount Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={discountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4caf50" name="Number of Products" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category-wise Average Rating */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Category-wise Average Rating
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryRatingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rating" fill="#9c27b0" name="Average Rating" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Rating Distribution */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Rating Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {ratingDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;