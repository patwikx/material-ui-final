'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  LocationCity,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { ReservationData, getReservationById } from '@/lib/actions/reservations';
import { ReservationStatus } from '@prisma/client';
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

const ReservationDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;
  const { businessUnitId } = useBusinessUnit();

  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'confirm' | 'cancel' | 'update' | null;
  }>({
    open: false,
    action: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadReservation = async () => {
      try {
        const reservationData = await getReservationById(reservationId);
        if (reservationData) {
          setReservation(reservationData);
        } else {
          setSnackbar({
            open: true,
            message: 'Reservation not found',
            severity: 'error',
          });
          router.push(`/${businessUnitId}/admin/operations/reservations`);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to load reservation.`,
          severity: 'error',
        });
        console.error('Error loading reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (reservationId && businessUnitId) {
      loadReservation();
    }
  }, [reservationId, router, businessUnitId]);

  const handleConfirm = async () => {
    if (!reservation) return;

    setActionLoading(true);
    try {
      const result = await confirmReservation(reservation.id);
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
        message: `An unexpected error occurred while confirming reservation.`,
        severity: 'error',
      });
      console.error('Error confirming reservation:', error);
    } finally {
      setActionLoading(false);
      setActionDialog({ open: false, action: null });
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;

    setActionLoading(true);
    try {
      const result = await cancelReservation(reservation.id, cancelReason);
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
        message: `An unexpected error occurred while cancelling reservation.`,
        severity: 'error',
      });
      console.error('Error cancelling reservation:', error);
    } finally {
      setActionLoading(false);
      setActionDialog({ open: false, action: null });
      setCancelReason('');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
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

  const getPaymentStatusColor = (status: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'SUCCEEDED': 'success',
      'PAID': 'success',
      'PENDING': 'warning',
      'FAILED': 'error',
      'CANCELLED': 'error',
      'REFUNDED': 'error',
    };
    return colorMap[status] || 'textSecondary';
  };

  const getPaymentStatusBg = (status: string): keyof typeof darkTheme => {
    const bgMap: Record<string, keyof typeof darkTheme> = {
      'SUCCEEDED': 'successBg',
      'PAID': 'successBg',
      'PENDING': 'warningBg',
      'FAILED': 'errorBg',
      'CANCELLED': 'errorBg',
      'REFUNDED': 'errorBg',
    };
    return bgMap[status] || 'surfaceHover';
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: darkTheme.background, minHeight: '100vh', color: darkTheme.text }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Typography sx={{ color: darkTheme.text }}>Loading reservation...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!reservation) {
    return (
      <Box sx={{ backgroundColor: darkTheme.background, minHeight: '100vh', color: darkTheme.text }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error"
            sx={{
              backgroundColor: darkTheme.errorBg,
              borderColor: darkTheme.error,
              border: `1px solid`,
              borderRadius: '8px',
              color: darkTheme.error,
              fontSize: '12px',
              fontWeight: 600,
              '& .MuiAlert-icon': {
                color: darkTheme.error
              }
            }}>
            Reservation not found
          </Alert>
        </Container>
      </Box>
    );
  }

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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton
              onClick={() => router.push(`/${businessUnitId}/admin/operations/reservations`)}
              sx={{
                mr: 2,
                color: darkTheme.textSecondary,
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                  color: darkTheme.text,
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
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
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              color: darkTheme.text,
              lineHeight: 1.2,
              ml: 6,
            }}
          >
            Reservation Details
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1rem',
              ml: 6,
              maxWidth: '600px',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            View and manage reservation information
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Reservation Overview */}
          <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: darkTheme.text,
                      fontSize: '1.5rem',
                      mb: 1,
                    }}
                  >
                    {reservation.confirmationNumber}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={reservation.status}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        backgroundColor: darkTheme[getStatusBg(reservation.status)],
                        color: darkTheme[getStatusColor(reservation.status)],
                        fontWeight: 600,
                      }}
                    />
                    {reservation.paymentStatus === 'SUCCEEDED' && (
                      <Chip
                        icon={<PaymentIcon />}
                        label="Paid"
                        size="small"
                        sx={{
                          backgroundColor: darkTheme.successBg,
                          color: darkTheme.success,
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: darkTheme.success },
                        }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {reservation.status === 'PROVISIONAL' && (
                    <Button
                      startIcon={<CheckIcon />}
                      onClick={() => setActionDialog({ open: true, action: 'confirm' })}
                      sx={{
                        backgroundColor: darkTheme.success,
                        color: 'white',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        '&:hover': { backgroundColor: darkTheme.successBg, color: darkTheme.success },
                        '&:disabled': { backgroundColor: darkTheme.surface, color: darkTheme.textSecondary },
                        border: `1px solid ${darkTheme.success}`,
                      }}
                      disabled={actionLoading}
                    >
                      Confirm
                    </Button>
                  )}
                  {reservation.status !== 'CANCELLED' && reservation.status !== 'CHECKED_OUT' && (
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={() => setActionDialog({ open: true, action: 'cancel' })}
                      sx={{
                        backgroundColor: darkTheme.error,
                        color: 'white',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        '&:hover': { backgroundColor: darkTheme.errorHover },
                        '&:disabled': { backgroundColor: darkTheme.surface, color: darkTheme.textSecondary },
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>

              <Typography
                sx={{
                  fontWeight: 700,
                  color: darkTheme.text,
                  mb: 2,
                  fontSize: '1.5rem',
                }}
              >
                {formatCurrency(Number(reservation.totalAmount), reservation.currency)}
              </Typography>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                Guest Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar sx={{ width: 60, height: 60, backgroundColor: darkTheme.primary, color: 'white' }}>
                  <PersonIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: darkTheme.text,
                      fontSize: '1.25rem',
                      mb: 0.5,
                    }}
                  >
                    {reservation.guest.firstName} {reservation.guest.lastName}
                  </Typography>
                  <Typography sx={{ color: darkTheme.textSecondary, mb: 0.5 }}>
                    {reservation.guest.email}
                  </Typography>
                  {reservation.guest.phone && (
                    <Typography sx={{ color: darkTheme.textSecondary, mb: 0.5 }}>
                      {reservation.guest.phone}
                    </Typography>
                  )}
                  {reservation.guest.country && (
                    <Typography sx={{ color: darkTheme.textSecondary }}>
                      {reservation.guest.country}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                Stay Details
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarIcon sx={{ color: darkTheme.textSecondary }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                          Check-in: {formatDate(reservation.checkInDate)}
                        </Typography>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                          Check-out: {formatDate(reservation.checkOutDate)}
                        </Typography>
                        <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                          {reservation.nights} nights
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationCity sx={{ color: darkTheme.textSecondary }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                          {reservation.businessUnit.displayName}
                        </Typography>
                        <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                          {reservation.businessUnit.city}, {reservation.businessUnit.country}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon sx={{ color: darkTheme.textSecondary }} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                          {reservation.adults + reservation.children} guests
                        </Typography>
                        <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                          {reservation.adults} adults, {reservation.children} children
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: darkTheme.text, mb: 2 }}>
                    Room Details
                  </Typography>
                  {reservation.rooms.map((room) => (
                    <Box key={room.id} sx={{ mb: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                      <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                        Room {room.room?.roomNumber || 'Not Assigned'}
                      </Typography>
                      <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                        {room.room?.roomType.name || 'Not Specified'}
                      </Typography>
                      <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                        {formatCurrency(Number(room.baseRate), reservation.currency)}/night
                      </Typography>
                      <Typography sx={{ fontWeight: 600, color: darkTheme.text, fontSize: '0.875rem' }}>
                        Total: {formatCurrency(Number(room.totalAmount), reservation.currency)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {reservation.payments.length > 0 && (
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                  Payment History
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {reservation.payments.map((payment) => (
                    <Box key={payment.id} sx={{ p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                            {formatCurrency(Number(payment.amount), payment.currency)}
                          </Typography>
                          <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                            {payment.method.replace('_', ' ')} • {formatDateTime(payment.createdAt)}
                          </Typography>
                        </Box>
                        <Chip
                          label={payment.status}
                          size="small"
                          sx={{
                            textTransform: 'capitalize',
                            backgroundColor: darkTheme[getPaymentStatusBg(payment.status)],
                            color: darkTheme[getPaymentStatusColor(payment.status)],
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Special Requests & Notes */}
          {(reservation.specialRequests || reservation.internalNotes) && (
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                  Additional Information
                </Typography>

                {reservation.specialRequests && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: darkTheme.text, fontWeight: 600, mb: 1 }}>
                      Special Requests:
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary, fontStyle: 'italic' }}>
                      {reservation.specialRequests}
                    </Typography>
                  </Box>
                )}

                {reservation.internalNotes && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: darkTheme.text, fontWeight: 600, mb: 1 }}>
                      Internal Notes:
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary }}>
                      {reservation.internalNotes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                Reservation Metadata
              </Typography>

              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  Created: {formatDateTime(reservation.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  Last Updated: {formatDateTime(reservation.updatedAt)}
                </Typography>
                {reservation.source && (
                  <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                    Source: {reservation.source}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Action Dialogs */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, action: null })}
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
            {actionDialog.action === 'confirm' ? 'Confirm Reservation' : 'Cancel Reservation'}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2, color: darkTheme.textSecondary, fontSize: '12px' }}>
              Are you sure you want to {actionDialog.action} this reservation?
            </Typography>

            {actionDialog.action === 'cancel' && (
              <TextField
                label="Cancellation Reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                multiline
                rows={3}
                fullWidth
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& fieldset': { borderColor: darkTheme.border },
                    '&:hover fieldset': { borderColor: darkTheme.primary },
                    '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                  },
                  '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                }}
              />
            )}

            <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                {reservation.confirmationNumber}
              </Typography>
              <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                {reservation.guest.firstName} {reservation.guest.lastName}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setActionDialog({ open: false, action: null })}
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
              Cancel
            </Button>
            <Button
              onClick={actionDialog.action === 'confirm' ? handleConfirm : handleCancel}
              variant="contained"
              disabled={actionLoading}
              sx={{
                backgroundColor: actionDialog.action === 'confirm' ? darkTheme.success : darkTheme.error,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: actionDialog.action === 'confirm' ? darkTheme.successBg : darkTheme.errorHover
                },
                '&:disabled': { backgroundColor: darkTheme.textSecondary, color: darkTheme.surface },
              }}
            >
              {actionLoading ?
                `${actionDialog.action === 'confirm' ? 'Confirming' : 'Cancelling'}...` :
                actionDialog.action === 'confirm' ? 'Confirm' : 'Cancel Reservation'
              }
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

export default ReservationDetailPage;