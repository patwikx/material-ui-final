'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
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
  Restaurant as RestaurantIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ChevronRightTwoTone,
  LocationCity,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { deleteRestaurant, RestaurantData, toggleRestaurantFeatured, toggleRestaurantStatus } from '@/lib/actions/resto-management';
import { RestaurantType } from '@prisma/client';
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

interface RestaurantListPageProps {
  initialRestaurants: RestaurantData[];
}

const RestaurantListPage: React.FC<RestaurantListPageProps> = ({ initialRestaurants }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [restaurants, setRestaurants] = useState<RestaurantData[]>(initialRestaurants);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; restaurant: RestaurantData | null }>({
    open: false,
    restaurant: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.restaurant) return;

    setLoading('delete');
    try {
      const result = await deleteRestaurant(deleteDialog.restaurant.id);
      if (result.success) {
        setRestaurants(prev => prev.filter(r => r.id !== deleteDialog.restaurant!.id));
        setSnackbar({
          open: true,
          message: 'Restaurant deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete restaurant',
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
      setDeleteDialog({ open: false, restaurant: null });
    }
  };

  const handleToggleStatus = async (restaurantId: string, currentStatus: boolean) => {
    setLoading(restaurantId);
    try {
      const result = await toggleRestaurantStatus(restaurantId, !currentStatus);
      if (result.success) {
        setRestaurants(prev => prev.map(r => 
          r.id === restaurantId ? { ...r, isActive: !currentStatus } : r
        ));
        setSnackbar({
          open: true,
          message: `Restaurant ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
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

  const handleToggleFeatured = async (restaurantId: string, currentFeatured: boolean) => {
    setLoading(restaurantId);
    try {
      const result = await toggleRestaurantFeatured(restaurantId, !currentFeatured);
      if (result.success) {
        setRestaurants(prev => prev.map(r => 
          r.id === restaurantId ? { ...r, isFeatured: !currentFeatured } : r
        ));
        setSnackbar({
          open: true,
          message: `Restaurant ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`,
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
  
  // FIX: Updated to be a complete map of all RestaurantType values
  const getRestaurantTypeColor = (type: RestaurantType): keyof typeof darkTheme => {
    const colorMap: Record<RestaurantType, keyof typeof darkTheme> = {
      'FINE_DINING': 'primary',
      'CASUAL_DINING': 'primary',
      'CAFE': 'warning',
      'BAR': 'primary',
      'BUFFET': 'success',
      'ROOM_SERVICE': 'primary',
      'POOLSIDE': 'primary',
      'SPECIALTY': 'warning',
    };
    return colorMap[type] || 'textSecondary';
  };

  const getRestaurantTypeBg = (type: RestaurantType): keyof typeof darkTheme => {
    const bgMap: Record<RestaurantType, keyof typeof darkTheme> = {
      'FINE_DINING': 'selectedBg',
      'CASUAL_DINING': 'selectedBg',
      'CAFE': 'warningBg',
      'BAR': 'selectedBg',
      'BUFFET': 'successBg',
      'ROOM_SERVICE': 'selectedBg',
      'POOLSIDE': 'selectedBg',
      'SPECIALTY': 'warningBg',
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
                Restaurants Management
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
                Manage restaurants and dining venues across all properties.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/operations/restaurants/new`)}
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
              Create New Restaurant
            </Button>
          </Box>
        </Box>

        {/* Restaurant Cards */}
        {restaurants.length === 0 ? (
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
              <RestaurantIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No restaurants found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
              }}
            >
              Restaurants will appear here when they are created
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
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
                  {/* Restaurant Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '1.25rem',
                        }}
                      >
                        {restaurant.name}
                      </Typography>
                      <Chip
                        label={restaurant.type.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getRestaurantTypeBg(restaurant.type)],
                          color: darkTheme[getRestaurantTypeColor(restaurant.type)],
                          fontWeight: 600,
                        }}
                      />
                      {restaurant.isFeatured && (
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
                        label={restaurant.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        icon={restaurant.isActive ? <VisibilityIcon sx={{ fontSize: 12 }} /> : <VisibilityOffIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          backgroundColor: restaurant.isActive ? darkTheme.successBg : darkTheme.errorBg,
                          color: restaurant.isActive ? darkTheme.success : darkTheme.error,
                          fontWeight: 600,
                          '& .MuiChip-icon': { 
                            color: restaurant.isActive ? darkTheme.success : darkTheme.error 
                          },
                        }}
                      />
                    </Box>

                    {restaurant.shortDesc && (
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
                        {restaurant.shortDesc}
                      </Typography>
                    )}

                    {/* Contact Information */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationCity sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          {restaurant.location || 'Location not specified'}
                        </Typography>
                      </Box>
                      {restaurant.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {restaurant.phone}
                          </Typography>
                        </Box>
                      )}
                      {restaurant.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {restaurant.email}
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
                          checked={restaurant.isActive}
                          onChange={() => handleToggleStatus(restaurant.id, restaurant.isActive)}
                          disabled={loading === restaurant.id}
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
                    <Tooltip title={restaurant.isFeatured ? 'Remove from featured' : 'Add to featured'}>
                      <IconButton
                        onClick={() => handleToggleFeatured(restaurant.id, restaurant.isFeatured)}
                        disabled={loading === restaurant.id}
                        sx={{
                          color: restaurant.isFeatured ? darkTheme.warning : darkTheme.textSecondary,
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: restaurant.isFeatured ? darkTheme.warningBg : darkTheme.surfaceHover,
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        {restaurant.isFeatured ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit restaurant">
                      <IconButton
                        onClick={() => router.push(`/${businessUnitId}/admin/operations/restaurants/${restaurant.id}`)}
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
                    <Tooltip title="Delete restaurant">
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, restaurant })}
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
                      onClick={() => router.push(`/${businessUnitId}/admin/operations/restaurants/${restaurant.id}`)}
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
          onClose={() => setDeleteDialog({ open: false, restaurant: null })}
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
            Delete Restaurant
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete &quot;{deleteDialog.restaurant?.name}&quot;? This action cannot be undone.
            </Typography>
            {deleteDialog.restaurant && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {deleteDialog.restaurant.name}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {deleteDialog.restaurant.businessUnit.displayName}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, restaurant: null })}
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

export default RestaurantListPage;