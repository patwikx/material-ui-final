'use client';

import React, { useState, useEffect } from 'react';
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
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Bed as BedIcon,
  CleaningServices as CleaningIcon,
  Build as MaintenanceIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  SwapVert as StatusIcon,
  Business as BusinessIcon,
  Hotel as HotelIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { deleteRoom, RoomData, toggleRoomStatus, updateRoomStatus } from '@/lib/actions/room-management';
import { RoomStatus } from '@prisma/client';
import { useBusinessUnit } from '@/context/business-unit-context';

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
  const [filteredRooms, setFilteredRooms] = useState<RoomData[]>(initialRooms);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('all');
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; room: RoomData | null }>({
    open: false,
    room: null,
  });
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    room: RoomData | null;
  }>({
    open: false,
    room: null,
  });
  const [newStatus, setNewStatus] = useState<RoomStatus | ''>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter and search logic
  useEffect(() => {
    let filtered = rooms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.businessUnit.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.floor && room.floor.toString().includes(searchTerm))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    // Active filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(room => room.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(room => !room.isActive);
    }

    // Room type filter
    if (roomTypeFilter !== 'all') {
      filtered = filtered.filter(room => room.roomType.id === roomTypeFilter);
    }

    // Business unit filter
    if (businessUnitFilter !== 'all') {
      filtered = filtered.filter(room => room.businessUnit.id === businessUnitFilter);
    }

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, statusFilter, activeFilter, roomTypeFilter, businessUnitFilter]);

  // Get unique values for filters
  const uniqueRoomTypes = Array.from(
    new Map(rooms.map(room => [room.roomType.id, room.roomType])).values()
  );
  const uniqueBusinessUnits = Array.from(
    new Map(rooms.map(room => [room.businessUnit.id, room.businessUnit])).values()
  );

  const handleDelete = async () => {
    if (!deleteDialog.room) return;

    setLoading(true);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting room',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, room: null });
    }
  };

  const handleToggleStatus = async (roomId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const result = await toggleRoomStatus(roomId, !currentStatus);
      if (result.success) {
        setRooms(prev => prev.map(r => 
          r.id === roomId ? { ...r, isActive: !currentStatus } : r
        ));
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update status',
          severity: 'error',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating status',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusDialog.room || !newStatus) return;

    setLoading(true);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating room status',
        severity: 'error',
      });
    } finally {
      setLoading(false);
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
      'BLOCKED': 'error',
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
      'BLOCKED': 'errorBg',
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

  const RoomCard = ({ room }: { room: RoomData }) => (
    <Card 
      sx={{ 
        backgroundColor: darkTheme.surface,
        borderRadius: '12px',
        border: `1px solid ${darkTheme.border}`,
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          backgroundColor: darkTheme.surfaceHover,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        },
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ 
              color: darkTheme.text, 
              fontWeight: 700,
              fontSize: '1.2rem',
              mb: 0.5,
            }}>
              Room {room.roomNumber}
            </Typography>
            <Typography sx={{ 
              color: darkTheme.textSecondary, 
              fontSize: '0.9rem',
              mb: 1,
            }}>
              {room.roomType.name}
            </Typography>
          </Box>
          
          {/* Status Badges */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
            <Chip
              icon={getRoomStatusIcon(room.status)}
              label={room.status.replace('_', ' ')}
              size="small"
              sx={{
                backgroundColor: darkTheme[getRoomStatusBg(room.status)],
                color: darkTheme[getRoomStatusColor(room.status)],
                border: `1px solid ${darkTheme[getRoomStatusColor(room.status)]}`,
                fontSize: '11px',
                fontWeight: 600,
                height: '24px',
                textTransform: 'capitalize',
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
                backgroundColor: room.isActive ? darkTheme.successBg : darkTheme.errorBg,
                color: room.isActive ? darkTheme.success : darkTheme.error,
                border: `1px solid ${room.isActive ? darkTheme.success : darkTheme.error}`,
                fontSize: '11px',
                fontWeight: 600,
                height: '24px',
                '& .MuiChip-icon': {
                  color: room.isActive ? darkTheme.success : darkTheme.error,
                },
              }}
            />
          </Box>
        </Box>

        {/* Room Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HotelIcon sx={{ color: darkTheme.primary, fontSize: 18 }} />
          <Box>
            <Typography sx={{ 
              color: darkTheme.text, 
              fontWeight: 600,
              fontSize: '0.95rem',
            }}>
              {room.roomType.name}
            </Typography>
            <Typography sx={{ 
              color: darkTheme.textSecondary, 
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}>
              <BusinessIcon sx={{ fontSize: 12 }} />
              {room.businessUnit.displayName}
            </Typography>
          </Box>
        </Box>

        {/* Floor Info */}
        {room.floor && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <LayersIcon sx={{ color: darkTheme.primary, fontSize: 18 }} />
            <Typography sx={{ 
              color: darkTheme.textSecondary, 
              fontSize: '0.85rem',
            }}>
              Floor {room.floor}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto',
          pt: 2,
        }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View & Edit">
              <IconButton
                onClick={() => router.push(`/${businessUnitId}/admin/operations/rooms/${room.id}`)}
                size="small"
                sx={{
                  color: darkTheme.primary,
                  backgroundColor: darkTheme.selectedBg,
                  '&:hover': { backgroundColor: darkTheme.primary, color: 'white' },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Change Status">
              <IconButton
                onClick={() => {
                  setNewStatus(room.status);
                  setStatusDialog({ open: true, room });
                }}
                size="small"
                sx={{
                  color: darkTheme[getRoomStatusColor(room.status)],
                  backgroundColor: darkTheme[getRoomStatusBg(room.status)],
                  '&:hover': { 
                    backgroundColor: darkTheme[getRoomStatusColor(room.status)],
                    color: 'white',
                  },
                }}
              >
                <StatusIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={room.isActive ? "Deactivate" : "Activate"}>
              <IconButton
                onClick={() => handleToggleStatus(room.id, room.isActive)}
                size="small"
                sx={{
                  color: room.isActive ? darkTheme.success : darkTheme.textSecondary,
                  backgroundColor: room.isActive ? darkTheme.successBg : 'transparent',
                  '&:hover': { 
                    backgroundColor: room.isActive ? darkTheme.success : darkTheme.successBg,
                    color: room.isActive ? 'white' : darkTheme.success,
                  },
                }}
              >
                {room.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton
                onClick={() => setDeleteDialog({ open: true, room })}
                size="small"
                sx={{
                  color: darkTheme.error,
                  backgroundColor: darkTheme.errorBg,
                  '&:hover': { backgroundColor: darkTheme.error, color: 'white' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                  color: darkTheme.text,
                  lineHeight: 1.2,
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
                Manage room inventory, status, and assignments across all properties
              </Typography>
            </Box>
            <Button
              onClick={() => router.push(`/${businessUnitId}/admin/operations/rooms/new`)}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: darkTheme.primaryHover,
                },
              }}
            >
              Add Room
            </Button>
          </Box>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}`, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: darkTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& fieldset': { borderColor: darkTheme.border },
                    '&:hover fieldset': { borderColor: darkTheme.primary },
                    '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                  },
                }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  label="Status"
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  }}
                  MenuProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: darkTheme.surface,
                        border: `1px solid ${darkTheme.border}`,
                      },
                      '& .MuiMenuItem-root': {
                        color: darkTheme.text,
                        '&:hover': { backgroundColor: darkTheme.surfaceHover },
                        '&.Mui-selected': { backgroundColor: darkTheme.selected },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {roomStatuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Active</InputLabel>
                <Select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
                  label="Active"
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  }}
                  MenuProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: darkTheme.surface,
                        border: `1px solid ${darkTheme.border}`,
                      },
                      '& .MuiMenuItem-root': {
                        color: darkTheme.text,
                        '&:hover': { backgroundColor: darkTheme.surfaceHover },
                        '&.Mui-selected': { backgroundColor: darkTheme.selected },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Rooms</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Room Type</InputLabel>
                <Select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  label="Room Type"
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  }}
                  MenuProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: darkTheme.surface,
                        border: `1px solid ${darkTheme.border}`,
                      },
                      '& .MuiMenuItem-root': {
                        color: darkTheme.text,
                        '&:hover': { backgroundColor: darkTheme.surfaceHover },
                        '&.Mui-selected': { backgroundColor: darkTheme.selected },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {uniqueRoomTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Business Unit</InputLabel>
                <Select
                  value={businessUnitFilter}
                  onChange={(e) => setBusinessUnitFilter(e.target.value)}
                  label="Business Unit"
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  }}
                  MenuProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: darkTheme.surface,
                        border: `1px solid ${darkTheme.border}`,
                      },
                      '& .MuiMenuItem-root': {
                        color: darkTheme.text,
                        '&:hover': { backgroundColor: darkTheme.surfaceHover },
                        '&.Mui-selected': { backgroundColor: darkTheme.selected },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Units</MenuItem>
                  {uniqueBusinessUnits.map(unit => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: darkTheme.textSecondary, fontSize: '14px' }}>
            Showing {filteredRooms.length} of {rooms.length} rooms
          </Typography>
        </Box>

        {/* Cards Layout */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: darkTheme.primary }} />
          </Box>
        ) : filteredRooms.length === 0 ? (
          <Card sx={{ 
            backgroundColor: darkTheme.surface, 
            borderRadius: '8px', 
            border: `1px solid ${darkTheme.border}`,
            textAlign: 'center',
            py: 8,
          }}>
            <Typography sx={{ color: darkTheme.textSecondary, fontSize: '1.1rem' }}>
              No rooms found
            </Typography>
          </Card>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}>
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, room: null })}
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              color: darkTheme.text,
              border: `1px solid ${darkTheme.border}`,
            },
          }}
        >
          <DialogTitle sx={{ color: darkTheme.text }}>Delete Room</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: darkTheme.textSecondary }}>
              Are you sure you want to delete Room {deleteDialog.room?.roomNumber}? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, room: null })}
              sx={{ color: darkTheme.textSecondary }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              sx={{
                color: darkTheme.error,
                '&:hover': { backgroundColor: darkTheme.errorBg },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog
          open={statusDialog.open}
          onClose={() => setStatusDialog({ open: false, room: null })}
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              color: darkTheme.text,
              border: `1px solid ${darkTheme.border}`,
            },
          }}
        >
          <DialogTitle sx={{ color: darkTheme.text }}>Update Room Status</DialogTitle>
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
                }}
                MenuProps={{
                  sx: {
                    '& .MuiPaper-root': {
                      backgroundColor: darkTheme.surface,
                      border: `1px solid ${darkTheme.border}`,
                    },
                    '& .MuiMenuItem-root': {
                      color: darkTheme.text,
                      '&:hover': { backgroundColor: darkTheme.surfaceHover },
                      '&.Mui-selected': { backgroundColor: darkTheme.selected },
                    },
                  },
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
          <DialogActions>
            <Button
              onClick={() => setStatusDialog({ open: false, room: null })}
              sx={{ color: darkTheme.textSecondary }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              sx={{
                color: darkTheme.primary,
                '&:hover': { backgroundColor: darkTheme.selectedBg },
              }}
            >
              Update Status
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
                color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
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