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
  Category as CategoryIcon,
  People as PeopleIcon,
  ChevronRightTwoTone,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { deleteRoomType, RoomTypeData, toggleRoomTypeStatus } from '@/lib/actions/room-type-management';
import { RoomType } from '@prisma/client';
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

interface RoomTypeListPageProps {
  initialRoomTypes: RoomTypeData[];
}

const RoomTypeListPage: React.FC<RoomTypeListPageProps> = ({ initialRoomTypes }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>(initialRoomTypes);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roomType: RoomTypeData | null }>({
    open: false,
    roomType: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.roomType) return;

    setLoading('delete');
    try {
      const result = await deleteRoomType(deleteDialog.roomType.id);
      if (result.success) {
        setRoomTypes(prev => prev.filter(rt => rt.id !== deleteDialog.roomType!.id));
        setSnackbar({
          open: true,
          message: 'Room type deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete room type',
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
      setDeleteDialog({ open: false, roomType: null });
    }
  };

  const handleToggleStatus = async (roomTypeId: string, currentStatus: boolean) => {
    setLoading(roomTypeId);
    try {
      const result = await toggleRoomTypeStatus(roomTypeId, !currentStatus);
      if (result.success) {
        setRoomTypes(prev => prev.map(rt => 
          rt.id === roomTypeId ? { ...rt, isActive: !currentStatus } : rt
        ));
        setSnackbar({
          open: true,
          message: `Room type ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
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

  const formatDate = (date: Date) => {
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
  
  const getRoomTypeColor = (type: RoomType): keyof typeof darkTheme => {
    const colorMap: Record<RoomType, keyof typeof darkTheme> = {
      'STANDARD': 'primary',
      'DELUXE': 'primary',
      'SUITE': 'primary',
      'VILLA': 'primary',
      'PENTHOUSE': 'warning',
      'FAMILY': 'success',
      'ACCESSIBLE': 'primary',
    };
    return colorMap[type] || 'textSecondary';
  };

  const getRoomTypeBg = (type: RoomType): keyof typeof darkTheme => {
    const bgMap: Record<RoomType, keyof typeof darkTheme> = {
      'STANDARD': 'selectedBg',
      'DELUXE': 'selectedBg',
      'SUITE': 'selectedBg',
      'VILLA': 'selectedBg',
      'PENTHOUSE': 'warningBg',
      'FAMILY': 'successBg',
      'ACCESSIBLE': 'selectedBg',
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
                Room Types Management
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
                Manage room categories and pricing across all properties.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/operations/room-types/new`)}
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
              Create New Room Type
            </Button>
          </Box>
        </Box>

        {/* Room Type Cards */}
        {roomTypes.length === 0 ? (
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
              <CategoryIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No room types found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
              }}
            >
              Create your first room type to get started
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {roomTypes.map((roomType) => (
              <Card
                key={roomType.id}
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
                  {/* Room Type Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '1.25rem',
                        }}
                      >
                        {roomType.name}
                      </Typography>
                      <Chip
                        label={roomType.type.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getRoomTypeBg(roomType.type)],
                          color: darkTheme[getRoomTypeColor(roomType.type)],
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={roomType.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        icon={roomType.isActive ? <VisibilityIcon sx={{ fontSize: 12 }} /> : <VisibilityOffIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          backgroundColor: roomType.isActive ? darkTheme.successBg : darkTheme.errorBg,
                          color: roomType.isActive ? darkTheme.success : darkTheme.error,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: roomType.isActive ? darkTheme.success : darkTheme.error
                          },
                        }}
                      />
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
                      {roomType.description}
                    </Typography>

                    {/* Room Type Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          Max {roomType.maxOccupancy} guests
                        </Typography>
                      </Box>
                      {roomType.bedConfiguration && (
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          • {roomType.bedConfiguration}
                        </Typography>
                      )}
                      {roomType.roomSize && (
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          • {roomType.roomSize} sqm
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        • {roomType._count.rooms} rooms available
                      </Typography>
                    </Box>
                    {roomType.amenities.length > 0 && (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            color: darkTheme.textSecondary,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            alignSelf: 'center',
                            mr: 1,
                          }}
                        >
                          Amenities:
                        </Typography>
                        {roomType.amenities.map((amenity, index) => (
                          <Chip
                            key={index}
                            label={amenity}
                            size="small"
                            sx={{
                              fontSize: '10px',
                              height: 20,
                              backgroundColor: darkTheme.selectedBg,
                              color: darkTheme.primary,
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, ml: 2, flexShrink: 0 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 700, color: darkTheme.text, fontSize: '1.5rem', mb: 0.5 }}>
                        {formatCurrency(roomType.baseRate, roomType.currency)}
                      </Typography>
                      <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                        per night
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={roomType.isActive}
                            onChange={() => handleToggleStatus(roomType.id, roomType.isActive)}
                            disabled={loading === roomType.id}
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
                      <Tooltip title="Edit room type">
                        <IconButton
                          onClick={() => router.push(`/${businessUnitId}/admin/operations/room-types/${roomType.id}`)}
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
                      <Tooltip title="Delete room type">
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, roomType })}
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
                        onClick={() => router.push(`/${businessUnitId}/admin/operations/room-types/${roomType.id}`)}
                      />
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
          onClose={() => setDeleteDialog({ open: false, roomType: null })}
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
            Delete Room Type
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete &quot;{deleteDialog.roomType?.name}&quot;? This action cannot be undone.
            </Typography>
            {deleteDialog.roomType && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {deleteDialog.roomType.name}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {deleteDialog.roomType.businessUnit.displayName} • {deleteDialog.roomType._count.rooms} rooms
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, roomType: null })}
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

export default RoomTypeListPage;