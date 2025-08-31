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
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Bed as BedIcon,
  AspectRatio as SizeIcon,
  Star as AmenityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { deleteRoomType, RoomTypeData, toggleRoomTypeStatus } from '@/lib/actions/room-type-management';
import { RoomType } from '@prisma/client';
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

interface RoomTypeListPageProps {
  initialRoomTypes: RoomTypeData[];
}

const RoomTypeListPage: React.FC<RoomTypeListPageProps> = ({ initialRoomTypes }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>(initialRoomTypes);
  const [filteredRoomTypes, setFilteredRoomTypes] = useState<RoomTypeData[]>(initialRoomTypes);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<string>('all');
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roomType: RoomTypeData | null }>({
    open: false,
    roomType: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter and search logic
  useEffect(() => {
    let filtered = roomTypes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(roomType =>
        roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roomType.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roomType.businessUnit.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roomType.amenities.some(amenity => amenity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(roomType => roomType.type === typeFilter);
    }

    // Active filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(roomType => roomType.isActive);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(roomType => !roomType.isActive);
    }

    // Business unit filter
    if (businessUnitFilter !== 'all') {
      filtered = filtered.filter(roomType => roomType.businessUnit.id === businessUnitFilter);
    }

    // Occupancy filter
    if (occupancyFilter !== 'all') {
      const occupancy = parseInt(occupancyFilter);
      filtered = filtered.filter(roomType => roomType.maxOccupancy === occupancy);
    }

    setFilteredRoomTypes(filtered);
  }, [roomTypes, searchTerm, typeFilter, activeFilter, businessUnitFilter, occupancyFilter]);

  // Get unique values for filters
  const uniqueBusinessUnits = Array.from(
    new Map(roomTypes.map(rt => [rt.businessUnit.id, rt.businessUnit])).values()
  );
  const uniqueOccupancies = Array.from(
    new Set(roomTypes.map(rt => rt.maxOccupancy))
  ).sort((a, b) => a - b);

  const handleDelete = async () => {
    if (!deleteDialog.roomType) return;

    setLoading(true);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting room type',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, roomType: null });
    }
  };

  const handleToggleStatus = async (roomTypeId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const result = await toggleRoomTypeStatus(roomTypeId, !currentStatus);
      if (result.success) {
        setRoomTypes(prev => prev.map(rt => 
          rt.id === roomTypeId ? { ...rt, isActive: !currentStatus } : rt
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
      'SUITE': 'warning',
      'VILLA': 'warning',
      'PENTHOUSE': 'error',
      'FAMILY': 'success',
      'ACCESSIBLE': 'primary',
    };
    return colorMap[type] || 'textSecondary';
  };

  const getRoomTypeBg = (type: RoomType): keyof typeof darkTheme => {
    const bgMap: Record<RoomType, keyof typeof darkTheme> = {
      'STANDARD': 'selectedBg',
      'DELUXE': 'selectedBg',
      'SUITE': 'warningBg',
      'VILLA': 'warningBg',
      'PENTHOUSE': 'errorBg',
      'FAMILY': 'successBg',
      'ACCESSIBLE': 'selectedBg',
    };
    return bgMap[type] || 'surfaceHover';
  };

  const roomTypeOptions = [
    { value: 'STANDARD', label: 'Standard' },
    { value: 'DELUXE', label: 'Deluxe' },
    { value: 'SUITE', label: 'Suite' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'PENTHOUSE', label: 'Penthouse' },
    { value: 'FAMILY', label: 'Family' },
    { value: 'ACCESSIBLE', label: 'Accessible' },
  ];

  const RoomTypeCard = ({ roomType }: { roomType: RoomTypeData }) => (
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
              fontSize: '1.1rem',
              mb: 0.5,
            }}>
              {roomType.name}
            </Typography>
            {roomType.description && (
              <Typography sx={{ 
                color: darkTheme.textSecondary, 
                fontSize: '0.9rem',
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {roomType.description}
              </Typography>
            )}
          </Box>
          
          {/* Status Badges */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
            <Chip
              label={roomType.type.replace('_', ' ')}
              size="small"
              sx={{
                backgroundColor: darkTheme[getRoomTypeBg(roomType.type)],
                color: darkTheme[getRoomTypeColor(roomType.type)],
                border: `1px solid ${darkTheme[getRoomTypeColor(roomType.type)]}`,
                fontSize: '11px',
                fontWeight: 600,
                height: '24px',
                textTransform: 'capitalize',
              }}
            />
            <Chip
              label={roomType.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                backgroundColor: roomType.isActive ? darkTheme.successBg : darkTheme.errorBg,
                color: roomType.isActive ? darkTheme.success : darkTheme.error,
                border: `1px solid ${roomType.isActive ? darkTheme.success : darkTheme.error}`,
                fontSize: '11px',
                fontWeight: 600,
                height: '24px',
              }}
            />
          </Box>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <MoneyIcon sx={{ color: darkTheme.success, fontSize: 20 }} />
          <Typography variant="h4" sx={{ 
            color: darkTheme.success, 
            fontWeight: 800,
            fontSize: '1.8rem',
          }}>
            {formatCurrency(roomType.baseRate, roomType.currency)}
          </Typography>
          <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.9rem' }}>
            per night
          </Typography>
        </Box>

        {/* Room Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BusinessIcon sx={{ color: darkTheme.primary, fontSize: 18 }} />
          <Typography sx={{ 
            color: darkTheme.text, 
            fontWeight: 600,
            fontSize: '0.95rem',
          }}>
            {roomType.businessUnit.displayName}
          </Typography>
        </Box>

        {/* Capacity & Details */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PeopleIcon sx={{ color: darkTheme.primary, fontSize: 18 }} />
          <Typography sx={{ 
            color: darkTheme.textSecondary, 
            fontSize: '0.85rem',
          }}>
            Max {roomType.maxOccupancy} guests
          </Typography>
          {roomType._count.rooms > 0 && (
            <>
              <Typography sx={{ color: darkTheme.textSecondary }}>•</Typography>
              <Typography sx={{ 
                color: darkTheme.textSecondary, 
                fontSize: '0.85rem',
              }}>
                {roomType._count.rooms} rooms
              </Typography>
            </>
          )}
        </Box>

        {/* Room Configuration */}
        {(roomType.bedConfiguration || roomType.roomSize) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            {roomType.bedConfiguration && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BedIcon sx={{ color: darkTheme.primary, fontSize: 16 }} />
                <Typography sx={{ 
                  color: darkTheme.textSecondary, 
                  fontSize: '0.8rem',
                }}>
                  {roomType.bedConfiguration}
                </Typography>
              </Box>
            )}
            {roomType.roomSize && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SizeIcon sx={{ color: darkTheme.primary, fontSize: 16 }} />
                <Typography sx={{ 
                  color: darkTheme.textSecondary, 
                  fontSize: '0.8rem',
                }}>
                  {roomType.roomSize} sqm
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Amenities */}
        {roomType.amenities.length > 0 && (
          <>
            <Divider sx={{ backgroundColor: darkTheme.border, mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <AmenityIcon sx={{ color: darkTheme.primary, fontSize: 16 }} />
                <Typography sx={{ 
                  color: darkTheme.textSecondary, 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}>
                  AMENITIES
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {roomType.amenities.slice(0, 4).map((amenity, index) => (
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
                {roomType.amenities.length > 4 && (
                  <Chip
                    label={`+${roomType.amenities.length - 4} more`}
                    size="small"
                    sx={{
                      fontSize: '10px',
                      height: 20,
                      backgroundColor: darkTheme.warningBg,
                      color: darkTheme.warning,
                      fontWeight: 500,
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                )}
              </Stack>
            </Box>
          </>
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
                onClick={() => router.push(`/${businessUnitId}/admin/operations/room-types/${roomType.id}`)}
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
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={roomType.isActive ? "Deactivate" : "Activate"}>
              <IconButton
                onClick={() => handleToggleStatus(roomType.id, roomType.isActive)}
                size="small"
                sx={{
                  color: roomType.isActive ? darkTheme.warning : darkTheme.success,
                  backgroundColor: roomType.isActive ? darkTheme.warningBg : darkTheme.successBg,
                  '&:hover': { 
                    backgroundColor: roomType.isActive ? darkTheme.warning : darkTheme.success,
                    color: 'white',
                  },
                }}
              >
                {roomType.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton
                onClick={() => setDeleteDialog({ open: true, roomType })}
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
                Manage room categories and pricing across all properties
              </Typography>
            </Box>
            <Button
              onClick={() => router.push(`/${businessUnitId}/admin/operations/room-types/new`)}
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
              Add Room Type
            </Button>
          </Box>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}`, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search room types..."
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
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                  label="Type"
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
                  {roomTypeOptions.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Status</InputLabel>
                <Select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
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
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
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

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Occupancy</InputLabel>
                <Select
                  value={occupancyFilter}
                  onChange={(e) => setOccupancyFilter(e.target.value)}
                  label="Occupancy"
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
                  <MenuItem value="all">All Occupancy</MenuItem>
                  {uniqueOccupancies.map(occupancy => (
                    <MenuItem key={occupancy} value={occupancy.toString()}>
                      {occupancy} guests
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
            Showing {filteredRoomTypes.length} of {roomTypes.length} room types
          </Typography>
        </Box>

        {/* Cards Layout */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: darkTheme.primary }} />
          </Box>
        ) : filteredRoomTypes.length === 0 ? (
          <Card sx={{ 
            backgroundColor: darkTheme.surface, 
            borderRadius: '8px', 
            border: `1px solid ${darkTheme.border}`,
            textAlign: 'center',
            py: 8,
          }}>
            <Typography sx={{ color: darkTheme.textSecondary, fontSize: '1.1rem' }}>
              No room types found
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
            {filteredRoomTypes.map((roomType) => (
              <RoomTypeCard key={roomType.id} roomType={roomType} />
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, roomType: null })}
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              color: darkTheme.text,
              border: `1px solid ${darkTheme.border}`,
            },
          }}
        >
          <DialogTitle sx={{ color: darkTheme.text }}>Delete Room Type</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: darkTheme.textSecondary }}>
              Are you sure you want to delete &quot;{deleteDialog.roomType?.name}&quot;? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, roomType: null })}
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

export default RoomTypeListPage;