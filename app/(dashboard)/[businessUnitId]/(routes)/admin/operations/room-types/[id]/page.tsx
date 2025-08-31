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
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { RoomType } from '@prisma/client';
import { BusinessUnitData, getBusinessUnits } from '@/lib/actions/business-units';
import { getRoomTypeById, RoomTypeData, updateRoomType, UpdateRoomTypeData } from '@/lib/actions/room-type-management';
import { useBusinessUnit } from '@/context/business-unit-context';
import { FileUpload, UploadedFileDisplay } from '@/components/file-upload';

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

interface RoomTypeFormData {
  name: string;
  displayName: string;
  description: string;
  type: RoomType;
  baseRate: number;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  bedConfiguration: string;
  roomSize: number | null;
  hasBalcony: boolean;
  hasOceanView: boolean;
  hasPoolView: boolean;
  hasKitchenette: boolean;
  hasLivingArea: boolean;
  smokingAllowed: boolean;
  petFriendly: boolean;
  isAccessible: boolean;
  extraPersonRate: number | null;
  extraChildRate: number | null;
  floorPlan: string;
  isActive: boolean;
  sortOrder: number;
  businessUnitId: string;
  amenities: string[];
}

interface RoomTypeImages {
  images: Array<{ 
    fileName: string; 
    name: string; 
    fileUrl: string;
    imageId?: string;
  }>;
  removeImageIds: string[];
}

const roomTypes: { value: RoomType; label: string }[] = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'DELUXE', label: 'Deluxe' },
  { value: 'SUITE', label: 'Suite' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'ACCESSIBLE', label: 'Accessible' },
];

const EditRoomTypePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const roomTypeId = params.id as string;
  const { businessUnitId } = useBusinessUnit();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roomType, setRoomType] = useState<RoomTypeData | null>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [formData, setFormData] = useState<RoomTypeFormData>({
    name: '',
    displayName: '',
    description: '',
    type: 'STANDARD',
    baseRate: 0,
    maxOccupancy: 2,
    maxAdults: 2,
    maxChildren: 0,
    maxInfants: 0,
    bedConfiguration: '',
    roomSize: null,
    hasBalcony: false,
    hasOceanView: false,
    hasPoolView: false,
    hasKitchenette: false,
    hasLivingArea: false,
    smokingAllowed: false,
    petFriendly: false,
    isAccessible: false,
    extraPersonRate: null,
    extraChildRate: null,
    floorPlan: '',
    isActive: true,
    sortOrder: 0,
    businessUnitId: '',
    amenities: [],
  });
  const [images, setImages] = useState<RoomTypeImages>({
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
        const [roomTypeData, units] = await Promise.all([
          getRoomTypeById(roomTypeId),
          getBusinessUnits()
        ]);

        setBusinessUnits(units);

        if (roomTypeData) {
          setRoomType(roomTypeData);
          setFormData({
            name: roomTypeData.name,
            displayName: roomTypeData.displayName,
            description: roomTypeData.description || '',
            type: roomTypeData.type,
            baseRate: parseFloat(roomTypeData.baseRate),
            maxOccupancy: roomTypeData.maxOccupancy,
            maxAdults: roomTypeData.maxAdults,
            maxChildren: roomTypeData.maxChildren,
            maxInfants: roomTypeData.maxInfants,
            bedConfiguration: roomTypeData.bedConfiguration || '',
            roomSize: roomTypeData.roomSize,
            hasBalcony: roomTypeData.hasBalcony,
            hasOceanView: roomTypeData.hasOceanView,
            hasPoolView: roomTypeData.hasPoolView,
            hasKitchenette: roomTypeData.hasKitchenette,
            hasLivingArea: roomTypeData.hasLivingArea,
            smokingAllowed: roomTypeData.smokingAllowed,
            petFriendly: roomTypeData.petFriendly,
            isAccessible: roomTypeData.isAccessible,
            extraPersonRate: roomTypeData.extraPersonRate ? parseFloat(roomTypeData.extraPersonRate) : null,
            extraChildRate: roomTypeData.extraChildRate ? parseFloat(roomTypeData.extraChildRate) : null,
            floorPlan: roomTypeData.floorPlan || '',
            isActive: roomTypeData.isActive,
            sortOrder: roomTypeData.sortOrder,
            businessUnitId: roomTypeData.businessUnit.id,
            amenities: roomTypeData.amenities,
          });

          // Initialize existing room type images with proper ID tracking
          if (roomTypeData.images && roomTypeData.images.length > 0) {
            const existingImages = roomTypeData.images.map(img => ({
              fileName: img.image.originalUrl.split('/').pop() || 'image',
              name: img.image.title || img.image.altText || 'Room Type Image',
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
            message: 'Room type not found',
            severity: 'error',
          });
          router.push(`/${businessUnitId}/admin/operations/room-types`);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to load room type: ${error}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (roomTypeId && businessUnitId) {
      loadData();
    }
  }, [roomTypeId, router, businessUnitId]);

  const handleInputChange = (field: keyof RoomTypeFormData, value: string | number | boolean | string[] | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity),
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
    
    // If this is an existing image (has an imageId), add it to removeImageIds
    if (imageToRemove.imageId) {
      setImages(prev => ({
        ...prev,
        removeImageIds: [...prev.removeImageIds, imageToRemove.imageId!],
      }));
    }

    // Remove from display
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
      // Filter out new images (ones that weren't in the original room type)
      const newImages = images.images
        .filter(img => {
          if (!roomType?.images) return true;
          return !roomType.images.some(existingImg => 
            existingImg.image.originalUrl === img.fileUrl
          );
        })
        .filter(img => img.fileUrl !== null)
        .map(img => ({
          ...img,
          fileUrl: img.fileUrl as string
        }));

      const roomTypeData: UpdateRoomTypeData = {
        id: roomTypeId,
        ...formData,
        description: formData.description || null,
        bedConfiguration: formData.bedConfiguration || null,
        floorPlan: formData.floorPlan || null,
        roomTypeImages: newImages.length > 0 ? newImages : undefined,
        removeImageIds: images.removeImageIds.length > 0 ? images.removeImageIds : undefined,
      };

      const result = await updateRoomType(roomTypeData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Room type updated successfully',
          severity: 'success',
        });
        router.push(`/${businessUnitId}/admin/operations/room-types`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update room type',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating room type: ${error}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 4, 
          backgroundColor: darkTheme.background, 
          minHeight: '100vh',
          color: darkTheme.text,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography sx={{ color: darkTheme.text }}>Loading room type...</Typography>
        </Box>
      </Container>
    );
  }

  if (!roomType) {
    return (
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 4,
          backgroundColor: darkTheme.background,
          minHeight: '100vh',
          color: darkTheme.text,
        }}
      >
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
          Room type not found
        </Alert>
      </Container>
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
              onClick={() => router.push(`/${businessUnitId}/admin/operations/room-types`)}
              sx={{ 
                mr: 2, 
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
            Edit Room Type
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
            Update room type information and settings
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Basic Information */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                  <TextField
                    label="Room Type Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    fullWidth
                    sx={{
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
                    label="Display Name"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    required
                    fullWidth
                    helperText="Public-facing name for the room type"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: darkTheme.background,
                        color: darkTheme.text,
                        '& fieldset': { borderColor: darkTheme.border },
                        '&:hover fieldset': { borderColor: darkTheme.primary },
                        '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                      },
                      '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                      '& .MuiFormHelperText-root': { color: darkTheme.textSecondary }
                    }}
                  />

                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    sx={{
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

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Room Type</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value as RoomType)}
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
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

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
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Capacity & Configuration */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                  Capacity & Configuration
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Max Occupancy"
                      type="number"
                      value={formData.maxOccupancy}
                      onChange={(e) => handleInputChange('maxOccupancy', parseInt(e.target.value) || 0)}
                      required
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
                    <TextField
                      label="Max Adults"
                      type="number"
                      value={formData.maxAdults}
                      onChange={(e) => handleInputChange('maxAdults', parseInt(e.target.value) || 0)}
                      required
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
                    <TextField
                      label="Max Children"
                      type="number"
                      value={formData.maxChildren}
                      onChange={(e) => handleInputChange('maxChildren', parseInt(e.target.value) || 0)}
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
                    <TextField
                      label="Max Infants"
                      type="number"
                      value={formData.maxInfants}
                      onChange={(e) => handleInputChange('maxInfants', parseInt(e.target.value) || 0)}
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
                    <TextField
                      label="Bed Configuration"
                      value={formData.bedConfiguration}
                      onChange={(e) => handleInputChange('bedConfiguration', e.target.value)}
                      placeholder="e.g., 1 King Bed, 2 Queen Beds"
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
                      label="Room Size (sqm)"
                      type="number"
                      value={formData.roomSize || ''}
                      onChange={(e) => handleInputChange('roomSize', e.target.value ? parseFloat(e.target.value) : null)}
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
                </Box>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                  Pricing Information
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Base Rate"
                    type="number"
                    value={formData.baseRate}
                    onChange={(e) => handleInputChange('baseRate', parseFloat(e.target.value) || 0)}
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
                    label="Extra Person Rate"
                    type="number"
                    value={formData.extraPersonRate || ''}
                    onChange={(e) => handleInputChange('extraPersonRate', e.target.value ? parseFloat(e.target.value) : null)}
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
                    label="Extra Child Rate"
                    type="number"
                    value={formData.extraChildRate || ''}
                    onChange={(e) => handleInputChange('extraChildRate', e.target.value ? parseFloat(e.target.value) : null)}
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
                </Box>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                  Features & Amenities
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Room Features */}
                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasBalcony}
                          onChange={(e) => handleInputChange('hasBalcony', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.primary,
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.primary,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Has Balcony</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasOceanView}
                          onChange={(e) => handleInputChange('hasOceanView', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.primary,
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.primary,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Ocean View</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasPoolView}
                          onChange={(e) => handleInputChange('hasPoolView', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.primary,
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.primary,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Pool View</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasKitchenette}
                          onChange={(e) => handleInputChange('hasKitchenette', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.primary,
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.primary,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Kitchenette</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.hasLivingArea}
                          onChange={(e) => handleInputChange('hasLivingArea', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.primary,
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.primary,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Living Area</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.smokingAllowed}
                          onChange={(e) => handleInputChange('smokingAllowed', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.warning,
                              '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.warning,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Smoking Allowed</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.petFriendly}
                          onChange={(e) => handleInputChange('petFriendly', e.target.checked)}
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
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Pet Friendly</Typography>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isAccessible}
                          onChange={(e) => handleInputChange('isAccessible', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.primary,
                              '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.primary,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Accessible</Typography>}
                    />
                  </Box>

                  {/* Amenities */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.textSecondary, fontWeight: 600 }}>
                      Amenities
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Add Amenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
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
                      <Button
                        onClick={handleAddAmenity}
                        variant="outlined"
                        startIcon={<AddIcon />}
                        sx={{
                          borderRadius: '8px',
                          borderColor: darkTheme.border,
                          color: darkTheme.textSecondary,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: darkTheme.surfaceHover,
                            borderColor: darkTheme.textSecondary,
                          },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {formData.amenities.map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          onDelete={() => handleRemoveAmenity(amenity)}
                          deleteIcon={<CloseIcon />}
                          sx={{
                            backgroundColor: darkTheme.selectedBg,
                            color: darkTheme.primary,
                            '& .MuiChip-deleteIcon': {
                              color: darkTheme.primary,
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Room Type Images */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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
                    Room Type Images
                  </Typography>
                </Box>

                {/* Existing Images */}
                {images.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mb: 2 }}>
                      Room Type Images ({images.images.length})
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

                {/* Upload New Images */}
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
                  Upload up to 5 images showcasing this room type. Recommended size: 1200x800px or larger. Supports JPG, PNG, WEBP and GIF formats.
                </Typography>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
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

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Sort Order"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    sx={{
                      width: 200,
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
                          <CategoryIcon sx={{ fontSize: 16, color: darkTheme.success }} />
                          <Typography sx={{ color: darkTheme.textSecondary }}>Active</Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                type="button"
                onClick={() => router.push(`/${businessUnitId}/admin/operations/room-types`)}
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
                startIcon={<SaveIcon />}
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
                  '&:hover': {
                    backgroundColor: darkTheme.primaryHover,
                  },
                  '&:disabled': {
                    backgroundColor: darkTheme.textSecondary,
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

export default EditRoomTypePage;