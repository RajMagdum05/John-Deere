import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  FormControl,
  Select,
  MenuItem,
  LinearProgress,
  Alert as MuiAlert,
  IconButton,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  TrendingUp,
  FileDownload,
  CheckCircle,
  WarningAmber,
  Schedule,
  LocalGasStation,
  ArrowBack,
  AutoAwesome,
  Insights,
  People,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from '../components/common/LanguageToggle';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from 'recharts';

export interface PMDashboardData {
  range: '7d' | '30d' | '90d';
  days: number;
  total_alerts: number;
  action_rate: number;
  success_rate: number;
  total_fuel_saved_litres: number;
  avg_fuel_saved_litres: number;
  avg_improvement_percent: number;
  daily_cost_savings_inr: number;
  farmers_acted: number;
  farmers_ignored: number;
  alert_performance: Array<{
    type: string;
    total: number;
    ignored: number;
    acted: number;
    ignore_rate: number;
  }>;
  action_effectiveness: Array<{
    action: string;
    tried: number;
    success: number;
    success_rate: number;
    category: string;
  }>;
  farmer_segments: Array<{
    segment: string;
    farmers: number;
    action_rate: number;
    fill: string;
  }>;
  time_patterns: Array<{
    time: string;
    alerts: number;
    ignored: number;
    acted: number;
    ignore_rate: number;
  }>;
  product_recommendations: Array<{
    priority: number;
    title: string;
    insight: string;
    suggestion: string;
    impact: string;
  }>;
}

