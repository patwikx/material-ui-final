'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
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
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QuestionAnswer as FAQIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { FAQData } from '@/lib/actions/faqs';
import { deleteFAQ, toggleFAQStatus } from '@/lib/actions/faq-management';
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
};

interface FAQListPageProps {
  initialFAQs: FAQData[];
}

const FAQListPage: React.FC<FAQListPageProps> = ({ initialFAQs }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; faq: FAQData | null }>({
    open: false,
    faq: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.faq) return;

    setLoadingId('delete');
    try {
      const result = await deleteFAQ(deleteDialog.faq.id);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'FAQ deleted successfully',
          severity: 'success',
        });
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete FAQ',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An unexpected error occurred.`,
        severity: 'error',
      });
    } finally {
      setLoadingId(null);
      setDeleteDialog({ open: false, faq: null });
    }
  };

  const handleToggleStatus = async (faqId: string, currentStatus: boolean) => {
    setLoadingId(faqId);
    try {
      const result = await toggleFAQStatus(faqId, !currentStatus);
      if (result.success) {
        setSnackbar({
          open: true,
          message: `FAQ status updated successfully`,
          severity: 'success',
        });
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An unexpected error occurred.`,
        severity: 'error',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getCategoryColor = (category: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'General': 'primary',
      'Booking': 'success',
      'Payment': 'warning',
      'Amenities': 'primary',
      'Policies': 'error',
      'Transportation': 'primary',
      'Dining': 'success',
    };
    return colorMap[category] || 'textSecondary';
  };

  const getCategoryBackground = (category: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'General': 'selectedBg',
      'Booking': 'successBg',
      'Payment': 'warningBg',
      'Amenities': 'selectedBg',
      'Policies': 'errorBg',
      'Transportation': 'selectedBg',
      'Dining': 'successBg',
    };
    return colorMap[category] || 'surfaceHover';
  };

  const faqs = initialFAQs || [];

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
                Content Management
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
                FAQs
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
                Manage frequently asked questions to help guests find answers quickly and improve their experience.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/cms/faqs/new`)}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: darkTheme.primaryHover,
                },
              }}
            >
              Create FAQ
            </Button>
          </Box>
        </Box>

        {/* FAQ Cards */}
        {faqs.length === 0 ? (
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
              <FAQIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No FAQs found
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Create your first FAQ to get started
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/cms/faqs/new`)}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { backgroundColor: darkTheme.primaryHover },
              }}
            >
              Create FAQ
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {faqs.map((faq) => (
              <Card
                key={faq.id}
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
                  {/* Icon and Question */}
                  <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={faq.category}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getCategoryBackground(faq.category)],
                          color: darkTheme[getCategoryColor(faq.category)],
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={faq.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        icon={faq.isActive ? <VisibilityIcon sx={{ fontSize: 12 }} /> : <VisibilityOffIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: faq.isActive ? darkTheme.successBg : darkTheme.errorBg,
                          color: faq.isActive ? darkTheme.success : darkTheme.error,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: faq.isActive ? darkTheme.success : darkTheme.error
                          },
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: darkTheme.text,
                        lineHeight: 1.4,
                        fontSize: '1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {faq.question}
                    </Typography>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mt: 1,
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </Box>

                  {/* Metadata and Actions */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2 }}>
                    <Stack spacing={1} sx={{ minWidth: 150, textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        Order: {faq.sortOrder}
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        Updated: {formatDate(faq.updatedAt)}
                      </Typography>
                    </Stack>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={faq.isActive}
                            onChange={() => handleToggleStatus(faq.id, faq.isActive)}
                            disabled={loadingId === faq.id}
                            size="small"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: darkTheme.success,
                                '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.04)' },
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: darkTheme.success,
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: darkTheme.border,
                              },
                            }}
                          />
                        }
                        label=""
                        sx={{ mr: 0 }}
                      />
                      <Tooltip title="Edit FAQ">
                        <IconButton
                          onClick={() => router.push(`/${businessUnitId}/admin/cms/faqs/${faq.id}`)}
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
                      <Tooltip title="Delete FAQ">
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, faq })}
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
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, faq: null })}
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
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: darkTheme.text,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Delete FAQ
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete this FAQ? This action cannot be undone and will permanently remove all associated data.
            </Typography>
            {deleteDialog.faq && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {deleteDialog.faq.question}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, faq: null })}
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
              onClick={handleDelete}
              disabled={loadingId === 'delete'}
              sx={{
                backgroundColor: darkTheme.error,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#dc2626',
                },
                '&:disabled': {
                  backgroundColor: darkTheme.textSecondary,
                },
              }}
            >
              {loadingId === 'delete' ? 'Deleting...' : 'Delete'}
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

export default FAQListPage;