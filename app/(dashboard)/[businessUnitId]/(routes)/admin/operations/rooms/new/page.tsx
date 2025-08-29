'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Hotel as HotelIcon,
  Category as RoomTypeIcon,
  Bed as BedIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';
import { BusinessUnitData, getBusinessUnits } from '@/lib/actions/business-units';
import { getRoomTypes, RoomTypeData } from '@/lib/actions/room-type-management';
import { createRoom, CreateRoomData } from '@/lib/actions/room-management';
import Link from 'next/link';
import { useBusinessUnit } from '@/context/business-unit-context';

// Enhanced dark theme matching the reference aesthetic
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

// FIX: Updated interface to include all necessary fields for creation
interface RoomFormData {
  roomNumber: string;
  floor: number | null;
  wing: string;
  status: RoomStatus;
  housekeeping: HousekeepingStatus;
  isActive: boolean;
  notes: string;
  businessUnitId: string;
  roomTypeId: string;
  outOfOrderUntil: string;
}

const roomStatuses: { value: RoomStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_ORDER', label: 'Out of Order' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'BLOCKED', label: 'Blocked' },
];

const housekeepingStatuses: { value: HousekeepingStatus; label: string }[] = [
  { value: 'CLEAN', label: 'Clean' },
  { value: 'INSPECTED', label: 'Inspected' },
  { value: 'DIRTY', label: 'Dirty' },
];

const NewRoomPage: React.FC = () => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([]);
  const [formData, setFormData] = useState<RoomFormData>({
    roomNumber: '',
    floor: null,
    wing: '',
    status: 'AVAILABLE',
    housekeeping: 'CLEAN',
    isActive: true,
    notes: '',
    businessUnitId: '',
    roomTypeId: '',
    outOfOrderUntil: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [units, types] = await Promise.all([
          getBusinessUnits(),
          getRoomTypes()
        ]);
        setBusinessUnits(units);
        setRoomTypes(types);
        if (units.length > 0) {
          setFormData(prev => ({ ...prev, businessUnitId: units[0].id }));
        }
        if (types.length > 0) {
          setFormData(prev => ({ ...prev, roomTypeId: types[0].id }));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof RoomFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FIX: Ensure all required fields are included and handle nullable types
      const roomData: CreateRoomData = {
        ...formData,
        wing: formData.wing || null,
        notes: formData.notes || null,
        outOfOrderUntil: formData.outOfOrderUntil ? new Date(formData.outOfOrderUntil) : null,
        // The CreateRoomData interface requires housekeeping, so it must be passed.
        // It is not an optional field.
        housekeeping: formData.housekeeping,
      };

      const result = await createRoom(roomData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Room created successfully',
          severity: 'success',
        });
        router.push(`/${businessUnitId}/admin/operations/rooms`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to create room',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while creating room',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
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
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                component={Link} 
                href={`/${businessUnitId}/admin/operations/rooms`}
                sx={{ 
                  color: darkTheme.textSecondary,
                  '&:hover': { 
                    backgroundColor: darkTheme.surfaceHover,
                    color: darkTheme.text,
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                sx={{
                  color: darkTheme.textSecondary,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Back to Rooms
              </Typography>
            </Box>
            
            <Button
              form="room-form"
              type="submit"
              disabled={loading}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: darkTheme.primaryHover,
                },
                '&:disabled': {
                  backgroundColor: darkTheme.textSecondary,
                },
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </Button>
          </Box>

          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              color: darkTheme.text,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
              textAlign: 'center',
              mb: 2,
            }}
          >
            Create New Room
          </Typography>
          
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1.125rem',
              textAlign: 'center',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Create a new room for your properties
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} id="room-form">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Basic Information */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', border: `1px solid ${darkTheme.border}` }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: darkTheme.text,
                    mb: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Basic Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Room Number"
                      value={formData.roomNumber}
                      onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                      required
                      sx={{
                        flex: 1,
                        minWidth: 200,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& fieldset': { borderColor: darkTheme.border },
                          '&:hover fieldset': { borderColor: darkTheme.primary },
                          '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                        },
                        '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      }}
                    />
                    <TextField
                      label="Floor"
                      type="number"
                      value={formData.floor || ''}
                      onChange={(e) => handleInputChange('floor', e.target.value ? parseInt(e.target.value) : null)}
                      sx={{
                        flex: 1,
                        minWidth: 150,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& fieldset': { borderColor: darkTheme.border },
                          '&:hover fieldset': { borderColor: darkTheme.primary },
                          '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                        },
                        '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      }}
                    />
                    {/* FIX: Added wing field */}
                    <TextField
                      label="Wing"
                      value={formData.wing || ''}
                      onChange={(e) => handleInputChange('wing', e.target.value)}
                      sx={{
                        flex: 1,
                        minWidth: 150,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& fieldset': { borderColor: darkTheme.border },
                          '&:hover fieldset': { borderColor: darkTheme.primary },
                          '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                        },
                        '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Property</InputLabel>
                      <Select
                        value={formData.businessUnitId}
                        onChange={(e) => handleInputChange('businessUnitId', e.target.value)}
                        label="Property"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        }}
                      >
                        {businessUnits.map((unit) => (
                          <MenuItem key={unit.id} value={unit.id}>
                            {unit.displayName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Room Type</InputLabel>
                      <Select
                        value={formData.roomTypeId}
                        onChange={(e) => handleInputChange('roomTypeId', e.target.value)}
                        label="Room Type"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        }}
                      >
                        {roomTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value as RoomStatus)}
                        label="Status"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        }}
                      >
                        {roomStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* FIX: Added housekeeping field */}
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Housekeeping</InputLabel>
                      <Select
                        value={formData.housekeeping}
                        onChange={(e) => handleInputChange('housekeeping', e.target.value as HousekeepingStatus)}
                        label="Housekeeping"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover fieldset': { borderColor: darkTheme.primary },
                          '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                        }}
                      >
                        {housekeepingStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* FIX: Added outOfOrderUntil field, shown conditionally */}
                  {formData.status === 'OUT_OF_ORDER' && (
                    <TextField
                      label="Out of Order Until"
                      name="outOfOrderUntil"
                      type="datetime-local"
                      value={formData.outOfOrderUntil}
                      onChange={(e) => handleInputChange('outOfOrderUntil', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                          color: darkTheme.textSecondary,
                          '&.Mui-focused': { color: darkTheme.primary },
                        },
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: darkTheme.background,
                          borderRadius: '8px',
                          color: darkTheme.text,
                          '& fieldset': { borderColor: darkTheme.border },
                          '&:hover fieldset': { borderColor: darkTheme.primary },
                          '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                        },
                      }}
                    />
                  )}

                  <TextField
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Any special notes about this room"
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                        color: darkTheme.textSecondary,
                        '&.Mui-focused': { color: darkTheme.primary },
                      },
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: darkTheme.background,
                        borderRadius: '8px',
                        color: darkTheme.text,
                        '& fieldset': { borderColor: darkTheme.border },
                        '&:hover fieldset': { borderColor: darkTheme.primary },
                        '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                      },
                      '& .MuiFormHelperText-root': {
                        color: darkTheme.textSecondary,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', border: `1px solid ${darkTheme.border}` }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: darkTheme.text,
                    mb: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Settings
                </Typography>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
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
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BedIcon sx={{ fontSize: 16, color: darkTheme.success }} />
                        <Typography sx={{ color: darkTheme.textSecondary }}>Active</Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                type="button"
                onClick={() => router.push(`/${businessUnitId}/admin/operations/rooms`)}
                sx={{
                  color: darkTheme.textSecondary,
                  borderColor: darkTheme.border,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: darkTheme.surfaceHover,
                    borderColor: darkTheme.textSecondary,
                  },
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  backgroundColor: darkTheme.primary,
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: darkTheme.primaryHover,
                  },
                  '&:disabled': {
                    backgroundColor: darkTheme.textSecondary,
                  },
                }}
              >
                {loading ? 'Creating...' : 'Create Room'}
              </Button>
            </Box>
          </Box>
        </form>

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

export default NewRoomPage;