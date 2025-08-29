'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  Undo as RefundIcon,
  ChevronRightTwoTone,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { PaymentData, refundPayment, updatePaymentStatus } from '@/lib/actions/payment-management';
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

// FIX: Export the interface to resolve the TypeScript error
export interface PaymentListPageProps {
  initialPayments: PaymentData[];
}

const PaymentListPage: React.FC<PaymentListPageProps> = ({ initialPayments }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [payments, setPayments] = useState<PaymentData[]>(initialPayments);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    payment: PaymentData | null;
    action: 'status' | 'refund' | null;
  }>({
    open: false,
    payment: null,
    action: null,
  });
  const [newStatus, setNewStatus] = useState<PaymentStatus>('PENDING');
  const [refundReason, setRefundReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdateStatus = async () => {
    if (!actionDialog.payment) return;

    setLoading(actionDialog.payment.id);
    try {
      const result = await updatePaymentStatus(actionDialog.payment.id, newStatus);
      if (result.success) {
        setPayments(prev => prev.map(p => 
          p.id === actionDialog.payment!.id ? { ...p, status: newStatus } : p
        ));
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update payment status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating payment status',
        severity: 'error',
      });
    } finally {
      setLoading(null);
      setActionDialog({ open: false, payment: null, action: null });
      setNewStatus('PENDING');
    }
  };

  const handleRefund = async () => {
    if (!actionDialog.payment) return;

    setLoading(actionDialog.payment.id);
    try {
      const result = await refundPayment(actionDialog.payment.id, refundReason);
      if (result.success) {
        setPayments(prev => prev.map(p => 
          p.id === actionDialog.payment!.id ? { ...p, status: 'REFUNDED' as PaymentStatus } : p
        ));
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to refund payment',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while processing refund',
        severity: 'error',
      });
    } finally {
      setLoading(null);
      setActionDialog({ open: false, payment: null, action: null });
      setRefundReason('');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not processed';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Number(amount));
  };
  
  const getPaymentStatusColor = (status: PaymentStatus): keyof typeof darkTheme => {
    const colorMap: Record<PaymentStatus, keyof typeof darkTheme> = {
      'PENDING': 'warning',
      'PROCESSING': 'primary',
      'AWAITING_PAYMENT_METHOD': 'primary',
      'AWAITING_NEXT_ACTION': 'primary',
      'SUCCEEDED': 'success',
      'PAID': 'success',
      'PARTIAL': 'warning',
      'FAILED': 'error',
      'CANCELLED': 'error',
      'REFUNDED': 'error',
      'PARTIALLY_REFUNDED': 'error',
      'DISPUTED': 'error',
      'CHARGEBACK': 'error',
      'EXPIRED': 'error',
    };
    return colorMap[status] || 'textSecondary';
  };

  const getPaymentStatusBg = (status: PaymentStatus): keyof typeof darkTheme => {
    const bgMap: Record<PaymentStatus, keyof typeof darkTheme> = {
      'PENDING': 'warningBg',
      'PROCESSING': 'selectedBg',
      'AWAITING_PAYMENT_METHOD': 'selectedBg',
      'AWAITING_NEXT_ACTION': 'selectedBg',
      'SUCCEEDED': 'successBg',
      'PAID': 'successBg',
      'PARTIAL': 'warningBg',
      'FAILED': 'errorBg',
      'CANCELLED': 'errorBg',
      'REFUNDED': 'errorBg',
      'PARTIALLY_REFUNDED': 'errorBg',
      'DISPUTED': 'errorBg',
      'CHARGEBACK': 'errorBg',
      'EXPIRED': 'errorBg',
    };
    return bgMap[status] || 'surfaceHover';
  };

  const getPaymentMethodColor = (method: PaymentMethod): keyof typeof darkTheme => {
    const colorMap: Record<PaymentMethod, keyof typeof darkTheme> = {
      'CASH': 'success',
      'CARD': 'primary',
      'BANK_TRANSFER': 'primaryHover',
      'E_WALLET': 'warning',
      'QR_CODE': 'warning',
      'CRYPTO': 'primary',
    };
    return colorMap[method] || 'textSecondary';
  };
  
  const getPaymentMethodBg = (method: PaymentMethod): keyof typeof darkTheme => {
    const bgMap: Record<PaymentMethod, keyof typeof darkTheme> = {
      'CASH': 'successBg',
      'CARD': 'selectedBg',
      'BANK_TRANSFER': 'selectedBg',
      'E_WALLET': 'warningBg',
      'QR_CODE': 'warningBg',
      'CRYPTO': 'selectedBg',
    };
    return bgMap[method] || 'surfaceHover';
  };
  
  const allPaymentStatuses = Object.values(PaymentStatus);

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
                Payments Management
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
                Monitor and manage payment transactions across all properties and reservations.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Payment Cards */}
        {payments.length === 0 ? (
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
              <PaymentIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No payments found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
              }}
            >
              Payment transactions will appear here when guests make payments
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {payments.map((payment) => (
              <Card
                key={payment.id}
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
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                  {/* Payment Info */}
                  <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '1.25rem',
                        }}
                      >
                        {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                      <Chip
                        label={payment.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getPaymentStatusBg(payment.status)],
                          color: darkTheme[getPaymentStatusColor(payment.status)],
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={payment.method.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getPaymentMethodBg(payment.method)],
                          color: darkTheme[getPaymentMethodColor(payment.method)],
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        {payment.reservation?.confirmationNumber ? `Ref: ${payment.reservation.confirmationNumber}` : 'No reservation'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        Guest: {payment.reservation?.guest.firstName} {payment.reservation?.guest.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        Property: {payment.reservation?.businessUnit.displayName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
                    {(payment.status === 'SUCCEEDED' || payment.status === 'PAID') && (
                      <Tooltip title="Refund Payment">
                        <IconButton
                          onClick={() => setActionDialog({ open: true, payment, action: 'refund' })}
                          disabled={loading === payment.id}
                          sx={{
                            color: darkTheme.textSecondary,
                            '&:hover': {
                              backgroundColor: darkTheme.errorBg,
                              color: darkTheme.error,
                            },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <RefundIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Update Status">
                      <IconButton
                        onClick={() => {
                          setNewStatus(payment.status);
                          setActionDialog({ open: true, payment, action: 'status' });
                        }}
                        disabled={loading === payment.id}
                        sx={{
                          color: darkTheme.textSecondary,
                          '&:hover': {
                            backgroundColor: darkTheme.selectedBg,
                            color: darkTheme.primary,
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => router.push(`/${businessUnitId}/admin/operations/payments/${payment.id}`)}
                        sx={{
                          color: darkTheme.textSecondary,
                          '&:hover': {
                            backgroundColor: darkTheme.selectedBg,
                            color: darkTheme.primary,
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <ChevronRightTwoTone sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Action Dialogs */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, payment: null, action: null })}
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
            {actionDialog.action === 'status' ? 'Update Payment Status' : 'Refund Payment'}
          </DialogTitle>
          <DialogContent>
            {actionDialog.action === 'status' ? (
              <Box sx={{ pt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: darkTheme.textSecondary }}>Payment Status</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PaymentStatus)}
                    label="Payment Status"
                    sx={{
                      borderRadius: '8px',
                      backgroundColor: darkTheme.background,
                      color: darkTheme.text,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                    }}
                  >
                    {allPaymentStatuses.map(status => (
                      <MenuItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <Box sx={{ pt: 2 }}>
                <Typography sx={{ mb: 2, color: darkTheme.textSecondary, fontSize: '12px' }}>
                  Are you sure you want to refund this payment?
                </Typography>
                <TextField
                  label="Refund Reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
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
              </Box>
            )}

            {actionDialog.payment && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {formatCurrency(actionDialog.payment.amount, actionDialog.payment.currency)}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {actionDialog.payment.reservation?.confirmationNumber || 'No reservation'}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {actionDialog.payment.method.replace('_', ' ')} • {formatDate(actionDialog.payment.createdAt)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setActionDialog({ open: false, payment: null, action: null })}
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
              onClick={actionDialog.action === 'status' ? handleUpdateStatus : handleRefund}
              variant="contained"
              disabled={loading === actionDialog.payment?.id}
              sx={{
                backgroundColor: actionDialog.action === 'refund' ? darkTheme.error : darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: actionDialog.action === 'refund' ? darkTheme.errorHover : darkTheme.primaryHover
                },
                '&:disabled': { backgroundColor: darkTheme.textSecondary, color: darkTheme.surface },
              }}
            >
              {loading === actionDialog.payment?.id ?
                `${actionDialog.action === 'status' ? 'Updating' : 'Processing'}...` :
                actionDialog.action === 'status' ? 'Update Status' : 'Process Refund'
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

export default PaymentListPage;