const mockDataByRange: Record<'7d' | '30d' | '90d', PMDashboardData> = {
  '7d': {
    range: '7d',
    days: 7,
    total_alerts: 1000,
    action_rate: 38,
    success_rate: 78,
    total_fuel_saved_litres: 1200,
    avg_fuel_saved_litres: 10,
    avg_improvement_percent: 48,
    daily_cost_savings_inr: 104400,
    farmers_acted: 380,
    farmers_ignored: 620,
    alert_performance: [
      { type: 'High Idle Time', total: 400, ignored: 220, acted: 180, ignore_rate: 55 },
      { type: 'Low Fuel Efficiency', total: 300, ignored: 180, acted: 120, ignore_rate: 60 },
      { type: 'Speed Anomaly', total: 200, ignored: 150, acted: 50, ignore_rate: 75 },
      { type: 'GPS Boundary', total: 100, ignored: 65, acted: 35, ignore_rate: 65 },
    ],
    action_effectiveness: [
      { action: 'Turn off engine during 5+ min waits', tried: 120, success: 102, success_rate: 85, category: 'Idle Reduction' },
      { action: 'Maintain steady speed on flat terrain', tried: 95, success: 68, success_rate: 72, category: 'Speed Optimization' },
      { action: 'Reduce throttle on hills', tried: 80, success: 36, success_rate: 45, category: 'Throttle Control' },
    ],
    farmer_segments: [
      { segment: 'Large farms (>500 ha)', farmers: 150, action_rate: 45, fill: '#367C2B' },
      { segment: 'Medium farms (100-500 ha)', farmers: 200, action_rate: 38, fill: '#629E51' },
      { segment: 'Small farms (<100 ha)', farmers: 150, action_rate: 28, fill: '#8CBF7D' },
    ],
    time_patterns: [
      { time: 'Morning (6-12)', alerts: 300, ignored: 105, acted: 195, ignore_rate: 35 },
      { time: 'Afternoon (12-18)', alerts: 400, ignored: 160, acted: 240, ignore_rate: 40 },
      { time: 'Evening (18-24)', alerts: 300, ignored: 195, acted: 105, ignore_rate: 65 },
    ],
    product_recommendations: [
      {
        priority: 1,
        title: 'Speed Anomaly Alert Performance',
        insight: '75% of farmers ignore this alert',
        suggestion: 'Consider simplifying alert copy or adjusting threshold',
        impact: 'Could improve action rate by 20-30%',
      },
      {
        priority: 2,
        title: 'Turn Off Engine Recommendation',
        insight: '85% success rate when farmers follow this advice',
        suggestion: 'Promote this recommendation in farmer onboarding',
        impact: 'High-confidence insight to scale',
      },
      {
        priority: 3,
        title: 'Reduce Throttle Advice',
        insight: 'Only 45% of farmers see improvement',
        suggestion: 'Review advice accuracy or add more context',
        impact: 'Investigation needed to improve effectiveness',
      },
      {
        priority: 4,
        title: 'Evening Alert Delivery',
        insight: '65% of evening alerts are ignored',
        suggestion: 'Consider time-based delivery optimization',
        impact: 'Better timing could reduce ignore rate',
      },
    ],
  },
  '30d': {
    range: '30d',
    days: 30,
    total_alerts: 4200,
    action_rate: 40,
    success_rate: 80,
    total_fuel_saved_litres: 5400,
    avg_fuel_saved_litres: 11.2,
    avg_improvement_percent: 50,
    daily_cost_savings_inr: 469800,
    farmers_acted: 1680,
    farmers_ignored: 2520,
    alert_performance: [
      { type: 'High Idle Time', total: 1680, ignored: 890, acted: 790, ignore_rate: 53 },
      { type: 'Low Fuel Efficiency', total: 1260, ignored: 730, acted: 530, ignore_rate: 58 },
      { type: 'Speed Anomaly', total: 840, ignored: 605, acted: 235, ignore_rate: 72 },
      { type: 'GPS Boundary', total: 420, ignored: 252, acted: 168, ignore_rate: 60 },
    ],
    action_effectiveness: [
      { action: 'Turn off engine during 5+ min waits', tried: 540, success: 464, success_rate: 86, category: 'Idle Reduction' },
      { action: 'Maintain steady speed on flat terrain', tried: 410, success: 303, success_rate: 74, category: 'Speed Optimization' },
      { action: 'Reduce throttle on hills', tried: 360, success: 173, success_rate: 48, category: 'Throttle Control' },
    ],
    farmer_segments: [
      { segment: 'Large farms (>500 ha)', farmers: 650, action_rate: 48, fill: '#367C2B' },
      { segment: 'Medium farms (100-500 ha)', farmers: 850, action_rate: 41, fill: '#629E51' },
      { segment: 'Small farms (<100 ha)', farmers: 620, action_rate: 31, fill: '#8CBF7D' },
    ],
    time_patterns: [
      { time: 'Morning (6-12)', alerts: 1300, ignored: 416, acted: 884, ignore_rate: 32 },
      { time: 'Afternoon (12-18)', alerts: 1700, ignored: 646, acted: 1054, ignore_rate: 38 },
      { time: 'Evening (18-24)', alerts: 1200, ignored: 744, acted: 456, ignore_rate: 62 },
    ],
    product_recommendations: [
      {
        priority: 1,
        title: 'Speed Anomaly Alert Performance',
        insight: '72% of farmers ignore this alert over 30 days',
        suggestion: 'Consider simplifying alert copy or adjusting threshold',
        impact: 'Could improve action rate by 20-30%',
      },
      {
        priority: 2,
        title: 'Turn Off Engine Recommendation',
        insight: '86% success rate across 540 farmer trials',
        suggestion: 'Promote this recommendation in farmer onboarding',
        impact: 'High-confidence insight to scale',
      },
      {
        priority: 3,
        title: 'Reduce Throttle Advice',
        insight: '48% success rate indicates persistent struggle under load',
        suggestion: 'Review advice accuracy or add more context',
        impact: 'Investigation needed to improve effectiveness',
      },
      {
        priority: 4,
        title: 'Evening Alert Delivery',
        insight: '62% of evening alerts are ignored over 30 days',
        suggestion: 'Consider time-based delivery optimization',
        impact: 'Better timing could reduce ignore rate',
      },
    ],
  },
  '90d': {
    range: '90d',
    days: 90,
    total_alerts: 12500,
    action_rate: 42,
    success_rate: 82,
    total_fuel_saved_litres: 16800,
    avg_fuel_saved_litres: 12.0,
    avg_improvement_percent: 52,
    daily_cost_savings_inr: 1461600,
    farmers_acted: 5250,
    farmers_ignored: 7250,
    alert_performance: [
      { type: 'High Idle Time', total: 5000, ignored: 2500, acted: 2500, ignore_rate: 50 },
      { type: 'Low Fuel Efficiency', total: 3750, ignored: 2062, acted: 1688, ignore_rate: 55 },
      { type: 'Speed Anomaly', total: 2500, ignored: 1725, acted: 775, ignore_rate: 69 },
      { type: 'GPS Boundary', total: 1250, ignored: 712, acted: 538, ignore_rate: 57 },
    ],
    action_effectiveness: [
      { action: 'Turn off engine during 5+ min waits', tried: 1650, success: 1452, success_rate: 88, category: 'Idle Reduction' },
      { action: 'Maintain steady speed on flat terrain', tried: 1280, success: 985, success_rate: 77, category: 'Speed Optimization' },
      { action: 'Reduce throttle on hills', tried: 1100, success: 561, success_rate: 51, category: 'Throttle Control' },
    ],
    farmer_segments: [
      { segment: 'Large farms (>500 ha)', farmers: 1950, action_rate: 51, fill: '#367C2B' },
      { segment: 'Medium farms (100-500 ha)', farmers: 2600, action_rate: 44, fill: '#629E51' },
      { segment: 'Small farms (<100 ha)', farmers: 1850, action_rate: 33, fill: '#8CBF7D' },
    ],
    time_patterns: [
      { time: 'Morning (6-12)', alerts: 3900, ignored: 1170, acted: 2730, ignore_rate: 30 },
      { time: 'Afternoon (12-18)', alerts: 5100, ignored: 1836, acted: 3264, ignore_rate: 36 },
      { time: 'Evening (18-24)', alerts: 3500, ignored: 2065, acted: 1435, ignore_rate: 59 },
    ],
    product_recommendations: [
      {
        priority: 1,
        title: 'Speed Anomaly Alert Performance',
        insight: '69% quarterly ignore rate shows structural friction',
        suggestion: 'Consider simplifying alert copy or adjusting threshold',
        impact: 'Could improve action rate by 20-30%',
      },
      {
        priority: 2,
        title: 'Turn Off Engine Recommendation',
        insight: '88% sustained success across 1,650 farmer actions',
        suggestion: 'Promote this recommendation in farmer onboarding',
        impact: 'High-confidence insight to scale',
      },
      {
        priority: 3,
        title: 'Reduce Throttle Advice',
        insight: '51% quarterly success rate confirms need for gear guidance',
        suggestion: 'Review advice accuracy or add more context',
        impact: 'Investigation needed to improve effectiveness',
      },
      {
        priority: 4,
        title: 'Evening Alert Delivery',
        insight: '59% quarterly evening drop-off vs 30% morning rate',
        suggestion: 'Consider time-based delivery optimization',
        impact: 'Better timing could reduce ignore rate',
      },
    ],
  },
};

