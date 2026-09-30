import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import StorageIcon from '@mui/icons-material/Storage';
import FmdGoodIcon from '@mui/icons-material/FmdGood';

import AppHeader from '../components/common/AppHeader';
import FarmerNavigation from '../components/common/FarmerNavigation';
import { useLanguage } from '../context/LanguageContext';

interface TelemetryRow {
  id: string;
  equipmentId: string;
  equipmentName: string;
  model: string;
  timestamp: string;
  fuelRate: number; // L/hr
  speed: number; // km/h
  engineHours: number;
  operationType: string;
  machineState: 'working' | 'idle' | 'off';
  latitude: number;
  longitude: number;
  fieldName: string;
  anomaly?: string;
}

// Generate realistic mock telemetry dataset
const generateMockTelemetry = (): TelemetryRow[] => {
  const equipmentList = [
    { id: 'equip-001', name: '6120B Tractor', model: '6120B', baseFuel: 6.5, baseSpeed: 8.0, baseHours: 1240.0 },
    { id: 'equip-002', name: '5050D Tractor', model: '5050D', baseFuel: 5.2, baseSpeed: 6.5, baseHours: 890.0 },
    { id: 'equip-003', name: 'Boom Sprayer', model: 'Boom Sprayer', baseFuel: 4.8, baseSpeed: 12.0, baseHours: 420.0 },
    { id: 'equip-004', name: '5310 Tractor', model: '5310', baseFuel: 5.8, baseSpeed: 7.2, baseHours: 1110.0 },
  ];

  const fields = ['Field A (North)', 'Field B (East)', 'Field C (South)', 'Shed / Garage'];
  const operations = ['Plowing & Tillage', 'Planting', 'Spraying', 'Field Transport', 'Stationary PTO'];

  const rows: TelemetryRow[] = [];
  const baseDate = new Date('2026-09-30T10:00:00Z');

  let rowCount = 1;
  // Generate across last 7 days, multiple hours per day
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    for (const equip of equipmentList) {
      const hoursPerDay = [7, 9, 11, 13, 15, 17];
      for (const hour of hoursPerDay) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - dayOffset);
        date.setHours(hour, Math.floor(Math.random() * 50), 0);

        const isIdle = Math.random() < 0.22;
        const isOff = hour === 7 && Math.random() < 0.3;
        const state: 'working' | 'idle' | 'off' = isOff ? 'off' : isIdle ? 'idle' : 'working';

        const speed = state === 'working' ? Number((equip.baseSpeed * (0.85 + Math.random() * 0.3)).toFixed(1)) : 0.0;
        const fuelRate =
          state === 'working'
            ? Number((equip.baseFuel * (0.9 + Math.random() * 0.35)).toFixed(1))
            : state === 'idle'
            ? Number((equip.baseFuel * 0.32).toFixed(1))
            : 0.0;

        const field = state === 'off' ? fields[3] : fields[Math.floor(Math.random() * 3)];
        const opType =
          state === 'off'
            ? 'At Rest'
            : state === 'idle'
            ? 'Idle Running'
            : equip.id === 'equip-003'
            ? 'Spraying'
            : operations[Math.floor(Math.random() * operations.length)];

        let anomaly: string | undefined = undefined;
        if (state === 'idle' && hour >= 10 && hour <= 12) {
          anomaly = 'High Idle Warning';
        } else if (fuelRate > equip.baseFuel * 1.35) {
          anomaly = 'Excess Fuel Consumption';
        }

        rows.push({
          id: `tel-${rowCount++}`,
          equipmentId: equip.id,
          equipmentName: equip.name,
          model: equip.model,
          timestamp: date.toISOString().replace('T', ' ').substring(0, 16),
          fuelRate,
          speed,
          engineHours: Number((equip.baseHours + (6 - dayOffset) * 6.5 + hour * 0.2).toFixed(1)),
          operationType: opType,
          machineState: state,
          latitude: Number((18.5204 + (Math.random() - 0.5) * 0.015).toFixed(4)),
          longitude: Number((73.8567 + (Math.random() - 0.5) * 0.015).toFixed(4)),
          fieldName: field,
          anomaly,
        });
      }
    }
  }

  // Sort by timestamp descending
  return rows.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
};

