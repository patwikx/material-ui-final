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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Bed as BedIcon,
  CleaningServices as CleaningIcon,
  Build as MaintenanceIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ChevronRightTwoTone,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { deleteRoom, RoomData, toggleRoomStatus, updateRoomStatus } from '@/lib/actions/room-management';
import { RoomStatus } from '@prisma/client';
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

interface RoomListPageProps {
  initialRooms: RoomData[];
}

const RoomListPage: React.FC<RoomListPageProps> = ({ initialRooms }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [rooms, setRooms] = useState<RoomData[]>(initialRooms);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; room: RoomData | null }>({
    open: false,
    room: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);
  
  // Dialog state for updating status
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    room: RoomData | null;
  }>({
    open: false,
    room: null,
  });
  const [newStatus, setNewStatus] = useState<RoomStatus | ''>('');

  const handleDelete = async () => {
    if (!deleteDialog.room) return;

    setLoading('delete');
    try {
      const result = await deleteRoom(deleteDialog.room.id);
      if (result.success) {
        setRooms(prev => prev.filter(r => r.id !== deleteDialog.room!.id));
        setSnackbar({
          open: true,
          message: 'Room deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete room',
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
      setDeleteDialog({ open: false, room: null });
    }
  };

  const handleToggleStatus = async (roomId: string, currentStatus: boolean) => {
    setLoading(roomId);
    try {
      const result = await toggleRoomStatus(roomId, !currentStatus);
      if (result.success) {
        setRooms(prev => prev.map(r => 
          r.id === roomId ? { ...r, isActive: !currentStatus } : r
        ));
        setSnackbar({
          open: true,
          message: `Room ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
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

  const handleStatusChange = async () => {
    if (!statusDialog.room || !newStatus) return;

    setLoading(statusDialog.room.id);
    try {
      const result = await updateRoomStatus(statusDialog.room.id, newStatus);
      if (result.success) {
        setRooms(prev => prev.map(r => 
          r.id === statusDialog.room!.id ? { ...r, status: newStatus } : r
        ));
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update room status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating room status',
        severity: 'error',
      });
    } finally {
      setLoading(null);
      setStatusDialog({ open: false, room: null });
      setNewStatus('');
    }
  };

  
  const getRoomStatusColor = (status: RoomStatus): keyof typeof darkTheme => {
    const colorMap: Record<RoomStatus, keyof typeof darkTheme> = {
      'AVAILABLE': 'success',
      'OCCUPIED': 'primary',
      'MAINTENANCE': 'warning',
      'OUT_OF_ORDER': 'error',
      'CLEANING': 'primary',
      'RESERVED': 'primary',
      'BLOCKED': 'error', // FIX: Added missing status
    };
    return colorMap[status] || 'textSecondary';
  };

  const getRoomStatusBg = (status: RoomStatus): keyof typeof darkTheme => {
    const bgMap: Record<RoomStatus, keyof typeof darkTheme> = {
      'AVAILABLE': 'successBg',
      'OCCUPIED': 'selectedBg',
      'MAINTENANCE': 'warningBg',
      'OUT_OF_ORDER': 'errorBg',
      'CLEANING': 'selectedBg',
      'RESERVED': 'selectedBg',
      'BLOCKED': 'errorBg', // FIX: Added missing status
    };
    return bgMap[status] || 'surfaceHover';
  };

  const getRoomStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'CLEANING':
        return <CleaningIcon sx={{ fontSize: 16 }} />;
      case 'MAINTENANCE':
      case 'OUT_OF_ORDER':
      case 'BLOCKED':
        return <MaintenanceIcon sx={{ fontSize: 16 }} />;
      default:
        return <BedIcon sx={{ fontSize: 16 }} />;
    }
  };
  
  const roomStatuses = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'OCCUPIED', label: 'Occupied' },
    { value: 'RESERVED', label: 'Reserved' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'OUT_OF_ORDER', label: 'Out of Order' },
    { value: 'BLOCKED', label: 'Blocked' },
  ];

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
                Rooms Management
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
                Manage room inventory, status, and assignments across all properties.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/operations/rooms/new`)}
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
              Create New Room
            </Button>
          </Box>
        </Box>

        {/* Room Cards */}
        {rooms.length === 0 ? (
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
              <BedIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No rooms found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
              }}
            >
              Create your first room to get started
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rooms.map((room) => (
              <Card
                key={room.id}
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
                  {/* Room Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '1.25rem',
                        }}
                      >
                        Room {room.roomNumber}
                      </Typography>
                      <Chip
                        icon={getRoomStatusIcon(room.status)}
                        label={room.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getRoomStatusBg(room.status)],
                          color: darkTheme[getRoomStatusColor(room.status)],
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: darkTheme[getRoomStatusColor(room.status)],
                          },
                        }}
                      />
                      <Chip
                        label={room.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        icon={room.isActive ? <VisibilityIcon sx={{ fontSize: 12 }} /> : <VisibilityOffIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          backgroundColor: room.isActive ? darkTheme.successBg : darkTheme.errorBg,
                          color: room.isActive ? darkTheme.success : darkTheme.error,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: room.isActive ? darkTheme.success : darkTheme.error
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        {room.roomType.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        {room.businessUnit.displayName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                        Floor: {room.floor || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Update Status">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setNewStatus(room.status);
                            setStatusDialog({ open: true, room });
                          }}
                          disabled={loading === room.id}
                          sx={{
                            backgroundColor: darkTheme.primary,
                            color: 'white',
                            textTransform: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '&:hover': { backgroundColor: darkTheme.primaryHover },
                            '&:disabled': { backgroundColor: darkTheme.surface, color: darkTheme.textSecondary },
                          }}
                        >
                          Update Status
                        </Button>
                      </Tooltip>
                      <Tooltip title="Toggle Active">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={room.isActive}
                              onChange={() => handleToggleStatus(room.id, room.isActive)}
                              disabled={loading === room.id}
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
                      </Tooltip>
                      <Tooltip title="Delete Room">
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, room })}
                          disabled={loading === room.id}
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
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => router.push(`/${businessUnitId}/admin/operations/rooms/${room.id}`)}
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
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, room: null })}
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
            Delete Room
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete Room {deleteDialog.room?.roomNumber}? This action cannot be undone.
            </Typography>
            {deleteDialog.room && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  Room {deleteDialog.room.roomNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {deleteDialog.room.roomType.name} • {deleteDialog.room.businessUnit.displayName}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, room: null })}
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

        {/* Update Status Dialog */}
        <Dialog
          open={statusDialog.open}
          onClose={() => setStatusDialog({ open: false, room: null })}
          maxWidth="xs"
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
            Update Room Status
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel sx={{ color: darkTheme.textSecondary }}>Room Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
                label="Room Status"
                sx={{
                  borderRadius: '8px',
                  backgroundColor: darkTheme.background,
                  color: darkTheme.text,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                }}
              >
                {roomStatuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setStatusDialog({ open: false, room: null })}
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
              onClick={handleStatusChange}
              variant="contained"
              disabled={loading === statusDialog.room?.id}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { backgroundColor: darkTheme.primaryHover },
                '&:disabled': { backgroundColor: darkTheme.textSecondary, color: darkTheme.surface },
              }}
            >
              {loading === statusDialog.room?.id ? 'Updating...' : 'Update Status'}
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

export default RoomListPage;