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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Hotel as HotelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ChevronRightTwoTone,
  LocationCity,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { BusinessUnitData, deleteBusinessUnit, toggleBusinessUnitFeatured, toggleBusinessUnitStatus } from '@/lib/actions/business-management';
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

interface BusinessUnitListPageProps {
  initialBusinessUnits: BusinessUnitData[];
}

const BusinessUnitListPage: React.FC<BusinessUnitListPageProps> = ({ initialBusinessUnits }) => {
  const router = useRouter();
  const { businessUnitId: currentBusinessUnitId } = useBusinessUnit();
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>(initialBusinessUnits);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; businessUnit: BusinessUnitData | null }>({
    open: false,
    businessUnit: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.businessUnit) return;

    setLoading('delete');
    try {
      const result = await deleteBusinessUnit(deleteDialog.businessUnit.id);
      if (result.success) {
        setBusinessUnits(prev => prev.filter(bu => bu.id !== deleteDialog.businessUnit!.id));
        setSnackbar({
          open: true,
          message: 'Business unit deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete business unit',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting',
        severity: 'error',
      });
    } finally {
      setLoading(null);
      setDeleteDialog({ open: false, businessUnit: null });
    }
  };

  const handleToggleStatus = async (businessUnitId: string, currentStatus: boolean) => {
    setLoading(businessUnitId);
    try {
      const result = await toggleBusinessUnitStatus(businessUnitId, !currentStatus);
      if (result.success) {
        setBusinessUnits(prev => prev.map(bu => 
          bu.id === businessUnitId ? { ...bu, isActive: !currentStatus } : bu
        ));
        setSnackbar({
          open: true,
          message: `Business unit ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
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
        message: 'An error occurred while updating status',
        severity: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleToggleFeatured = async (businessUnitId: string, currentFeatured: boolean) => {
    setLoading(businessUnitId);
    try {
      const result = await toggleBusinessUnitFeatured(businessUnitId, !currentFeatured);
      if (result.success) {
        setBusinessUnits(prev => prev.map(bu => 
          bu.id === businessUnitId ? { ...bu, isFeatured: !currentFeatured } : bu
        ));
        setSnackbar({
          open: true,
          message: `Business unit ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`,
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
        message: 'An error occurred while updating featured status',
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getPropertyTypeColor = (type: string): keyof typeof darkTheme => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'HOTEL': 'primary',
      'RESORT': 'warning',
      'VILLA_COMPLEX': 'success',
      'APARTMENT_HOTEL': 'selected',
      'BOUTIQUE_HOTEL': 'primary',
    };
    return colorMap[type] || 'textSecondary';
  };

  const getPropertyTypeBg = (type: string): keyof typeof darkTheme => {
    const bgMap: Record<string, keyof typeof darkTheme> = {
      'HOTEL': 'selectedBg',
      'RESORT': 'warningBg',
      'VILLA_COMPLEX': 'successBg',
      'APARTMENT_HOTEL': 'selectedBg',
      'BOUTIQUE_HOTEL': 'selectedBg',
    };
    return bgMap[type] || 'surfaceHover';
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
                Properties Management
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
                Manage hotel properties and business units across the Tropicana network.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${currentBusinessUnitId}/admin/operations/properties/new`)}
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
              Create New Property
            </Button>
          </Box>
        </Box>

        {/* Business Unit Cards */}
        {businessUnits.length === 0 ? (
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
              <HotelIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No properties found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Create your first property to get started
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${currentBusinessUnitId}/admin/operations/properties/new`)}
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
              Create Property
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {businessUnits.map((businessUnit) => (
              <Card
                key={businessUnit.id}
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
                  {/* Logo/Image Section */}
                  <Box
                    sx={{
                      width: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      src={businessUnit.logo || undefined}
                      alt={`${businessUnit.displayName} logo`}
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: businessUnit.logo ? 'transparent' : darkTheme.background,
                        border: `1px solid ${darkTheme.border}`,
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: darkTheme.textSecondary,
                      }}
                    >
                      {!businessUnit.logo && <HotelIcon />}
                    </Avatar>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '1.25rem',
                        }}
                      >
                        {businessUnit.displayName}
                      </Typography>
                      <Chip
                        label={businessUnit.propertyType.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getPropertyTypeBg(businessUnit.propertyType)],
                          color: darkTheme[getPropertyTypeColor(businessUnit.propertyType)],
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {businessUnit.shortDescription && (
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
                        {businessUnit.shortDescription}
                      </Typography>
                    )}

                    {/* Contact Information */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationCity sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          {businessUnit.city}, {businessUnit.country}
                        </Typography>
                      </Box>
                      {businessUnit.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {businessUnit.phone}
                          </Typography>
                        </Box>
                      )}
                      {businessUnit.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {businessUnit.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={businessUnit.isActive}
                          onChange={() => handleToggleStatus(businessUnit.id, businessUnit.isActive)}
                          disabled={loading === businessUnit.id}
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
                    <Tooltip title={businessUnit.isFeatured ? 'Remove from featured' : 'Add to featured'}>
                      <IconButton
                        onClick={() => handleToggleFeatured(businessUnit.id, businessUnit.isFeatured)}
                        disabled={loading === businessUnit.id}
                        sx={{
                          color: businessUnit.isFeatured ? darkTheme.warning : darkTheme.textSecondary,
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: businessUnit.isFeatured ? darkTheme.warningBg : darkTheme.surfaceHover,
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        {businessUnit.isFeatured ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit property">
                      <IconButton
                        onClick={() => router.push(`/${currentBusinessUnitId}/admin/operations/properties/${businessUnit.id}`)}
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
                    <Tooltip title="Delete property">
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, businessUnit })}
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
                    <ChevronRightTwoTone
                      sx={{
                        ml: 1,
                        fontSize: '16px',
                        color: darkTheme.textSecondary,
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                        '&:hover': { color: darkTheme.primary },
                      }}
                      onClick={() => router.push(`/${currentBusinessUnitId}/admin/operations/properties/${businessUnit.id}`)}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, businessUnit: null })}
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
            Delete Business Unit
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete &quot;{deleteDialog.businessUnit?.displayName}&quot;? This action cannot be undone.
            </Typography>
            {deleteDialog.businessUnit && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {deleteDialog.businessUnit.displayName}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {deleteDialog.businessUnit.city}, {deleteDialog.businessUnit.country}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, businessUnit: null })}
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
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: darkTheme.errorHover,
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

export default BusinessUnitListPage;