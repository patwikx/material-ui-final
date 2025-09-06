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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  Undo as RefundIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { PaymentStatus } from '@prisma/client';
import { getPaymentById, PaymentData, refundPayment } from '@/lib/actions/payment-management';
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

const PaymentDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  const { businessUnitId } = useBusinessUnit();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const paymentData = await getPaymentById(paymentId);
        if (paymentData) {
          setPayment(paymentData);
        } else {
          setSnackbar({
            open: true,
            message: 'Payment not found',
            severity: 'error',
          });
          router.push(`/${businessUnitId}/admin/operations/payments`);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load payment details',
          severity: 'error',
        });
        console.error('Error loading payment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId && businessUnitId) {
      loadPayment();
    }
  }, [paymentId, router, businessUnitId]);

  const handleRefund = async () => {
    if (!payment) return;

    setActionLoading(true);
    try {
      const result = await refundPayment(payment.id, refundReason);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Payment refunded successfully',
          severity: 'success',
        });
        router.refresh();
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
        message: 'An unexpected error occurred while processing refund',
        severity: 'error',
      });
      console.error('Error refunding payment:', error);
    } finally {
      setActionLoading(false);
      setRefundDialog(false);
      setRefundReason('');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not processed';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: string | number, currency: string) => {
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

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          backgroundColor: darkTheme.background,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ color: darkTheme.text }} />
      </Container>
    );
  }

  if (!payment) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          backgroundColor: darkTheme.background,
          minHeight: '100vh',
          color: darkTheme.text,
        }}
      >
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
          Payment not found
        </Alert>
      </Container>
    );
  }
  
  const isRefundable = payment.status === 'SUCCEEDED' || payment.status === 'PAID';

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
              onClick={() => router.push(`/${businessUnitId}/admin/operations/payments`)}
              disabled={actionLoading}
              sx={{
                mr: 2,
                color: darkTheme.textSecondary,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                  color: darkTheme.text,
                  transform: 'scale(1.1)',
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
            Payment Details
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
            View and manage payment transaction details
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Payment Overview */}
          <Card
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: darkTheme.text,
                      fontSize: '2.5rem',
                      mb: 1,
                    }}
                  >
                    {formatCurrency(payment.amount, payment.currency)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={payment.status}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        backgroundColor: darkTheme[getPaymentStatusBg(payment.status)],
                        color: darkTheme[getPaymentStatusColor(payment.status)],
                        fontWeight: 600,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                    <Chip
                      icon={<PaymentIcon />}
                      label={payment.method.replace('_', ' ')}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        backgroundColor: darkTheme.selectedBg,
                        color: darkTheme.primary,
                        fontWeight: 600,
                        transition: 'all 0.2s ease-in-out',
                        '& .MuiChip-icon': { color: darkTheme.primary, transition: 'color 0.2s ease-in-out' },
                        '&:hover': { transform: 'scale(1.05)' },
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isRefundable && (
                    <Button
                      startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <RefundIcon />}
                      onClick={() => setRefundDialog(true)}
                      disabled={actionLoading}
                      sx={{
                        backgroundColor: darkTheme.error,
                        color: 'white',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: darkTheme.errorHover,
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          backgroundColor: darkTheme.textSecondary,
                          color: darkTheme.surface,
                          opacity: 0.5,
                        },
                      }}
                    >
                      {actionLoading ? 'Processing...' : 'Refund'}
                    </Button>
                  )}
                </Box>
              </Box>

              {payment.providerPaymentId && (
                <Typography
                  sx={{
                    color: darkTheme.textSecondary,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    mb: 1,
                  }}
                >
                  Transaction ID: {payment.providerPaymentId}
                </Typography>
              )}

              {payment.paymongoPayment?.paymentIntentId && (
                <Typography
                  sx={{
                    color: darkTheme.textSecondary,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  Payment Intent: {payment.paymongoPayment.paymentIntentId}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Reservation Information */}
          {payment.reservation && (
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
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
                  Reservation Information
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <ReceiptIcon sx={{ fontSize: 40, color: darkTheme.textSecondary }} />
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: darkTheme.text,
                        fontSize: '1.25rem',
                        mb: 0.5,
                      }}
                    >
                      {payment.reservation.confirmationNumber}
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary }}>
                      Reservation Reference
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ color: darkTheme.textSecondary }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                        {payment.reservation.guest.firstName} {payment.reservation.guest.lastName}
                      </Typography>
                      <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                        {payment.reservation.guest.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HotelIcon sx={{ color: darkTheme.textSecondary }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: darkTheme.text }}>
                        {payment.reservation.businessUnit.displayName}
                      </Typography>
                      <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                        Property
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Payment Breakdown */}
          {payment.lineItems.length > 0 && (
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
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
                  Payment Breakdown
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {payment.lineItems.map((item, index) => (
                    <Box key={item.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 0.5 }}>
                            {item.description}
                          </Typography>
                          <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                            Quantity: {item.quantity} × {formatCurrency(item.unitPrice, payment.currency)}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: darkTheme.text, fontSize: '1.1rem' }}>
                          {formatCurrency(item.totalAmount, payment.currency)}
                        </Typography>
                      </Box>
                      {index < payment.lineItems.length - 1 && <Divider sx={{ borderColor: darkTheme.border }} />}
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2, borderColor: darkTheme.border }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700, color: darkTheme.text, fontSize: '1.25rem' }}>
                      Total Amount
                    </Typography>
                    <Typography sx={{ fontWeight: 900, color: darkTheme.text, fontSize: '1.5rem' }}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          <Card
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
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
                Payment Details
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: darkTheme.text, fontWeight: 600, mb: 0.5 }}>
                    Payment Method:
                  </Typography>
                  <Typography sx={{ color: darkTheme.textSecondary }}>
                    {payment.method.replace('_', ' ')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ color: darkTheme.text, fontWeight: 600, mb: 0.5 }}>
                    Status:
                  </Typography>
                  <Chip
                    label={payment.status}
                    size="small"
                    sx={{
                      textTransform: 'capitalize',
                      backgroundColor: darkTheme[getPaymentStatusBg(payment.status)],
                      color: darkTheme[getPaymentStatusColor(payment.status)],
                      fontWeight: 600,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ color: darkTheme.text, fontWeight: 600, mb: 0.5 }}>
                    Created:
                  </Typography>
                  <Typography sx={{ color: darkTheme.textSecondary }}>
                    {formatDate(payment.createdAt)}
                  </Typography>
                </Box>

                {payment.processedAt && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: darkTheme.text, fontWeight: 600, mb: 0.5 }}>
                      Processed:
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary }}>
                      {formatDate(payment.processedAt)}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" sx={{ color: darkTheme.text, fontWeight: 600, mb: 0.5 }}>
                    Last Updated:
                  </Typography>
                  <Typography sx={{ color: darkTheme.textSecondary }}>
                    {formatDate(payment.updatedAt)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Metadata */}
          {payment.providerMetadata && Object.keys(payment.providerMetadata).length > 0 && (
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
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
                  Additional Information
                </Typography>

                <Box sx={{
                  backgroundColor: darkTheme.background,
                  p: 3,
                  borderRadius: '8px',
                  border: `1px solid ${darkTheme.border}`,
                  overflowX: 'auto',
                }}>
                  <pre style={{ margin: 0, fontSize: '0.875rem', color: darkTheme.textSecondary }}>
                    {JSON.stringify(payment.providerMetadata, null, 2)}
                  </pre>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Refund Dialog */}
        <Dialog
          open={refundDialog}
          onClose={() => setRefundDialog(false)}
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
            Refund Payment
          </DialogTitle>
          <DialogContent>
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
                  transition: 'all 0.2s ease-in-out',
                },
                '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
              }}
            />

            <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                {formatCurrency(payment.amount, payment.currency)}
              </Typography>
              <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                {payment.reservation?.confirmationNumber || 'No reservation'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setRefundDialog(false)}
              disabled={actionLoading}
              sx={{
                color: darkTheme.textSecondary,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  color: darkTheme.textSecondary,
                  opacity: 0.5,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              variant="contained"
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <RefundIcon />}
              sx={{
                backgroundColor: darkTheme.error,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: darkTheme.errorHover,
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  backgroundColor: darkTheme.textSecondary,
                  color: darkTheme.surface,
                },
              }}
            >
              {actionLoading ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default PaymentDetailPage;