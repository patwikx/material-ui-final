'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  BookOnline as ReservationIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  ChevronRightTwoTone,
  LocationCity,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { ReservationData } from '@/lib/actions/reservations';
import { ReservationStatus, PaymentStatus } from '@prisma/client';
import { cancelReservation, confirmReservation } from '@/lib/actions/reservation-management';
import { useBusinessUnit } from '@/context/business-unit-context';

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
  errorHover: '#b91c1c',
};

interface ReservationListPageProps {
  initialReservations: ReservationData[];
}

const ReservationListPage: React.FC<ReservationListPageProps> = ({ initialReservations }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    reservation: ReservationData | null;
    action: 'confirm' | 'cancel' | null;
  }>({
    open: false,
    reservation: null,
    action: null,
  });
  const [cancelAlert, setCancelAlert] = useState<{
    open: boolean;
    reservation: ReservationData | null;
  }>({
    open: false,
    reservation: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!actionDialog.reservation) return;

    setLoadingId(actionDialog.reservation.id);
    try {
      const result = await confirmReservation(actionDialog.reservation.id);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Reservation confirmed successfully',
          severity: 'success',
        });
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to confirm reservation',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred while confirming reservation.',
        severity: 'error',
      });
    } finally {
      setLoadingId(null);
      setActionDialog({ open: false, reservation: null, action: null });
    }
  };

  const handleCancel = async () => {
    if (!cancelAlert.reservation) return;

    setLoadingId(cancelAlert.reservation.id);
    try {
      const result = await cancelReservation(cancelAlert.reservation.id, 'Cancelled by admin');
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Reservation cancelled successfully',
          severity: 'success',
        });
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to cancel reservation',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred while cancelling reservation.',
        severity: 'error',
      });
    } finally {
      setLoadingId(null);
      setCancelAlert({ open: false, reservation: null });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Number(amount));
  };

  const getStatusColor = (status: ReservationStatus): keyof typeof darkTheme => {
    const colorMap: Record<ReservationStatus, keyof typeof darkTheme> = {
      'PENDING': 'warning',
      'PROVISIONAL': 'warning',
      'INQUIRY': 'primary',
      'CONFIRMED': 'success',
      'CHECKED_IN': 'primary',
      'CHECKED_OUT': 'textSecondary',
      'CANCELLED': 'error',
      'NO_SHOW': 'error',
      'WALKED_IN': 'primary',
    };
    return colorMap[status] || 'textSecondary';
  };

  const getStatusBg = (status: ReservationStatus): keyof typeof darkTheme => {
    const bgMap: Record<ReservationStatus, keyof typeof darkTheme> = {
      'PENDING': 'warningBg',
      'PROVISIONAL': 'warningBg',
      'INQUIRY': 'selectedBg',
      'CONFIRMED': 'successBg',
      'CHECKED_IN': 'selectedBg',
      'CHECKED_OUT': 'surfaceHover',
      'CANCELLED': 'errorBg',
      'NO_SHOW': 'errorBg',
      'WALKED_IN': 'selectedBg',
    };
    return bgMap[status] || 'surfaceHover';
  };
  
  const getPaymentStatusColor = (status: PaymentStatus): keyof typeof darkTheme => {
    const colorMap: Record<PaymentStatus, keyof typeof darkTheme> = {
      'SUCCEEDED': 'success',
      'PAID': 'success',
      'PENDING': 'warning',
      'PARTIAL': 'warning',
      'FAILED': 'error',
      'CANCELLED': 'error',
      'REFUNDED': 'error',
      'PROCESSING': 'primary',
      'AWAITING_PAYMENT_METHOD': 'primary',
      'AWAITING_NEXT_ACTION': 'primary',
      'PARTIALLY_REFUNDED': 'error',
      'DISPUTED': 'error',
      'CHARGEBACK': 'error',
      'EXPIRED': 'error',
    };
    return colorMap[status] || 'textSecondary';
  };

  const getPaymentStatusBg = (status: PaymentStatus): keyof typeof darkTheme => {
    const bgMap: Record<PaymentStatus, keyof typeof darkTheme> = {
      'SUCCEEDED': 'successBg',
      'PAID': 'successBg',
      'PENDING': 'warningBg',
      'PARTIAL': 'warningBg',
      'FAILED': 'errorBg',
      'CANCELLED': 'errorBg',
      'REFUNDED': 'errorBg',
      'PROCESSING': 'selectedBg',
      'AWAITING_PAYMENT_METHOD': 'selectedBg',
      'AWAITING_NEXT_ACTION': 'selectedBg',
      'PARTIALLY_REFUNDED': 'errorBg',
      'DISPUTED': 'errorBg',
      'CHARGEBACK': 'errorBg',
      'EXPIRED': 'errorBg',
    };
    return bgMap[status] || 'surfaceHover';
  };

  const reservations = initialReservations || [];

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ flex: 1 }}>
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
                Operations Management
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
                Reservations Management
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
                Manage guest reservations, check-ins, check-outs, and booking status across all properties.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Reservation Cards */}
        {reservations.length === 0 ? (
          <Box
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              p: 6,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                backgroundColor: darkTheme.selectedBg,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ReservationIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
            </Box>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: darkTheme.text,
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              No reservations found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
              }}
            >
              Reservations will appear here when guests make bookings
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reservations.map((reservation) => (
              <Card
                key={reservation.id}
                sx={{
                  backgroundColor: darkTheme.surface,
                  borderRadius: '8px',
                  border: `1px solid ${darkTheme.border}`,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: darkTheme.surfaceHover,
                    borderColor: darkTheme.primary,
                  },
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Reservation Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '1.25rem',
                        }}
                      >
                        {reservation.confirmationNumber}
                      </Typography>
                      <Chip
                        label={reservation.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getStatusBg(reservation.status)],
                          color: darkTheme[getStatusColor(reservation.status)],
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={<PaymentIcon sx={{ fontSize: 12 }} />}
                        label={reservation.paymentStatus.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getPaymentStatusBg(reservation.paymentStatus)],
                          color: darkTheme[getPaymentStatusColor(reservation.paymentStatus)],
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: darkTheme[getPaymentStatusColor(reservation.paymentStatus)],
                            fontSize: 12,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          {reservation.guest.firstName} {reservation.guest.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationCity sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          {reservation.businessUnit.displayName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Actions - Reversed order with improved sizing */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
                    <Stack direction="row" spacing={1}>
                      {reservation.status === ReservationStatus.PENDING && (
                        <Tooltip title="Confirm Reservation">
                          <Button
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => setActionDialog({ open: true, reservation, action: 'confirm' })}
                            disabled={loadingId === reservation.id}
                            sx={{
                              backgroundColor: darkTheme.success,
                              color: 'white',
                              textTransform: 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              minWidth: '100px',
                              height: '36px',
                              '&:hover': { backgroundColor: darkTheme.successBg, color: darkTheme.success },
                              '&:disabled': { backgroundColor: darkTheme.surface, color: darkTheme.textSecondary },
                            }}
                          >
                            Confirm
                          </Button>
                        </Tooltip>
                      )}
                      
                      {/* View Details - Now first in order and bigger */}
                      <Tooltip title="View Details">
                        <Button
                          variant="outlined"
                          endIcon={<ChevronRightTwoTone sx={{ fontSize: 16 }} />}
                          onClick={() => router.push(`/${businessUnitId}/admin/operations/reservations/${reservation.id}`)}
                          sx={{
                            borderColor: darkTheme.border,
                            color: darkTheme.text,
                            backgroundColor: darkTheme.surface,
                            textTransform: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '8px',
                            minWidth: '120px',
                            height: '36px',
                            '&:hover': {
                              backgroundColor: darkTheme.surfaceHover,
                              borderColor: darkTheme.primary,
                              color: darkTheme.primary,
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Tooltip>

                      {/* Cancel - Same size as View Details */}
                      {(reservation.status === ReservationStatus.PENDING || reservation.status === ReservationStatus.CONFIRMED || reservation.status === ReservationStatus.PROVISIONAL) && (
                        <Tooltip title="Cancel Reservation">
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => setCancelAlert({ open: true, reservation })}
                            disabled={loadingId === reservation.id}
                            sx={{
                              borderColor: darkTheme.error,
                              color: darkTheme.error,
                              backgroundColor: darkTheme.surface,
                              textTransform: 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              minWidth: '120px',
                              height: '36px',
                              '&:hover': { 
                                backgroundColor: darkTheme.errorBg,
                                borderColor: darkTheme.errorHover,
                                color: darkTheme.errorHover,
                              },
                              '&:disabled': { 
                                backgroundColor: darkTheme.surface, 
                                color: darkTheme.textSecondary,
                                borderColor: darkTheme.border,
                              },
                            }}
                          >
                            Cancel
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Confirm Dialog */}
        <Dialog
          open={actionDialog.open && actionDialog.action === 'confirm'}
          onClose={() => setActionDialog({ open: false, reservation: null, action: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: darkTheme.text, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Confirm Reservation
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2, color: darkTheme.textSecondary, fontSize: '12px' }}>
              Are you sure you want to confirm this reservation?
            </Typography>

            {actionDialog.reservation && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {actionDialog.reservation.confirmationNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {actionDialog.reservation.guest.firstName} {actionDialog.reservation.guest.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {formatDate(actionDialog.reservation.checkInDate)} - {formatDate(actionDialog.reservation.checkOutDate)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setActionDialog({ open: false, reservation: null, action: null })}
              sx={{
                color: darkTheme.textSecondary,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                },
              }}
            >
              Close
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              disabled={loadingId === actionDialog.reservation?.id}
              sx={{
                backgroundColor: darkTheme.success,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: darkTheme.successBg
                },
                '&:disabled': { backgroundColor: darkTheme.textSecondary, color: darkTheme.surface },
              }}
            >
              {loadingId === actionDialog.reservation?.id ? 'Confirming...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Alert Dialog */}
        <Dialog
          open={cancelAlert.open}
          onClose={() => setCancelAlert({ open: false, reservation: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.error}`,
            },
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 600, 
            color: darkTheme.error, 
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <WarningIcon sx={{ fontSize: 20 }} />
            Cancel Reservation
          </DialogTitle>
          <DialogContent>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                backgroundColor: darkTheme.warningBg,
                borderColor: darkTheme.warning,
                color: darkTheme.warning,
                '& .MuiAlert-icon': { color: darkTheme.warning }
              }}
            >
              This action cannot be undone. The reservation will be permanently cancelled.
            </Alert>
            
            <Typography sx={{ mb: 2, color: darkTheme.text, fontSize: '14px' }}>
              Are you sure you want to cancel this reservation?
            </Typography>

            {cancelAlert.reservation && (
              <Box sx={{ 
                mt: 2, 
                p: 3, 
                backgroundColor: darkTheme.background, 
                borderRadius: '8px', 
                border: `1px solid ${darkTheme.border}` 
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                  {cancelAlert.reservation.confirmationNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary, mb: 0.5 }}>
                  Guest: {cancelAlert.reservation.guest.firstName} {cancelAlert.reservation.guest.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  Dates: {formatDate(cancelAlert.reservation.checkInDate)} - {formatDate(cancelAlert.reservation.checkOutDate)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setCancelAlert({ open: false, reservation: null })}
              sx={{
                color: darkTheme.textSecondary,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                },
              }}
            >
              Keep Reservation
            </Button>
            <Button
              onClick={handleCancel}
              variant="contained"
              disabled={loadingId === cancelAlert.reservation?.id}
              sx={{
                backgroundColor: darkTheme.error,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: darkTheme.errorHover
                },
                '&:disabled': { backgroundColor: darkTheme.textSecondary, color: darkTheme.surface },
              }}
            >
              {loadingId === cancelAlert.reservation?.id ? 'Cancelling...' : 'Cancel Reservation'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              backgroundColor: snackbar.severity === 'success' ? darkTheme.successBg : darkTheme.errorBg,
              borderColor: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
              border: `1px solid`,
              borderRadius: '8px',
              color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
              fontSize: '12px',
              fontWeight: 600,
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ReservationListPage;