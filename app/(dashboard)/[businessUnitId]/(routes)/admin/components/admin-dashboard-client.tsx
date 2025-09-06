'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  CalendarToday,
  AttachMoney,
  Hotel,
  CheckCircle,
  Schedule,
  Person,
  Business,
  Payment,
} from '@mui/icons-material';
import { Users2 } from 'lucide-react';

// Enhanced dark theme matching BusinessUnitSwitcher aesthetic
const darkTheme = {
  background: '#0a0e13',
  surface: '#1a1f29',
  surfaceHover: '#252a35',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  selected: '#1e40af',
  selectedBg: 'rgba(59, 130, 246, 0.1)',
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.1)',
};

interface DashboardStats {
  totalReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalRevenue: number;
  totalGuests: number;
  totalRooms: number;
  occupancyRate: number;
  totalUsers: number;
  totalBusinessUnits: number;
  recentReservations: Array<{
    id: string;
    confirmationNumber: string;
    guestName: string;
    checkInDate: Date;
    checkOutDate: Date;
    status: string;
    totalAmount: string;
    currency: string;
  }>;
  recentPayments: Array<{
    id: string;
    amount: string;
    currency: string;
    status: string;
    method: string;
    guestName: string | null;
    createdAt: Date;
  }>;
  roomStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  paymentStatusBreakdown: Array<{
    status: string;
    count: number;
  }>;
}

