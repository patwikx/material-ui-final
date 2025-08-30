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
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Business,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { RestaurantType } from '@prisma/client';
import { BusinessUnitData, getBusinessUnits } from '@/lib/actions/business-units';
import { createRestaurant, CreateRestaurantData } from '@/lib/actions/resto-management';
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
  errorHover: '#b91c1c',
};

interface RestaurantFormData {
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  type: RestaurantType;
  cuisine: string[];
  location: string;
  phone: string;
  email: string;
  operatingHours: Record<string, unknown> | null;
  features: string[];
  priceRange: string;
  averageMeal: number | null;
  currency: string;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  businessUnitId: string;
  totalSeats: number | null;
  privateRooms: number;
  outdoorSeating: boolean;
  airConditioned: boolean;
  acceptsReservations: boolean;
  advanceBookingDays: number;
  minPartySize: number;
  maxPartySize: number | null;
  virtualTourUrl: string | null;
  hasMenu: boolean;
  menuUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  dressCode: string;
}

interface RestaurantImages {
  images: Array<{ 
    fileName: string; 
    name: string; 
    fileUrl: string;
  }>;
  removeImageIds: string[];
}

const restaurantTypes: { value: RestaurantType; label: string }[] = [
  { value: 'FINE_DINING', label: 'Fine Dining' },
  { value: 'CASUAL_DINING', label: 'Casual Dining' },
  { value: 'CAFE', label: 'Cafe' },
  { value: 'BAR', label: 'Bar' },
  { value: 'BUFFET', label: 'Buffet' },
  { value: 'ROOM_SERVICE', label: 'Room Service' },
  { value: 'POOLSIDE', label: 'Poolside' },
  { value: 'SPECIALTY', label: 'Specialty' },
];

const priceRanges = ['Budget', 'Moderate', 'Upscale', 'Luxury'];