export const PMDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<PMDashboardData>(mockDataByRange['7d']);

  const fetchDashboardData = async (range: '7d' | '30d' | '90d') => {
    setLoading(true);
    try {
      let response: Response;
      try {
        response = await fetch(`http://localhost:8000/api/pm/dashboard?range=${range}`);
      } catch {
        response = await fetch(`/api/pm/dashboard?range=${range}`);
      }

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setDashboardData(mockDataByRange[range]);
      }
    } catch {
      setDashboardData(mockDataByRange[range]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(dateRange);
  }, [dateRange]);

  const activeData = dashboardData || mockDataByRange[dateRange];

  const localizedAlertPerf = activeData.alert_performance.map((item) => {
    let typeName = item.type;
    if (language === 'mr') {
      if (item.type.includes('Idle')) typeName = 'जास्त निष्क्रिय वेळ';
      else if (item.type.includes('Fuel')) typeName = 'कमी इंधन कार्यक्षमता';
      else if (item.type.includes('Speed')) typeName = 'कामाच्या वेगात बदल';
      else if (item.type.includes('GPS')) typeName = 'GPS सीमा चेतावणी';
    }
    return { ...item, typeName };
  });

  const localizedFarmerSegments = activeData.farmer_segments.map((item) => {
    let segmentName = item.segment;
    if (language === 'mr') {
      if (item.segment.includes('Large')) segmentName = 'मोठी शेती (>५०० हेक्टर)';
      else if (item.segment.includes('Medium')) segmentName = 'मध्यम शेती (१००-५०० हेक्टर)';
      else if (item.segment.includes('Small')) segmentName = 'लहान शेती (<१०० हेक्टर)';
    }
    return { ...item, segmentName };
  });

  const localizedTimePatterns = activeData.time_patterns.map((item) => {
    let timeName = item.time;
    if (language === 'mr') {
      if (item.time.includes('Morning')) timeName = 'सकाळ (६-१२)';
      else if (item.time.includes('Afternoon')) timeName = 'दुपार (१२-१८)';
      else if (item.time.includes('Evening')) timeName = 'संध्याकाळ (१८-२४)';
    }
    return { ...item, timeName };
  });

  const localizedActionEffectiveness = activeData.action_effectiveness.map((item) => {
    let action = item.action;
    let category = item.category;
    if (language === 'mr') {
      if (item.action.includes('Turn off engine')) {
        action = '५+ मिनिटे थांबताना इंजिन बंद करा';
        category = 'निष्क्रिय वेळ घट';
      } else if (item.action.includes('steady speed')) {
        action = 'सपाट जमिनीवर प्रवासाचा वेग स्थिर ठेवा';
        category = 'वेग अनुकूलन';
      } else if (item.action.includes('throttle')) {
        action = 'चढावर जाताना थ्रॉटल नियंत्रित ठेवा';
        category = 'थ्रॉटल नियंत्रण';
      }
    }
    return { ...item, action, category };
  });

  const localizedRecommendations = activeData.product_recommendations.map((rec) => {
    let title = rec.title;
    let insight = rec.insight;
    let suggestion = rec.suggestion;
    let impact = rec.impact;

    if (language === 'mr') {
      if (rec.priority === 1) {
        title = 'कामाच्या वेगात बदल अलर्टची कामगिरी';
        insight = `${rec.insight.includes('75%') ? '७५%' : rec.insight.includes('72%') ? '७२%' : '६९%'} शेतकरी या अलर्टकडे दुर्लक्ष करतात`;
        suggestion = 'अलर्टचा मजकूर सोपा करणे किंवा थ्रेशोल्ड समायोजित करण्याचा विचार करा';
        impact = 'कृती दरात २०-३०% सुधारणा होऊ शकते';
      } else if (rec.priority === 2) {
        title = '"इंजिन बंद करा" शिफारस';
        insight = 'जेव्हा शेतकरी हा सल्ला पाळतात तेव्हा उच्च यश दर';
        suggestion = 'शेतकरी ऑनबोर्डिंगमध्ये या शिफारसीचा प्रचार करा';
        impact = 'प्रसार करण्यासाठी उच्च-आत्मविश्वास अंतर्दृष्टी';
      } else if (rec.priority === 3) {
        title = '"थ्रॉटल कमी करा" सल्ला';
        insight = 'केवळ ४५-५१% शेतकऱ्यांना सुधारणा दिसते';
        suggestion = 'सल्ल्याच्या अचूकतेचे पुनरावलोकन करा किंवा अधिक संदर्भ जोडा';
        impact = 'प्रभावकारकता सुधारण्यासाठी चौकशी आवश्यक';
      } else if (rec.priority === 4) {
        title = 'संध्याकाळचे अलर्ट वितरण';
        insight = 'संध्याकाळचे बरेच अलर्ट दुर्लक्षित केले जातात';
        suggestion = 'वेळेवर आधारित वितरण अनुकूलनाचा विचार करा';
        impact = 'योग्य वेळ दुर्लक्ष दर कमी करू शकते';
      }
    }
    return { ...rec, title, insight, suggestion, impact };
  });

  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Date Range', activeData.range],
      ['Total Alerts', activeData.total_alerts],
      ['Overall Action Rate', `${activeData.action_rate}%`],
      ['Overall Success Rate', `${activeData.success_rate}%`],
      ['Total Fuel Saved', `${activeData.total_fuel_saved_litres} Litres`],
      ['Estimated Cost Savings', `₹${activeData.daily_cost_savings_inr.toLocaleString()}`],
      [''],
      ['Alert Type', 'Total', 'Ignored', 'Acted', 'Ignore Rate %'],
      ...activeData.alert_performance.map((a) => [a.type, a.total, a.ignored, a.acted, `${a.ignore_rate}%`]),
      [''],
      ['Action Advice', 'Tried', 'Success', 'Success Rate %'],
      ...activeData.action_effectiveness.map((a) => [a.action, a.tried, a.success, `${a.success_rate}%`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `john_deere_pm_analytics_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ bgcolor: '#F4F6F8', minHeight: '100vh', pb: 8 }}>
      {/* Top Header Bar */}
      <Box
        sx={{
          bgcolor: '#1E4620',
          color: '#FFFFFF',
          py: 3,
          px: { xs: 2, md: 4 },
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <IconButton
                  onClick={() => navigate('/')}
                  sx={{ color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                  size="small"
                >
                  <ArrowBack fontSize="small" />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
                  {t('pm_dashboard_title')}
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5, pl: 5.5 }}>
                {t('pm.headerSubtitle')}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <LanguageToggle />

              <FormControl size="small" sx={{ minWidth: 150, bgcolor: '#FFFFFF', borderRadius: 1.5 }}>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                  sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                  disabled={loading}
                >
                  <MenuItem value="7d">{t('pm.time7d')}</MenuItem>
                  <MenuItem value="30d">{t('pm.time30d')}</MenuItem>
                  <MenuItem value="90d">{t('pm.time90d')}</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FileDownload />}
                onClick={handleExportCSV}
                disabled={loading}
                sx={{
                  bgcolor: '#FFDE00',
                  color: '#1E4620',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 2.5,
                  '&:hover': { bgcolor: '#E6C800' },
                }}
              >
                {t('pm.exportCsv')}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content Container */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress sx={{ height: 4, borderRadius: 2, bgcolor: '#C8E6C9', '& .MuiLinearProgress-bar': { bgcolor: '#367C2B' } }} />
          </Box>
        )}

        {/* Section 1: Top 4 KPI Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                borderLeft: '6px solid #367C2B',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('pm.kpiTotalAlerts')}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#1E4620', my: 0.5 }}>
                      {activeData.total_alerts.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {language === 'mr' ? '४ मशीन श्रेणींमध्ये' : 'Across 4 machine categories'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(54, 124, 43, 0.1)', color: '#367C2B' }}>
                    <Assessment fontSize="medium" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                borderLeft: '6px solid #FF9800',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('pm.kpiActionRate')}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#E65100', my: 0.5 }}>
                      {activeData.action_rate}%
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <TrendingUp fontSize="small" sx={{ color: '#2E7D32' }} />
                      <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 700 }}>
                        {language === 'mr' ? '+५.२% मागील महिन्यापेक्षा' : '+5.2% vs last month'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#FF9800' }}>
                    <People fontSize="medium" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                borderLeft: '6px solid #2E7D32',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('pm.kpiSuccessRate')}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#2E7D32', my: 0.5 }}>
                      {activeData.success_rate}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {language === 'mr' ? 'पुष्टी झालेली इंधन/उत्पादकता वाढ' : 'Confirmed fuel/productivity gain'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32' }}>
                    <CheckCircle fontSize="medium" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                borderLeft: '6px solid #1565C0',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-3px)' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t('pm.kpiTotalFuelSaved')}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#1565C0', my: 0.5 }}>
                      {activeData.total_fuel_saved_litres.toLocaleString()} L
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {dateRange === '7d'
                        ? (language === 'mr' ? 'दररोज (~₹१.०४ लाख दररोज)' : 'Per day (~₹1.04 Lakhs daily)')
                        : dateRange === '30d'
                        ? (language === 'mr' ? '३० दिवसांत (~₹४.७० लाख)' : 'Past 30d (~₹4.70 Lakhs)')
                        : (language === 'mr' ? '९० दिवसांत (~₹१४.६ लाख)' : 'Past 90d (~₹14.6 Lakhs)')}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(21, 101, 192, 0.1)', color: '#1565C0' }}>
                    <LocalGasStation fontSize="medium" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Section 2: Alert Performance (Ignore Rate) & Time Patterns */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Alert Performance Chart */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620' }}>
                    {t('pm.alertPerfTitle')}
                  </Typography>
                }
                subheader={t('pm.alertPerfSub')}
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={localizedAlertPerf}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                      <XAxis dataKey="typeName" tick={{ fill: '#37474F', fontSize: 12, fontWeight: 600 }} />
                      <YAxis tick={{ fill: '#37474F', fontSize: 12 }} />
                      <RechartsTooltip
                        formatter={(value: any, name: any, item: any) => [
                          `${value} (${name === (language === 'mr' ? 'दुर्लक्षित' : 'Ignored') ? `${item.payload.ignore_rate}% ${language === 'mr' ? 'दुर्लक्ष दर' : 'ignore rate'}` : `${100 - item.payload.ignore_rate}% ${language === 'mr' ? 'कृती दर' : 'action rate'}`})`,
                          name,
                        ]}
                        contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="ignored" name={language === 'mr' ? 'दुर्लक्षित' : 'Ignored'} fill="#D32F2F" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="acted" name={language === 'mr' ? 'कृती केली' : 'Acted'} fill="#367C2B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                <MuiAlert
                  severity="warning"
                  icon={<WarningAmber />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: '#FFF8E1',
                    border: '1px solid #FFE082',
                    color: '#B78103',
                  }}
                >
                  <strong>{language === 'mr' ? '💡 मुख्य अंतर्दृष्टी:' : '💡 Key Insight:'}</strong>{' '}
                  {language === 'mr'
                    ? '"कामाच्या वेगात बदल अलर्टचा दुर्लक्ष दर ७५% (१५०/२०० दुर्लक्षित) आहे — मजकूर सुलभ करणे किंवा थ्रेशोल्ड समायोजित केल्याने प्रतिसाद वाढण्यास मदत होऊ शकते."'
                    : '"Speed Anomaly alert has a 75% ignore rate (150/200 ignored) — data suggests simplifying copy or adjusting thresholds could improve operator response."'}
                </MuiAlert>
              </CardContent>
            </Card>
          </Grid>

          {/* Time Patterns Chart */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620' }}>
                    {t('pm.timePatternsTitle')}
                  </Typography>
                }
                subheader={t('pm.timePatternsSub')}
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={localizedTimePatterns} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="ignoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#D32F2F" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                      <XAxis dataKey="timeName" tick={{ fill: '#37474F', fontSize: 12, fontWeight: 600 }} />
                      <YAxis unit="%" tick={{ fill: '#37474F', fontSize: 12 }} />
                      <RechartsTooltip
                        formatter={(value: any) => [`${value}%`, language === 'mr' ? 'दुर्लक्ष दर' : 'Ignore Rate']}
                        contentStyle={{ borderRadius: 8 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ignore_rate"
                        name={language === 'mr' ? 'दुर्लक्ष दर %' : 'Ignore Rate %'}
                        stroke="#D32F2F"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#ignoreGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                <MuiAlert
                  severity="info"
                  icon={<Schedule />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: '#E8F5E9',
                    border: '1px solid #C8E6C9',
                    color: '#2E7D32',
                  }}
                >
                  <strong>{language === 'mr' ? '💡 वेळेची अंतर्दृष्टी:' : '💡 Timing Insight:'}</strong>{' '}
                  {language === 'mr'
                    ? '"शेतकरी काम संपवत असताना संध्याकाळच्या सूचनांचा दुर्लक्ष दर ६५% आहे — गैर-तातडीच्या सूचना सकाळी ६:०० वाजता पाठवण्याचा विचार करा."'
                    : '"Evening alerts show a 65% ignore rate as farmers conclude daily field work — consider scheduling non-urgent digests for morning hours (6:00 AM).'}
                </MuiAlert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Section 3: Action Effectiveness Table & Farmer Segments */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Action Effectiveness Table */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620' }}>
                    {t('pm.actionEffTitle')}
                  </Typography>
                }
                subheader={t('pm.actionEffSub')}
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#F8FAF9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#1E4620' }}>
                          {language === 'mr' ? 'शिफारस केलेली कृती' : 'Recommended Action'}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#1E4620' }}>
                          {language === 'mr' ? 'प्रयत्न केले' : 'Tried'}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#1E4620' }}>
                          {language === 'mr' ? 'यश' : 'Success'}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#1E4620' }}>
                          {language === 'mr' ? 'यश दर' : 'Success Rate'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#1E4620' }}>
                          {language === 'mr' ? 'स्थिती' : 'Status'}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {localizedActionEffectiveness.map((row, index) => {
                        const isLow = row.success_rate < 50;
                        return (
                          <TableRow
                            key={index}
                            sx={{
                              bgcolor: isLow ? 'rgba(211, 47, 47, 0.04)' : 'inherit',
                              '&:hover': { bgcolor: 'rgba(54, 124, 43, 0.04)' },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 700, color: '#263238' }}>
                              {row.action}
                              <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                                {language === 'mr' ? 'श्रेणी' : 'Category'}: {row.category}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{row.tried}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#2E7D32' }}>{row.success}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Box sx={{ width: 60 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={row.success_rate}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: '#ECEFF1',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: isLow ? '#D32F2F' : row.success_rate > 80 ? '#2E7D32' : '#367C2B',
                                      },
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 800, color: isLow ? '#D32F2F' : '#2E7D32', minWidth: 35 }}
                                >
                                  {row.success_rate}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {isLow ? (
                                <Chip
                                  label={language === 'mr' ? 'सुधारणा संधी' : 'Opportunity Area'}
                                  size="small"
                                  color="warning"
                                  sx={{ fontWeight: 700 }}
                                />
                              ) : (
                                <Chip
                                  label={language === 'mr' ? 'उच्च परिणामकारकता' : 'High Efficacy'}
                                  size="small"
                                  color="success"
                                  sx={{ fontWeight: 700 }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ p: 2.5 }}>
                  <MuiAlert
                    severity="info"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      bgcolor: '#FFF8E1',
                      border: '1px solid #FFE082',
                      color: '#B78103',
                    }}
                  >
                    <strong>{language === 'mr' ? '💡 परिणामकारकता अंतर्दृष्टी:' : '💡 Effectiveness Insight:'}</strong>{' '}
                    {language === 'mr'
                      ? '"चढावर जाताना थ्रॉटल कमी करण्याचा सल्ला ४५% यश दर्शवतो — सल्ल्याच्या अचूकतेचे पुनरावलोकन करणे किंवा अतिरिक्त संदर्भ जोडल्याने परिणाम सुधारू शकतात."'
                      : '"Reduce throttle advice shows 45% success rate — reviewing guidance accuracy or adding slope-specific context may improve operator effectiveness."'}
                  </MuiAlert>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Farmer Segments Breakdown */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620' }}>
                    {t('pm.farmerSegTitle')}
                  </Typography>
                }
                subheader={t('pm.farmerSegSub')}
              />
              <Divider />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ height: 260, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={localizedFarmerSegments}
                      margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                      <XAxis type="number" unit="%" domain={[0, 60]} tick={{ fill: '#37474F', fontSize: 12 }} />
                      <YAxis dataKey="segmentName" type="category" tick={{ fill: '#37474F', fontSize: 11, fontWeight: 700 }} width={130} />
                      <RechartsTooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${val}% ${language === 'mr' ? 'कृती दर' : 'Action Rate'} (${item.payload.farmers} ${language === 'mr' ? 'शेतकरी' : 'farmers'})`,
                          language === 'mr' ? 'सहभाग' : 'Engagement',
                        ]}
                        contentStyle={{ borderRadius: 8 }}
                      />
                      <Bar dataKey="action_rate" name={language === 'mr' ? 'कृती दर %' : 'Action Rate %'} radius={[0, 6, 6, 0]}>
                        {activeData.farmer_segments.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                <MuiAlert
                  severity="info"
                  icon={<Insights />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: '#E8F5E9',
                    border: '1px solid #C8E6C9',
                    color: '#2E7D32',
                  }}
                >
                  <strong>{language === 'mr' ? '💡 विभाग अंतर्दृष्टी:' : '💡 Segment Insight:'}</strong>{' '}
                  {language === 'mr'
                    ? '"लहान शेतांचा कृती दर २८% आहे — ऑडिओ-आधारित स्थानिक भाषा सूचना आणि सुलभ १-टॅप इन-कॅब पर्यायांनी सहभाग वाढू शकतो."'
                    : '"Small acreage farms show a 28% action rate — data indicates audio-first vernacular prompts and 1-tap in-cab triggers could boost engagement."'}
                </MuiAlert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Section 4: Impact Metrics (Proof It Works) */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', mb: 4, bgcolor: '#FFFFFF' }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620' }}>
                {t('pm.impactTitle')}
              </Typography>
            }
            subheader={t('pm.impactSub')}
          />
          <Divider />
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(54, 124, 43, 0.06)',
                    border: '1px solid rgba(54, 124, 43, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#367C2B' }}>
                    {activeData.farmers_acted.toLocaleString()}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E4620', mt: 1 }}>
                    {language === 'mr' ? 'शेतकऱ्यांनी कृती केली' : 'Farmers Took Action'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {language === 'mr' ? `एकूण ${activeData.total_alerts.toLocaleString()} पैकी` : `Out of ${activeData.total_alerts.toLocaleString()} total targeted`}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(46, 125, 50, 0.06)',
                    border: '1px solid rgba(46, 125, 50, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#2E7D32' }}>
                    {activeData.avg_fuel_saved_litres} L
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E4620', mt: 1 }}>
                    {language === 'mr' ? 'बचत / शेतकरी / दिवस' : 'Saved / Farmer / Day'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {language === 'mr' ? 'दुर्लक्षित सूचनांसाठी ० लिटर बचत' : '0 litres saved for ignored alerts'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(21, 101, 192, 0.06)',
                    border: '1px solid rgba(21, 101, 192, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#1565C0' }}>
                    {activeData.total_fuel_saved_litres.toLocaleString()} L
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E4620', mt: 1 }}>
                    {language === 'mr' ? 'एकूण इंधन बचत' : 'Total Fuel Saved'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {language === 'mr' ? 'सक्रिय यंत्र ताफ्यामध्ये' : 'Across active machine fleet'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(230, 81, 0, 0.06)',
                    border: '1px solid rgba(230, 81, 0, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#E65100' }}>
                    {activeData.avg_improvement_percent}%
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E4620', mt: 1 }}>
                    {language === 'mr' ? 'सरासरी कार्यक्षमता वाढ' : 'Avg. Efficiency Gain'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {language === 'mr' ? 'निष्क्रिय वेळेतील पुष्टी केलेली घट' : 'Confirmed reduction in idle waste'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2.5, borderRadius: 2.5, bgcolor: '#F1F8E9', border: '1px solid #DCEDC8' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                💰 {t('pm.executiveTakeaway')}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Section 5: Product Insights & Recommendations */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', mb: 2 }}>
          <CardHeader
            avatar={<AutoAwesome sx={{ color: '#FFB300' }} />}
            title={
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E4620' }}>
                {t('pm.productRecTitle')}
              </Typography>
            }
            subheader={t('pm.productRecSub')}
          />
          <Divider />
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              {localizedRecommendations.map((rec) => (
                <Box
                  key={rec.priority}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: '1px solid #E0E0E0',
                    bgcolor: rec.priority === 1 ? '#FFFDE7' : '#FFFFFF',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#367C2B',
                      boxShadow: '0 4px 12px rgba(54, 124, 43, 0.1)',
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={2}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: rec.priority === 1 ? '#D32F2F' : rec.priority === 2 ? '#367C2B' : '#FF9800',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1rem',
                          flexShrink: 0,
                          mt: 0.5,
                        }}
                      >
                        {rec.priority}
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E4620', mb: 0.5 }}>
                          {rec.title}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                          <strong>{language === 'mr' ? '📊 अंतर्दृष्टी:' : '📊 Insight:'}</strong> {rec.insight}
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          <strong>{language === 'mr' ? '💡 शिफारस:' : '💡 Suggestion:'}</strong> {rec.suggestion}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, flexShrink: 0 }}>
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: '1rem !important' }} />}
                        label={rec.impact}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{
                          fontWeight: 800,
                          px: 1,
                          py: 2,
                          bgcolor: 'rgba(54, 124, 43, 0.05)',
                          borderColor: '#367C2B',
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PMDashboardPage;
