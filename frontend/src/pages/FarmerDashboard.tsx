import { Container, Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const mockOperatorData = [
  { rank: 1, operator: 'Operator A', efficiency: 1.08, shift: '6AM-2PM', status: 'Best', costPerMonth: 115000 },
  { rank: 2, operator: 'Operator C', efficiency: 1.22, shift: '10PM-6AM', status: 'OK', costPerMonth: 130000 },
  { rank: 3, operator: 'Operator B', efficiency: 1.36, shift: '2PM-10PM', status: 'High', costPerMonth: 145000 },
];

const mockTrendData = [
  { week: 'Week 1', operatorA: 1.08, operatorB: 1.28, operatorC: 1.22 },
  { week: 'Week 2', operatorA: 1.07, operatorB: 1.30, operatorC: 1.21 },
  { week: 'Week 3', operatorA: 1.09, operatorB: 1.33, operatorC: 1.23 },
  { week: 'Week 4', operatorA: 1.08, operatorB: 1.36, operatorC: 1.22 },
];

const mockRecommendations = [
  { operator: 'Operator B', recommendation: 'Reduce idle time from 40% to 25%' },
  { operator: 'Operator B', recommendation: 'Maintain consistent speed (currently 14±3 km/h)' },
  { operator: 'Operator B', recommendation: 'Reduce average speed from 14 km/h to 12 km/h' },
  { operator: 'Operator B', recommendation: 'Check tire pressure (likely low)' },
];

function FarmerDashboard() {
  const getStatusChip = (status: string) => {
    const colors: Record<string, "success" | "warning" | "error" | "default"> = {
      'Best': 'success',
      'OK': 'warning',
      'High': 'error'
    };
    return <Chip label={status} color={colors[status] || 'default'} size="small" />;
  };

  const getTrendIcon = (operator: string) => {
    if (operator === 'Operator A') return <RemoveIcon color="info" />;
    if (operator === 'Operator B') return <TrendingDownIcon color="error" />;
    return <RemoveIcon color="info" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🚜 My Farm Efficiency Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Farmer: Rajesh Kumar | Location: Pimpri, Maharashtra
          </Typography>
        </Box>
        <Button variant="outlined" href="/">← Back to Home</Button>
      </Box>

      {/* Overview Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Fuel Used (30 days)</Typography>
              <Typography variant="h4">4,250 L</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Area Worked</Typography>
              <Typography variant="h4">380 ha</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Average Efficiency</Typography>
              <Typography variant="h4">1.12 L/ha</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Potential Savings</Typography>
              <Typography variant="h4" color="success.main">₹76,500</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Operator Rankings */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>🏆 Operator Rankings</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Efficiency</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Cost/Month</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockOperatorData.map((op) => (
                  <TableRow key={op.operator} sx={{ bgcolor: op.rank === 1 ? 'success.light' : 'inherit' }}>
                    <TableCell>#{op.rank}</TableCell>
                    <TableCell><strong>{op.operator}</strong></TableCell>
                    <TableCell>{op.efficiency} L/ha</TableCell>
                    <TableCell>{op.shift}</TableCell>
                    <TableCell>{getStatusChip(op.status)}</TableCell>
                    <TableCell>₹{(op.costPerMonth / 1000).toFixed(0)}K</TableCell>
                    <TableCell>{getTrendIcon(op.operator)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Cost Impact */}
      <Card sx={{ mb: 4, bgcolor: 'warning.light' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>💰 Cost Impact</Typography>
          <Typography variant="body1" paragraph>
            If Operator B matches Operator A's efficiency:
          </Typography>
          <Typography variant="h4" color="success.main">
            → Save 20% fuel = ₹29,000/month
          </Typography>
          <Typography variant="h6" color="success.main">
            → Save ₹3,48,000/year
          </Typography>
        </CardContent>
      </Card>

      {/* Efficiency Trend Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>📈 Efficiency Trend (Last 4 Weeks)</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis label={{ value: 'L/ha', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="operatorA" name="Operator A" stroke="#2e7d32" />
              <Line type="monotone" dataKey="operatorB" name="Operator B" stroke="#d32f2f" />
              <Line type="monotone" dataKey="operatorC" name="Operator C" stroke="#ff9800" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>💡 Recommendations for Operator B</Typography>
          {mockRecommendations.map((rec, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body1">
                <strong>{rec.operator}:</strong> {rec.recommendation}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
}

export default FarmerDashboard;