const ALL_MOCK_DATA = generateMockTelemetry();

export const ViewDataPage: React.FC = () => {
  const { t } = useLanguage();

  // Filters State
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2026-09-24');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pagination State
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handleLoadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPage(0);
    }, 400);
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return ALL_MOCK_DATA.filter((row) => {
      // Equipment filter
      if (selectedEquipment !== 'all' && row.equipmentId !== selectedEquipment && row.model !== selectedEquipment) {
        return false;
      }

      // State filter
      if (stateFilter !== 'all' && row.machineState !== stateFilter) {
        return false;
      }

      // Date range filter
      const rowDate = row.timestamp.substring(0, 10);
      if (startDate && rowDate < startDate) return false;
      if (endDate && rowDate > endDate) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          row.equipmentName.toLowerCase().includes(query) ||
          row.fieldName.toLowerCase().includes(query) ||
          row.operationType.toLowerCase().includes(query) ||
          row.timestamp.includes(query)
        );
      }

      return true;
    });
  }, [selectedEquipment, stateFilter, startDate, endDate, searchQuery]);

  // Summary Metrics calculations
  const stats = useMemo(() => {
    const totalRecords = filteredData.length;
    if (totalRecords === 0) {
      return { totalRecords: 0, avgFuel: 0, avgSpeed: 0, totalEngineHours: 0, anomaliesCount: 0 };
    }

    const workingRows = filteredData.filter((r) => r.machineState === 'working');
    const avgFuel =
      filteredData.reduce((sum, r) => sum + r.fuelRate, 0) / (filteredData.filter((r) => r.fuelRate > 0).length || 1);
    const avgSpeed = workingRows.length > 0 ? workingRows.reduce((sum, r) => sum + r.speed, 0) / workingRows.length : 0;
    const maxHours = Math.max(...filteredData.map((r) => r.engineHours));
    const minHours = Math.min(...filteredData.map((r) => r.engineHours));
    const anomaliesCount = filteredData.filter((r) => !!r.anomaly).length;

    return {
      totalRecords,
      avgFuel: Number(avgFuel.toFixed(1)),
      avgSpeed: Number(avgSpeed.toFixed(1)),
      totalEngineHours: Number((maxHours - minHours + 5.0).toFixed(1)),
      anomaliesCount,
    };
  }, [filteredData]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Equipment', 'Model', 'Fuel (L/hr)', 'Speed (km/h)', 'Engine Hours', 'State', 'Operation', 'Location', 'Latitude', 'Longitude', 'Anomaly'];
    const csvRows = filteredData.map((r) => [
      `"${r.timestamp}"`,
      `"${r.equipmentName}"`,
      `"${r.model}"`,
      r.fuelRate,
      r.speed,
      r.engineHours,
      `"${r.machineState}"`,
      `"${r.operationType}"`,
      `"${r.fieldName}"`,
      r.latitude,
      r.longitude,
      `"${r.anomaly || 'None'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetry_export_${selectedEquipment}_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedRows = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />
      <FarmerNavigation />

      <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
              Raw Machine Telemetry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inspect simulated & connected John Deere sensor logs, operating speeds, and fuel rates.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Export CSV
            </Button>
          </Stack>
        </Box>

        {/* Filter Controls Card */}
        <Card sx={{ mb: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.06)', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
              Query & Telemetry Filters
            </Typography>

            <Grid container spacing={2} alignItems="center">
              {/* Equipment Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="equipment-select-label">Equipment</InputLabel>
                  <Select
                    labelId="equipment-select-label"
                    value={selectedEquipment}
                    label="Equipment"
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                  >
                    <MenuItem value="all">All Equipment (4 Machines)</MenuItem>
                    <MenuItem value="equip-001">6120B Tractor (150L)</MenuItem>
                    <MenuItem value="equip-002">5050D Tractor (120L)</MenuItem>
                    <MenuItem value="equip-003">Boom Sprayer (80L)</MenuItem>
                    <MenuItem value="equip-004">5310 Tractor (100L)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={6} md={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Machine State Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="state-select-label">State</InputLabel>
                  <Select
                    labelId="state-select-label"
                    value={stateFilter}
                    label="State"
                    onChange={(e) => setStateFilter(e.target.value)}
                  >
                    <MenuItem value="all">All States</MenuItem>
                    <MenuItem value="working">Working</MenuItem>
                    <MenuItem value="idle">Idle</MenuItem>
                    <MenuItem value="off">Off / Rest</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Load Data Button */}
              <Grid item xs={12} sm={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleLoadData}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                  sx={{
                    height: 40,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 1.5,
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load Data'}
                </Button>
              </Grid>
            </Grid>

            {/* Keyword Search Row */}
            <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by field name, operation type, or timestamp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Summary Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Total Records */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Records
                  </Typography>
                  <StorageIcon color="primary" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {stats.totalRecords.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across selected date range
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Avg Fuel Consumption */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Avg Fuel Consumption
                  </Typography>
                  <LocalGasStationIcon color="warning" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {stats.avgFuel} <Typography component="span" variant="body1" color="text.secondary">L/hr</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active operation average
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Avg Speed */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Avg Operating Speed
                  </Typography>
                  <SpeedIcon color="success" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {stats.avgSpeed} <Typography component="span" variant="body1" color="text.secondary">km/h</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Field traversal speed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Engine Hours */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Active Engine Hours
                  </Typography>
                  <TimerIcon color="info" fontSize="small" />
                </Stack>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {stats.totalEngineHours} <Typography component="span" variant="body1" color="text.secondary">hrs</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cumulative logging
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Table */}
        <Card sx={{ boxShadow: '0 2px 6px rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 700 }} aria-label="telemetry data table" size="medium">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Fuel Rate (L/hr)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Speed (km/h)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Engine Hours</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Operation Type / State</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Field Location & GPS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No telemetry logs match the current filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: row.anomaly ? 'rgba(237, 108, 2, 0.04)' : 'inherit',
                      }}
                    >
                      {/* Timestamp */}
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {row.timestamp}
                      </TableCell>

                      {/* Equipment */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {row.equipmentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.model}
                        </Typography>
                      </TableCell>

                      {/* Fuel Rate */}
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={row.fuelRate > 7.0 ? 'bold' : 'normal'}
                          color={row.fuelRate > 7.0 ? 'error.main' : 'text.primary'}
                        >
                          {row.fuelRate.toFixed(1)} L/hr
                        </Typography>
                      </TableCell>

                      {/* Speed */}
                      <TableCell align="right">
                        <Typography variant="body2">
                          {row.speed.toFixed(1)} km/h
                        </Typography>
                      </TableCell>

                      {/* Engine Hours */}
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {row.engineHours.toFixed(1)} hrs
                        </Typography>
                      </TableCell>

                      {/* Operation Type / State */}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={row.machineState.toUpperCase()}
                            size="small"
                            color={
                              row.machineState === 'working'
                                ? 'success'
                                : row.machineState === 'idle'
                                ? 'warning'
                                : 'default'
                            }
                            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                          />
                          <Typography variant="body2">
                            {row.operationType}
                          </Typography>
                        </Stack>
                        {row.anomaly && (
                          <Chip
                            label={row.anomaly}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ mt: 0.5, fontSize: '0.65rem', height: 18 }}
                          />
                        )}
                      </TableCell>

                      {/* Location & GPS */}
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <FmdGoodIcon fontSize="small" color="action" sx={{ fontSize: 16 }} />
                          <Typography variant="body2" fontWeight={500}>
                            {row.fieldName}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {row.latitude}, {row.longitude}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      </Container>
    </Box>
  );
};

export default ViewDataPage;
