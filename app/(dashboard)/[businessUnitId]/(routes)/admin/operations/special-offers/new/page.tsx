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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  PushPin as PushPinIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { OfferType, OfferStatus } from '@prisma/client';
import { BusinessUnitData, getAllBusinessUnits } from '@/lib/actions/business-management';
import { createSpecialOffer, CreateSpecialOfferData } from '@/lib/cms-actions/special-offer';
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

interface SpecialOfferFormData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  shortDesc: string;
  type: OfferType;
  status: OfferStatus;
  offerPrice: number;
  originalPrice: number | null;
  savingsAmount: number | null;
  savingsPercent: number | null;
  currency: string;
  validFrom: string;
  validTo: string;
  businessUnitId: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  sortOrder: number;
}

interface OfferImages {
  images: Array<{ 
    fileName: string; 
    name: string; 
    fileUrl: string;
  }>;
  removeImageIds: string[];
}

const offerTypes: { value: OfferType; label: string }[] = [
  { value: 'ROOM_UPGRADE', label: 'Room Discount' },
  { value: 'PACKAGE', label: 'Package Deal' },
  { value: 'EARLY_BIRD', label: 'Early Bird' },
  { value: 'LAST_MINUTE', label: 'Last Minute' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'LOYALTY', label: 'Loyalty' },
];

const offerStatuses: { value: OfferStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'SCHEDULED', label: 'Scheduled' },
];

const NewSpecialOfferPage: React.FC = () => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [loading, setLoading] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [formData, setFormData] = useState<SpecialOfferFormData>({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    shortDesc: '',
    type: 'ROOM_UPGRADE',
    status: 'ACTIVE',
    offerPrice: 0,
    originalPrice: null,
    savingsAmount: null,
    savingsPercent: null,
    currency: 'PHP',
    validFrom: '',
    validTo: '',
    businessUnitId: null,
    isPublished: false,
    isFeatured: false,
    isPinned: false,
    sortOrder: 0,
  });
  const [images, setImages] = useState<OfferImages>({
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
        const units = await getAllBusinessUnits();
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

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof SpecialOfferFormData, value: string | number | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when title changes
      if (field === 'title' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }
      
      // Auto-calculate savings when prices change
      if (field === 'originalPrice' || field === 'offerPrice') {
        const originalPrice = field === 'originalPrice' ? (typeof value === 'number' ? value : null) : prev.originalPrice;
        const offerPrice = field === 'offerPrice' ? (typeof value === 'number' ? value : 0) : prev.offerPrice;
        
        if (originalPrice && originalPrice > offerPrice) {
          updated.savingsAmount = originalPrice - offerPrice;
          updated.savingsPercent = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);
        } else {
          updated.savingsAmount = null;
          updated.savingsPercent = null;
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const offerData: CreateSpecialOfferData = {
        ...formData,
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        offerImages: images.images.length > 0 ? images.images : undefined,
      };

      const result = await createSpecialOffer(offerData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Special offer created successfully',
          severity: 'success',
        });
        router.push(`/${businessUnitId}/admin/cms/special-offers`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to create special offer',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while creating special offer: ${error}`,
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
              onClick={() => router.push(`/${businessUnitId}/admin/cms/special-offers`)}
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
              Content Management
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
            Create New Special Offer
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
            Create a new special offer to attract guests
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
                    label="Offer Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
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
                    helperText="URL-friendly version of the title"
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
                    label="Subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
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
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Offer Type</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value as OfferType)}
                        label="Offer Type"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        }}
                      >
                        {offerTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value as OfferStatus)}
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
                        {offerStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Property</InputLabel>
                      <Select
                        value={formData.businessUnitId || ''}
                        onChange={(e) => handleInputChange('businessUnitId', e.target.value || '')}
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
                        <MenuItem value="">All Properties</MenuItem>
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

            {/* Pricing Information */}
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

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Offer Price"
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => handleInputChange('offerPrice', parseFloat(e.target.value) || 0)}
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
                      label="Original Price"
                      type="number"
                      value={formData.originalPrice || ''}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value ? parseFloat(e.target.value) : "")}
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

                  {/* Savings Display */}
                  {formData.savingsAmount !== null && formData.savingsPercent !== null && (
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: darkTheme.selectedBg, 
                      border: `1px solid ${darkTheme.selected}`,
                      borderRadius: '8px',
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center'
                    }}>
                      <Typography sx={{ color: darkTheme.primary, fontWeight: 600, fontSize: '12px' }}>
                        Savings: {formData.currency} {formData.savingsAmount.toLocaleString()} ({formData.savingsPercent}% OFF)
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Savings Amount"
                      type="number"
                      value={formData.savingsAmount || ''}
                      onChange={(e) => handleInputChange('savingsAmount', e.target.value ? parseFloat(e.target.value) : "")}
                      helperText="Auto-calculated or manual override"
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
                        '& .MuiFormHelperText-root': { color: darkTheme.textSecondary }
                      }}
                    />
                    <TextField
                      label="Savings Percent"
                      type="number"
                      value={formData.savingsPercent || ''}
                      onChange={(e) => handleInputChange('savingsPercent', e.target.value ? parseInt(e.target.value) : "")}
                      helperText="Auto-calculated or manual override"
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
                        '& .MuiFormHelperText-root': { color: darkTheme.textSecondary }
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Validity Period */}
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
                  Validity Period
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Valid From"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => handleInputChange('validFrom', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
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
                    label="Valid To"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => handleInputChange('validTo', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
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

            {/* Offer Images */}
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
                    Offer Images
                  </Typography>
                </Box>

                {/* Existing Images */}
                {images.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mb: 2 }}>
                      Offer Images ({images.images.length})
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
                  Upload up to 5 images showcasing your special offer. Recommended size: 1200x800px or larger. Supports JPG, PNG, WEBP and GIF formats.
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
                          checked={formData.isPublished}
                          onChange={(e) => handleInputChange('isPublished', e.target.checked)}
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
                          <VisibilityIcon sx={{ fontSize: 16, color: darkTheme.success }} />
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
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isPinned}
                          onChange={(e) => handleInputChange('isPinned', e.target.checked)}
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
                          <PushPinIcon sx={{ fontSize: 16, color: darkTheme.primary }} />
                          <Typography sx={{ color: darkTheme.textSecondary }}>Pinned</Typography>
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
                onClick={() => router.push(`/${businessUnitId}/admin/cms/special-offers`)}
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
                {loading ? 'Creating...' : 'Create Special Offer'}
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

export default NewSpecialOfferPage;