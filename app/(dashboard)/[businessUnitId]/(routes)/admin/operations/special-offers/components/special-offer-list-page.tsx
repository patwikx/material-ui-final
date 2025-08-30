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
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocalOffer as OfferIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { SpecialOfferData } from '@/lib/actions/special-offers';
import { deleteSpecialOffer, toggleSpecialOfferFeatured, toggleSpecialOfferStatus } from '@/lib/cms-actions/special-offer';
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

interface SpecialOfferListPageProps {
  initialOffers: SpecialOfferData[];
}

const SpecialOfferListPage: React.FC<SpecialOfferListPageProps> = ({ initialOffers }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [offers, setOffers] = useState<SpecialOfferData[]>(initialOffers);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; offer: SpecialOfferData | null }>({
    open: false,
    offer: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.offer) return;

    setLoading('delete');
    try {
      const result = await deleteSpecialOffer(deleteDialog.offer.id);
      if (result.success) {
        setOffers(prev => prev.filter(o => o.id !== deleteDialog.offer!.id));
        setSnackbar({
          open: true,
          message: 'Special offer deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete special offer',
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
      setDeleteDialog({ open: false, offer: null });
    }
  };

  const handleToggleStatus = async (offerId: string, currentStatus: boolean) => {
    setLoading(offerId);
    try {
      const result = await toggleSpecialOfferStatus(offerId, !currentStatus);
      if (result.success) {
        setOffers(prev => prev.map(o => 
          o.id === offerId ? { ...o, isPublished: !currentStatus } : o
        ));
        setSnackbar({
          open: true,
          message: `Special offer ${!currentStatus ? 'published' : 'unpublished'} successfully`,
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

  const handleToggleFeatured = async (offerId: string, currentFeatured: boolean) => {
    setLoading(offerId);
    try {
      const result = await toggleSpecialOfferFeatured(offerId, !currentFeatured);
      if (result.success) {
        setOffers(prev => prev.map(o => 
          o.id === offerId ? { ...o, isFeatured: !currentFeatured } : o
        ));
        setSnackbar({
          open: true,
          message: `Special offer ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`,
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

  const calculateDiscount = (offer: SpecialOfferData): string => {
    if (offer.savingsPercent) {
      return `${offer.savingsPercent}% OFF`;
    }
    if (offer.savingsAmount && offer.originalPrice) {
      const percentage = Math.round((offer.savingsAmount / offer.originalPrice) * 100);
      return `${percentage}% OFF`;
    }
    return 'SPECIAL OFFER';
  };

  const getOfferTypeColor = (type: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'ROOM_UPGRADE': 'primary',
      'PACKAGE': 'primary',
      'EARLY_BIRD': 'success',
      'LAST_MINUTE': 'warning',
      'SEASONAL': 'primary',
      'LOYALTY': 'warning',
    };
    return colorMap[type] || 'textSecondary';
  };

  const getOfferTypeBackground = (type: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'ROOM_UPGRADE': 'selectedBg',
      'PACKAGE': 'selectedBg',
      'EARLY_BIRD': 'successBg',
      'LAST_MINUTE': 'warningBg',
      'SEASONAL': 'selectedBg',
      'LOYALTY': 'warningBg',
    };
    return colorMap[type] || 'surfaceHover';
  };

  const getStatusColor = (status: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'ACTIVE': 'success',
      'INACTIVE': 'textSecondary',
      'EXPIRED': 'error',
      'SCHEDULED': 'primary',
    };
    return colorMap[status] || 'textSecondary';
  };

  const getStatusBackground = (status: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'ACTIVE': 'successBg',
      'INACTIVE': 'surfaceHover',
      'EXPIRED': 'errorBg',
      'SCHEDULED': 'selectedBg',
    };
    return colorMap[status] || 'surfaceHover';
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
                Special Offers
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
                Manage special offers and promotional deals across all properties to attract and retain guests.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/operations/special-offers/new`)}
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
              Create New Offer
            </Button>
          </Box>
        </Box>

        {/* Offer Cards */}
        {offers.length === 0 ? (
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
              <OfferIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No special offers found
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Create your first special offer to get started
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/operations/special-offers/new`)}
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
              Create Special Offer
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {offers.map((offer) => (
              <Card
                key={offer.id}
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
                  {/* Image Preview */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: '300px' },
                      height: '200px',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: darkTheme.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {offer.images.length > 0 ? (
                      <Box
                        component="img"
                        src={offer.images[0].image.originalUrl}
                        alt={offer.images[0].image.altText || offer.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: darkTheme.textSecondary }}>
                        <OfferIcon sx={{ fontSize: 32 }} />
                        <Typography variant="body2">No Image</Typography>
                      </Box>
                    )}

                    {/* Status Chips */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        gap: 1,
                        flexDirection: 'column',
                      }}
                    >
                      {offer.isFeatured && (
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
                        label={offer.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getStatusBackground(offer.status)],
                          color: darkTheme[getStatusColor(offer.status)],
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {/* Discount Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        backgroundColor: darkTheme.error,
                        color: 'white',
                        px: 2,
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        borderRadius: '4px',
                        boxShadow: `0 2px 8px ${darkTheme.errorBg}`,
                      }}
                    >
                      {calculateDiscount(offer)}
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, p: 3 }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: darkTheme.text,
                              mb: 1,
                              fontSize: '1.25rem',
                            }}
                          >
                            {offer.title}
                          </Typography>
                          {offer.subtitle && (
                            <Typography
                              sx={{
                                color: darkTheme.textSecondary,
                                mb: 1,
                                fontWeight: 500,
                                fontSize: '0.875rem'
                              }}
                            >
                              {offer.subtitle}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                           <Chip
                            label={offer.type.replace('_', ' ')}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '11px',
                              textTransform: 'capitalize',
                              backgroundColor: darkTheme[getOfferTypeBackground(offer.type)],
                              color: darkTheme[getOfferTypeColor(offer.type)],
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography
                        sx={{
                          color: darkTheme.textSecondary,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem'
                        }}
                      >
                        {offer.description}
                      </Typography>

                      {/* Offer Details */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            Valid: {formatDate(offer.validFrom)} - {formatDate(offer.validTo)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon sx={{ fontSize: 16, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {offer.currency} {offer.offerPrice.toLocaleString()}
                            {offer.originalPrice && (
                              <Box component="span" sx={{ textDecoration: 'line-through', ml: 1, color: darkTheme.textSecondary }}>
                                {offer.currency} {offer.originalPrice.toLocaleString()}
                              </Box>
                            )}
                          </Typography>
                        </Box>
                        {offer.businessUnit && (
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            Property: {offer.businessUnit.displayName}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ p: 0, pt: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={offer.isPublished}
                              onChange={() => handleToggleStatus(offer.id, offer.isPublished)}
                              disabled={loading === offer.id}
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
                        <Tooltip title={offer.isFeatured ? 'Remove from featured' : 'Add to featured'}>
                          <IconButton
                            onClick={() => handleToggleFeatured(offer.id, offer.isFeatured)}
                            disabled={loading === offer.id}
                            sx={{
                              color: offer.isFeatured ? darkTheme.warning : darkTheme.textSecondary,
                              backgroundColor: 'transparent',
                              '&:hover': {
                                backgroundColor: offer.isFeatured ? darkTheme.warningBg : darkTheme.surfaceHover,
                              },
                              width: 32,
                              height: 32,
                            }}
                          >
                            {offer.isFeatured ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => router.push(`/${businessUnitId}/admin/operations/special-offers/${offer.id}`)}
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
                          onClick={() => setDeleteDialog({ open: true, offer })}
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
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, offer: null })}
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
            Delete Special Offer
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete &quot;{deleteDialog.offer?.title}&quot;? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, offer: null })}
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

export default SpecialOfferListPage;