const NewRestaurantPage: React.FC = () => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [newCuisine, setNewCuisine] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    type: 'CASUAL_DINING',
    cuisine: [],
    location: '',
    phone: '',
    email: '',
    operatingHours: null,
    features: [],
    priceRange: 'Moderate',
    averageMeal: null,
    currency: 'PHP',
    isActive: true,
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
    businessUnitId: '',
    totalSeats: null,
    privateRooms: 0,
    outdoorSeating: false,
    airConditioned: false,
    acceptsReservations: true,
    advanceBookingDays: 30,
    minPartySize: 1,
    maxPartySize: null,
    virtualTourUrl: null,
    hasMenu: true,
    menuUrl: null,
    metaTitle: null,
    metaDescription: null,
    dressCode: '',
  });
  const [images, setImages] = useState<RestaurantImages>({
    images: [],
    removeImageIds: [],
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const loadBusinessUnits = async () => {
      try {
        const units = await getBusinessUnits();
        setBusinessUnits(units);
        if (units.length > 0) {
          setFormData(prev => ({ ...prev, businessUnitId: units[0].id }));
        }
      } catch (error) {
        console.error('Failed to load business units:', error);
      }
    };

    loadBusinessUnits();
  }, []);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof RestaurantFormData, value: string | number | boolean | string[] | Record<string, unknown> | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when name changes
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleImageUpload = (result: { fileName: string; name: string; fileUrl: string }) => {
    setImages(prev => ({
      ...prev,
      images: [...prev.images, result],
    }));
  };

  const handleImageRemove = (index: number) => {
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

  const handleAddCuisine = () => {
    if (newCuisine.trim() && !formData.cuisine.includes(newCuisine.trim())) {
      setFormData(prev => ({
        ...prev,
        cuisine: [...prev.cuisine, newCuisine.trim()],
      }));
      setNewCuisine('');
    }
  };

  const handleRemoveCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.filter(c => c !== cuisine),
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const restaurantData: CreateRestaurantData = {
        ...formData,
        shortDesc: formData.shortDesc || null,
        location: formData.location || null,
        phone: formData.phone || null,
        email: formData.email || null,
        totalSeats: formData.totalSeats || null,
        privateRooms: formData.privateRooms,
        outdoorSeating: formData.outdoorSeating,
        airConditioned: formData.airConditioned,
        operatingHours: formData.operatingHours,
        features: formData.features,
        dressCode: formData.dressCode || null,
        priceRange: formData.priceRange || null,
        averageMeal: formData.averageMeal || null,
        currency: formData.currency,
        acceptsReservations: formData.acceptsReservations,
        advanceBookingDays: formData.advanceBookingDays,
        minPartySize: formData.minPartySize,
        maxPartySize: formData.maxPartySize,
        virtualTourUrl: formData.virtualTourUrl || null,
        hasMenu: formData.hasMenu,
        menuUrl: formData.menuUrl || null,
        isActive: formData.isActive,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        sortOrder: formData.sortOrder,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        restaurantImages: images.images.length > 0 ? images.images : undefined,
      };

      const result = await createRestaurant(restaurantData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Restaurant created successfully',
          severity: 'success',
        });
        router.push(`/${businessUnitId}/admin/operations/restaurants`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to create restaurant',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while creating restaurant',
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
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton
              onClick={() => router.push(`/${businessUnitId}/admin/operations/restaurants`)}
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
            Create New Restaurant
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
            Create a new restaurant for your properties
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
                    label="Restaurant Name"
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
                    label="Slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    required
                    fullWidth
                    helperText="URL-friendly version of the name"
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
                    required
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

                  <TextField
                    label="Short Description"
                    value={formData.shortDesc}
                    onChange={(e) => handleInputChange('shortDesc', e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    helperText="Brief description for cards and previews"
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

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Restaurant Type</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value as RestaurantType)}
                        label="Restaurant Type"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        }}
                      >
                        {restaurantTypes.map((type) => (
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

            {/* Location & Contact */}
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
                  Location & Contact
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    fullWidth
                    helperText="Specific location within the property"
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

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
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
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
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
                </Box>
              </CardContent>
            </Card>

            {/* Cuisine & Features */}
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
                  Cuisine & Features
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Cuisine Types */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.textSecondary, fontWeight: 600 }}>
                      Cuisine Types
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Add Cuisine Type"
                        value={newCuisine}
                        onChange={(e) => setNewCuisine(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCuisine()}
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
                        onClick={handleAddCuisine}
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
                      {formData.cuisine.map((cuisine) => (
                        <Chip
                          key={cuisine}
                          label={cuisine}
                          onDelete={() => handleRemoveCuisine(cuisine)}
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

                  {/* Features */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.textSecondary, fontWeight: 600 }}>
                      Features
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Add Feature"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
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
                        onClick={handleAddFeature}
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
                      {formData.features.map((feature) => (
                        <Chip
                          key={feature}
                          label={feature}
                          onDelete={() => handleRemoveFeature(feature)}
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
                  <FormControl sx={{ minWidth: 200, flex: 1 }}>
                    <InputLabel sx={{ color: darkTheme.textSecondary }}>Price Range</InputLabel>
                    <Select
                      value={formData.priceRange}
                      onChange={(e) => handleInputChange('priceRange', e.target.value)}
                      label="Price Range"
                      sx={{
                        borderRadius: '8px',
                        backgroundColor: darkTheme.background,
                        color: darkTheme.text,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                      }}
                    >
                      {priceRanges.map((range) => (
                        <MenuItem key={range} value={range}>
                          {range}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Average Meal Price"
                    type="number"
                    value={formData.averageMeal || ''}
                    onChange={(e) => handleInputChange('averageMeal', e.target.value ? parseFloat(e.target.value) : null)}
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
                    label="Currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    sx={{
                      width: 150,
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

            {/* Restaurant Images */}
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
                    Restaurant Images
                  </Typography>
                </Box>

                {/* Existing Images */}
                {images.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mb: 2 }}>
                      Restaurant Images ({images.images.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {images.images.map((image, index) => (
                        <UploadedFileDisplay
                          key={`${image.fileUrl}-${index}`}
                          fileName={image.fileName}
                          name={image.name}
                          fileUrl={image.fileUrl}
                          onRemove={() => handleImageRemove(index)}
                          disabled={loading}
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
                    disabled={loading}
                    maxSize={10}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    multiple={true}
                    maxFiles={5}
                  />
                </Box>

                <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary }}>
                  Upload up to 5 images showcasing your restaurant. Recommended size: 1200x800px or larger. Supports JPG, PNG, WEBP and GIF formats.
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
                          <Business sx={{ fontSize: 16, color: darkTheme.success }} />
                          <Typography sx={{ color: darkTheme.textSecondary }}>Active</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isPublished}
                          onChange={(e) => handleInputChange('isPublished', e.target.checked)}
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
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VisibilityIcon sx={{ fontSize: 16, color: darkTheme.primary }} />
                          <Typography sx={{ color: darkTheme.textSecondary }}>Published</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isFeatured}
                          onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
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
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StarIcon sx={{ fontSize: 16, color: darkTheme.warning }} />
                          <Typography sx={{ color: darkTheme.textSecondary }}>Featured</Typography>
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
                onClick={() => router.push(`/${businessUnitId}/admin/operations/restaurants`)}
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
                {loading ? 'Creating...' : 'Create Restaurant'}
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

export default NewRestaurantPage;