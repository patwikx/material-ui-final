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
  Avatar,
  Rating,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  RateReview as TestimonialIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { TestimonialData } from '@/lib/actions/testimonials';
import { deleteTestimonial, toggleTestimonialFeatured, toggleTestimonialStatus } from '@/lib/actions/testimonial-actions';
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

interface TestimonialListPageProps {
  initialTestimonials: TestimonialData[];
}

const TestimonialListPage: React.FC<TestimonialListPageProps> = ({ initialTestimonials }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(initialTestimonials);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; testimonial: TestimonialData | null }>({
    open: false,
    testimonial: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.testimonial) return;

    setLoading('delete');
    try {
      const result = await deleteTestimonial(deleteDialog.testimonial.id);
      if (result.success) {
        setTestimonials(prev => prev.filter(t => t.id !== deleteDialog.testimonial!.id));
        setSnackbar({
          open: true,
          message: 'Testimonial deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete testimonial',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while deleting ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
      setDeleteDialog({ open: false, testimonial: null });
    }
  };

  const handleToggleStatus = async (testimonialId: string, currentStatus: boolean) => {
    setLoading(testimonialId);
    try {
      const result = await toggleTestimonialStatus(testimonialId, !currentStatus);
      if (result.success) {
        setTestimonials(prev => prev.map(t => 
          t.id === testimonialId ? { ...t, isActive: !currentStatus } : t
        ));
        setSnackbar({
          open: true,
          message: `Testimonial ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
          severity: 'success',
        });
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
        message: `An error occurred while updating status ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleToggleFeatured = async (testimonialId: string, currentFeatured: boolean) => {
    setLoading(testimonialId);
    try {
      const result = await toggleTestimonialFeatured(testimonialId, !currentFeatured);
      if (result.success) {
        setTestimonials(prev => prev.map(t => 
          t.id === testimonialId ? { ...t, isFeatured: !currentFeatured } : t
        ));
        setSnackbar({
          open: true,
          message: `Testimonial ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update featured status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating featured status ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

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
                Testimonials
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
                Manage guest testimonials and reviews to showcase positive experiences and build trust.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/cms/testimonials/new`)}
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
              Create New Testimonial
            </Button>
          </Box>
        </Box>

        {/* Testimonial Cards */}
        {testimonials.length === 0 ? (
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
              <TestimonialIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No testimonials found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Create your first testimonial to get started
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/cms/testimonials/new`)}
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
              Create Testimonial
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Avatar Section */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: '200px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: darkTheme.background,
                      p: 3,
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        src={testimonial.guestImage || undefined}
                        alt={testimonial.guestName}
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          fontSize: '2rem',
                          fontWeight: 700,
                          backgroundColor: testimonial.guestImage ? 'transparent' : darkTheme.primary,
                          color: 'white'
                        }}
                      >
                        {!testimonial.guestImage &&
                          testimonial.guestName.charAt(0).toUpperCase()
                        }
                      </Avatar>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '1rem',
                          mb: 0.5,
                        }}
                      >
                        {testimonial.guestName}
                      </Typography>
                      {testimonial.guestCountry && (
                        <Typography
                          sx={{
                            color: darkTheme.textSecondary,
                            fontSize: '0.875rem',
                          }}
                        >
                          {testimonial.guestCountry}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, p: 3 }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            {testimonial.rating && (
                              <Rating
                                value={testimonial.rating}
                                readOnly
                                size="small"
                                sx={{ color: darkTheme.warning }}
                              />
                            )}
                            {testimonial.isFeatured && (
                              <Chip
                                icon={<StarIcon sx={{ fontSize: 12 }} />}
                                label="Featured"
                                size="small"
                                sx={{
                                  height: 24,
                                  fontSize: '11px',
                                  backgroundColor: darkTheme.warningBg,
                                  color: darkTheme.warning,
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { color: darkTheme.warning },
                                }}
                              />
                            )}
                            <Chip
                              label={testimonial.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              icon={testimonial.isActive ? <VisibilityIcon sx={{ fontSize: 12 }} /> : <VisibilityOffIcon sx={{ fontSize: 12 }} />}
                              sx={{
                                height: 24,
                                fontSize: '11px',
                                backgroundColor: testimonial.isActive ? darkTheme.successBg : darkTheme.errorBg,
                                color: testimonial.isActive ? darkTheme.success : darkTheme.error,
                                fontWeight: 600,
                                '& .MuiChip-icon': {
                                  color: testimonial.isActive ? darkTheme.success : darkTheme.error
                                },
                              }}
                            />
                          </Box>

                          <Typography
                            sx={{
                              color: darkTheme.textSecondary,
                              lineHeight: 1.6,
                              mb: 2,
                              fontStyle: 'italic',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontSize: '0.875rem'
                            }}
                          >
                            &quot;{testimonial.content}&quot;
                          </Typography>

                          {/* Guest Details */}
                          <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            {testimonial.guestTitle && (
                              <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                                Title: {testimonial.guestTitle}
                              </Typography>
                            )}
                            {testimonial.source && (
                              <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                                Source: {testimonial.source}
                              </Typography>
                            )}
                            {testimonial.stayDate && (
                              <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                                Stay: {formatDate(testimonial.stayDate)}
                              </Typography>
                            )}
                            {testimonial.reviewDate && (
                              <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                                Review: {formatDate(testimonial.reviewDate)}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Box>

                      <CardActions sx={{ p: 0, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={testimonial.isActive}
                                onChange={() => handleToggleStatus(testimonial.id, testimonial.isActive)}
                                disabled={loading === testimonial.id}
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
                          <Tooltip title={testimonial.isFeatured ? 'Remove from featured' : 'Add to featured'}>
                            <IconButton
                              onClick={() => handleToggleFeatured(testimonial.id, testimonial.isFeatured)}
                              disabled={loading === testimonial.id}
                              sx={{
                                color: testimonial.isFeatured ? darkTheme.warning : darkTheme.textSecondary,
                                backgroundColor: 'transparent',
                                '&:hover': {
                                  backgroundColor: testimonial.isFeatured ? darkTheme.warningBg : darkTheme.surfaceHover,
                                },
                                width: 32,
                                height: 32,
                              }}
                            >
                              {testimonial.isFeatured ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            onClick={() => router.push(`/${businessUnitId}/admin/cms/testimonials/${testimonial.id}`)}
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
                          <IconButton
                            onClick={() => setDeleteDialog({ open: true, testimonial })}
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
                        </Box>
                      </CardActions>
                    </CardContent>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, testimonial: null })}
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
            Delete Testimonial
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </Typography>
            {deleteDialog.testimonial && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {deleteDialog.testimonial.guestName}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary, fontStyle: 'italic' }}>
                  &quot;{deleteDialog.testimonial.content.substring(0, 100)}...&quot;
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, testimonial: null })}
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
              disabled={loading === 'delete'}
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
              {loading === 'delete' ? 'Deleting...' : 'Delete'}
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

export default TestimonialListPage;