interface AdminDashboardClientProps {
  stats: DashboardStats;
  businessUnitId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({ stats, businessUnitId }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: string): keyof typeof darkTheme => {
    const statusMap: Record<string, keyof typeof darkTheme> = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'error',
      'CHECKED_IN': 'primary',
      'CHECKED_OUT': 'textSecondary',
      'SUCCEEDED': 'success',
      'PAID': 'success',
      'FAILED': 'error',
      'AVAILABLE': 'success',
      'OCCUPIED': 'primary',
      'MAINTENANCE': 'warning',
      'OUT_OF_ORDER': 'error',
    };
    return statusMap[status] || 'textSecondary';
  };

  const getStatusBg = (status: string): keyof typeof darkTheme => {
    const statusMap: Record<string, keyof typeof darkTheme> = {
      'CONFIRMED': 'successBg',
      'PENDING': 'warningBg',
      'CANCELLED': 'errorBg',
      'CHECKED_IN': 'selectedBg',
      'CHECKED_OUT': 'surfaceHover',
      'SUCCEEDED': 'successBg',
      'PAID': 'successBg',
      'FAILED': 'errorBg',
      'AVAILABLE': 'successBg',
      'OCCUPIED': 'selectedBg',
      'MAINTENANCE': 'warningBg',
      'OUT_OF_ORDER': 'errorBg',
    };
    return statusMap[status] || 'surfaceHover';
  };

  const statCards = [
    {
      title: 'Total Reservations',
      value: stats.totalReservations.toLocaleString(),
      icon: CalendarToday,
      color: darkTheme.primary,
      bgColor: darkTheme.selectedBg,
    },
    {
      title: 'Today Check-ins',
      value: stats.todayCheckIns.toString(),
      icon: CheckCircle,
      color: darkTheme.success,
      bgColor: darkTheme.successBg,
    },
    {
      title: 'Today Check-outs',
      value: stats.todayCheckOuts.toString(),
      icon: Schedule,
      color: darkTheme.warning,
      bgColor: darkTheme.warningBg,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue, 'PHP'),
      icon: AttachMoney,
      color: darkTheme.success,
      bgColor: darkTheme.successBg,
    },
    {
      title: 'Total Guests',
      value: stats.totalGuests.toLocaleString(),
      icon: Users2,
      color: darkTheme.primary,
      bgColor: darkTheme.selectedBg,
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms.toString(),
      icon: Hotel,
      color: darkTheme.primary,
      bgColor: darkTheme.selectedBg,
    },
    {
      title: 'Occupancy Rate',
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: stats.occupancyRate > 70 ? darkTheme.success : stats.occupancyRate > 40 ? darkTheme.warning : darkTheme.error,
      bgColor: stats.occupancyRate > 70 ? darkTheme.successBg : stats.occupancyRate > 40 ? darkTheme.warningBg : darkTheme.errorBg,
    },
    {
      title: 'System Users',
      value: stats.totalUsers.toString(),
      icon: Person,
      color: darkTheme.primary,
      bgColor: darkTheme.selectedBg,
    },
    {
      title: 'Business Units',
      value: stats.totalBusinessUnits.toString(),
      icon: Business,
      color: darkTheme.primary,
      bgColor: darkTheme.selectedBg,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: darkTheme.background,
        color: darkTheme.text,
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: darkTheme.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              mb: 1,
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              color: darkTheme.text,
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Overview
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1rem',
              maxWidth: '600px',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Monitor key metrics and recent activity across your property management system.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mb: 6,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
            }}
          >
            {statCards.map((stat, index) => (
              <Card
                key={index}
                sx={{
                  backgroundColor: darkTheme.surface,
                  borderRadius: '8px',
                  border: `1px solid ${darkTheme.border}`,
                  flex: '1 1 300px',
                  minWidth: '280px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: darkTheme.primary,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: darkTheme.textSecondary,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          mb: 1,
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: darkTheme.text,
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: stat.bgColor,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <stat.icon sx={{ fontSize: 24, color: stat.color }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Recent Activity */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
            mb: 6,
          }}
        >
          {/* Recent Reservations */}
          <Card
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              flex: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: darkTheme.text,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mb: 3,
                }}
              >
                Recent Reservations
              </Typography>
              <Stack spacing={2}>
                {stats.recentReservations.map((reservation) => (
                  <Box
                    key={reservation.id}
                    sx={{
                      p: 2,
                      backgroundColor: darkTheme.background,
                      borderRadius: '8px',
                      border: `1px solid ${darkTheme.border}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: darkTheme.primary,
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                        {reservation.confirmationNumber}
                      </Typography>
                      <Chip
                        label={reservation.status}
                        size="small"
                        sx={{
                          backgroundColor: darkTheme[getStatusBg(reservation.status)],
                          color: darkTheme[getStatusColor(reservation.status)],
                          fontWeight: 600,
                          fontSize: '11px',
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                      {reservation.guestName}
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                      {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: darkTheme.text, fontSize: '0.875rem', mt: 1 }}>
                      {formatCurrency(Number(reservation.totalAmount), reservation.currency)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              flex: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: darkTheme.text,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mb: 3,
                }}
              >
                Recent Payments
              </Typography>
              <Stack spacing={2}>
                {stats.recentPayments.map((payment) => (
                  <Box
                    key={payment.id}
                    sx={{
                      p: 2,
                      backgroundColor: darkTheme.background,
                      borderRadius: '8px',
                      border: `1px solid ${darkTheme.border}`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: darkTheme.primary,
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                        {formatCurrency(Number(payment.amount), payment.currency)}
                      </Typography>
                      <Chip
                        label={payment.status}
                        size="small"
                        sx={{
                          backgroundColor: darkTheme[getStatusBg(payment.status)],
                          color: darkTheme[getStatusColor(payment.status)],
                          fontWeight: 600,
                          fontSize: '11px',
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem', mb: 0.5 }}>
                      {payment.guestName || 'Unknown Guest'}
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                      {payment.method} • {formatDate(payment.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Status Breakdowns */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
          }}
        >
          {/* Room Status Breakdown */}
          <Card
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              flex: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: darkTheme.text,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mb: 3,
                }}
              >
                Room Status
              </Typography>
              <Stack spacing={2}>
                {stats.roomStatusBreakdown.map((item) => (
                  <Box
                    key={item.status}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: darkTheme.background,
                      borderRadius: '8px',
                      border: `1px solid ${darkTheme.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Hotel sx={{ fontSize: 20, color: darkTheme[getStatusColor(item.status)] }} />
                      <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                        {item.status.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: darkTheme.text }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Payment Status Breakdown */}
          <Card
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              flex: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: darkTheme.text,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mb: 3,
                }}
              >
                Payment Status
              </Typography>
              <Stack spacing={2}>
                {stats.paymentStatusBreakdown.map((item) => (
                  <Box
                    key={item.status}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: darkTheme.background,
                      borderRadius: '8px',
                      border: `1px solid ${darkTheme.border}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Payment sx={{ fontSize: 20, color: darkTheme[getStatusColor(item.status)] }} />
                      <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                        {item.status.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: darkTheme.text }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminDashboardClient;