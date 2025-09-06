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
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Hotel as HotelIcon,
  Add as AddIcon,
  Close as CloseIcon,
  AddPhotoAlternate as AddPhotoIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';
import { getRoomById, RoomData, updateRoom, UpdateRoomData } from '@/lib/actions/room-management';
import { BusinessUnitData, getBusinessUnits } from '@/lib/actions/business-units';
import { getRoomTypes, RoomTypeData } from '@/lib/actions/room-type-management';
import { useBusinessUnit } from '@/context/business-unit-context';
import Link from 'next/link';
import { FileUpload, UploadedFileDisplay } from '@/components/file-upload';

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

// FIX: Updated interface to be a complete type for the form data
interface RoomFormData {
  roomNumber: string;
  floor: number | null;
  wing: string;
  status: RoomStatus;
  housekeeping: HousekeepingStatus;
  isActive: boolean;
  notes: string;
  specialFeatures: string[]; // FIX: Added this property
  businessUnitId: string;
  roomTypeId: string;
  outOfOrderUntil: string;
}

interface RoomImages {
  images: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
    imageId?: string;
  }>;
  removeImageIds: string[];
}

const roomStatuses: { value: RoomStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_ORDER', label: 'Out of Order' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'RESERVED', label: 'Reserved' },
];

const housekeepingStatuses: { value: HousekeepingStatus; label: string }[] = [
  { value: 'CLEAN', label: 'Clean' },
  { value: 'INSPECTED', label: 'Inspected' },
  { value: 'DIRTY', label: 'Dirty' },
];

const EditRoomPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { businessUnitId: currentBusinessUnitId } = useBusinessUnit();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<RoomFormData>({
    roomNumber: '',
    floor: null,
    wing: '',
    status: 'AVAILABLE',
    housekeeping: 'CLEAN',
    isActive: true,
    notes: '',
    specialFeatures: [], // FIX: Initialized the missing field
    businessUnitId: '',
    roomTypeId: '',
    outOfOrderUntil: '',
  });
  const [images, setImages] = useState<RoomImages>({
    images: [],
    removeImageIds: [],
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomData, units, types] = await Promise.all([
          getRoomById(roomId),
          getBusinessUnits(),
          getRoomTypes()
        ]);

        setBusinessUnits(units);
        setRoomTypes(types);

        if (roomData) {
          setRoom(roomData);
          setFormData({
            roomNumber: roomData.roomNumber,
            floor: roomData.floor,
            wing: roomData.wing || '',
            housekeeping: roomData.housekeeping,
            outOfOrderUntil: roomData.outOfOrderUntil ? roomData.outOfOrderUntil.toISOString().slice(0, 16) : '',
            status: roomData.status,
            isActive: roomData.isActive,
            notes: roomData.notes || '',
            specialFeatures: roomData.specialFeatures || [],
            businessUnitId: roomData.businessUnit.id,
            roomTypeId: roomData.roomType.id,
          });
          if (roomData.images && roomData.images.length > 0) {
            const existingImages = roomData.images.map(img => ({
              fileName: img.image.originalUrl.split('/').pop() || 'image',
              name: img.image.title || img.image.altText || 'Room Image',
              fileUrl: img.image.originalUrl,
              imageId: img.image.id,
            }));

            setImages(prev => ({
              ...prev,
              images: existingImages,
            }));
          }
        } else {
          setSnackbar({
            open: true,
            message: 'Room not found',
            severity: 'error',
          });
          router.push(`/${currentBusinessUnitId}/admin/operations/rooms`);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load room',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (roomId && currentBusinessUnitId) {
      loadData();
    }
  }, [roomId, router, currentBusinessUnitId]);

  const handleInputChange = (field: keyof RoomFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.specialFeatures.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        specialFeatures: [...prev.specialFeatures, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      specialFeatures: prev.specialFeatures.filter(f => f !== feature),
    }));
  };

  const handleImageUpload = (result: { fileName: string; name: string; fileUrl: string }) => {
    setImages(prev => ({
      ...prev,
      images: [...prev.images, result],
    }));
  };

  const handleImageRemove = (index: number) => {
    const imageToRemove = images.images[index];

    if (imageToRemove.imageId) {
      setImages(prev => ({
        ...prev,
        removeImageIds: [...prev.removeImageIds, imageToRemove.imageId!],
      }));
    }

    setImages(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUploadError = (error: string) => {
    setSnackbar({
      open: true,
      message: `Upload failed: ${error}`,
      severity: 'error',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const newImages = images.images.filter(img => !img.imageId);

      const roomData: UpdateRoomData = {
        id: roomId,
        ...formData,
        notes: formData.notes || null,
        wing: formData.wing || null,
        outOfOrderUntil: formData.outOfOrderUntil ? new Date(formData.outOfOrderUntil) : null,
        specialFeatures: formData.specialFeatures,
        roomImages: newImages.length > 0 ? newImages : undefined,
        removeImageIds: images.removeImageIds.length > 0 ? images.removeImageIds : undefined,
      };

      const result = await updateRoom(roomData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Room updated successfully',
          severity: 'success',
        });
        router.push(`/${currentBusinessUnitId}/admin/operations/rooms`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update room',
          severity: 'error',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating room',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: darkTheme.background, minHeight: '100vh', color: darkTheme.text, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={60} sx={{ color: darkTheme.text }} />
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ backgroundColor: darkTheme.background, minHeight: '100vh', color: darkTheme.text }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error"
            sx={{
              backgroundColor: darkTheme.errorBg,
              borderColor: darkTheme.error,
              border: `1px solid`,
              borderRadius: '8px',
              color: darkTheme.error,
              fontSize: '12px',
              fontWeight: 600,
              '& .MuiAlert-icon': {
                color: darkTheme.error
              }
            }}>
            Room not found
          </Alert>
        </Container>
      </Box>
    );
  }

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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton
              component={Link}
              href={`/${currentBusinessUnitId}/admin/operations/rooms`}
              disabled={saving}
              sx={{
                mr: 2,
                color: darkTheme.textSecondary,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                  color: darkTheme.text,
                  transform: 'scale(1.1)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
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
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
              color: darkTheme.text,
              lineHeight: 1.2,
              ml: 6,
            }}
          >
            Edit Room
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1rem',
              ml: 6,
              maxWidth: '600px',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Update room information and settings
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Basic Information */}
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: darkTheme.text,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    mb: 3,
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
                      fullWidth
                      disabled={saving}
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
                          transition: 'all 0.2s ease-in-out',
                        },
                        '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      }}
                    />
                    <TextField
                      label="Floor"
                      type="number"
                      value={formData.floor || ''}
                      onChange={(e) => handleInputChange('floor', e.target.value ? parseInt(e.target.value) : null)}
                      disabled={saving}
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
                          transition: 'all 0.2s ease-in-out',
                        },
                        '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      }}
                    />
                    <TextField
                      label="Wing"
                      value={formData.wing || ''}
                      onChange={(e) => handleInputChange('wing', e.target.value)}
                      disabled={saving}
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
                          transition: 'all 0.2s ease-in-out',
                        },
                        '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl fullWidth disabled={saving} sx={{ minWidth: 200, flex: 1 }}>
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
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {businessUnits.map((unit) => (
                          <MenuItem key={unit.id} value={unit.id}>
                            {unit.displayName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={saving} sx={{ minWidth: 200, flex: 1 }}>
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
                          transition: 'all 0.2s ease-in-out',
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
                </Box>
              </CardContent>
            </Card>

            {/* Room Status */}
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: darkTheme.text,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    mb: 3,
                  }}
                >
                  Room Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl fullWidth disabled={saving} sx={{ minWidth: 200, flex: 1 }}>
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
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {roomStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={saving} sx={{ minWidth: 200, flex: 1 }}>
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
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          transition: 'all 0.2s ease-in-out',
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

                  {formData.status === 'OUT_OF_ORDER' && (
                    <TextField
                      label="Out of Order Until"
                      name="outOfOrderUntil"
                      type="datetime-local"
                      value={formData.outOfOrderUntil}
                      onChange={(e) => handleInputChange('outOfOrderUntil', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      disabled={saving}
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
                          transition: 'all 0.2s ease-in-out',
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
                    disabled={saving}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: darkTheme.background,
                        color: darkTheme.text,
                        '& fieldset': { borderColor: darkTheme.border },
                        '&:hover fieldset': { borderColor: darkTheme.primary },
                        '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                        transition: 'all 0.2s ease-in-out',
                      },
                      '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      '& .MuiFormHelperText-root': { color: darkTheme.textSecondary }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Special Features */}
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: darkTheme.text,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    mb: 3,
                  }}
                >
                  Special Features
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Add Special Feature"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                        disabled={saving}
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
                            transition: 'all 0.2s ease-in-out',
                          },
                          '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                        }}
                      />
                      <Button
                        onClick={handleAddFeature}
                        variant="outlined"
                        startIcon={<AddIcon />}
                        disabled={saving}
                        sx={{
                          borderRadius: '8px',
                          borderColor: darkTheme.border,
                          color: darkTheme.textSecondary,
                          textTransform: 'none',
                          fontWeight: 600,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: darkTheme.surfaceHover,
                            borderColor: darkTheme.textSecondary,
                            transform: 'translateY(-2px)',
                          },
                          '&:disabled': {
                            color: darkTheme.textSecondary,
                            opacity: 0.5,
                          },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {formData.specialFeatures.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          onDelete={() => handleRemoveFeature(feature)}
                          disabled={saving}
                          deleteIcon={<CloseIcon />}
                          sx={{
                            backgroundColor: darkTheme.selectedBg,
                            color: darkTheme.primary,
                            transition: 'all 0.2s ease-in-out',
                            '& .MuiChip-deleteIcon': {
                              color: darkTheme.primary,
                              transition: 'color 0.2s ease-in-out',
                            },
                            '&:hover': { transform: 'scale(1.05)' },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Room Images */}
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AddPhotoIcon sx={{ fontSize: 20, color: darkTheme.primary }} />
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: darkTheme.text,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Room Images
                  </Typography>
                </Box>
                
                {images.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mb: 2 }}>
                      Room Images ({images.images.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {images.images.map((image, index) => (
                        <UploadedFileDisplay
                          key={`${image.fileUrl}-${index}`}
                          fileName={image.fileName}
                          name={image.name}
                          fileUrl={image.fileUrl}
                          onRemove={() => handleImageRemove(index)}
                          disabled={saving}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <FileUpload
                    onUploadComplete={handleImageUpload}
                    onUploadError={handleUploadError}
                    disabled={saving}
                    maxSize={10}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    multiple={true}
                    maxFiles={5}
                  />
                </Box>

                <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary }}>
                  Upload up to 5 images showcasing this room. Recommended size: 1200x800px or larger. Supports JPG, PNG, WEBP and GIF formats.
                </Typography>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: darkTheme.text,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    mb: 3,
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
                        disabled={saving}
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
                          transition: 'all 0.2s ease-in-out',
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HotelIcon sx={{ fontSize: 16, color: darkTheme.success }} />
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
                onClick={() => router.push(`/${currentBusinessUnitId}/admin/operations/rooms`)}
                disabled={saving}
                sx={{
                  color: darkTheme.textSecondary,
                  borderColor: darkTheme.border,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: darkTheme.surfaceHover,
                    borderColor: darkTheme.textSecondary,
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    color: darkTheme.textSecondary,
                    opacity: 0.5,
                  },
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                sx={{
                  backgroundColor: darkTheme.primary,
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: darkTheme.primaryHover,
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    backgroundColor: darkTheme.textSecondary,
                    color: darkTheme.surface,
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </form>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default EditRoomPage;