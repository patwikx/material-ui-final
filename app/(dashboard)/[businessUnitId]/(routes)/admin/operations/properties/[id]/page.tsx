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
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Photo as PhotoIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { PropertyType } from '@prisma/client';
import { BusinessUnitData } from '@/lib/actions/business-units';
import { getBusinessUnitById, updateBusinessUnit, UpdateBusinessUnitData } from '@/lib/actions/business-management';
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

interface BusinessUnitFormData {
  name: string;
  displayName: string;
  description: string;
  shortDescription: string;
  propertyType: PropertyType;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  email: string;
  website: string;
  slug: string;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
}

interface BusinessUnitImages {
  logo: { fileName: string; name: string; fileUrl: string } | null;
  images: Array<{ fileName: string; name: string; fileUrl: string }>;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'RESORT', label: 'Resort' },
  { value: 'VILLA_COMPLEX', label: 'Villa' },
  { value: 'APARTMENT_HOTEL', label: 'Apartment' },
  { value: 'BOUTIQUE_HOTEL', label: 'Hostel' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const EditBusinessUnitPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const businessUnitId = params.id as string;
  const { businessUnitId: currentBusinessUnitId } = useBusinessUnit();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessUnit, setBusinessUnit] = useState<BusinessUnitData | null>(null);
  const [formData, setFormData] = useState<BusinessUnitFormData>({
    name: '',
    displayName: '',
    description: '',
    shortDescription: '',
    propertyType: 'HOTEL',
    city: '',
    state: '',
    country: 'Philippines',
    address: '',
    latitude: null,
    longitude: null,
    phone: '',
    email: '',
    website: '',
    slug: '',
    isActive: true,
    isPublished: false,
    isFeatured: false,
    sortOrder: 0,
    primaryColor: '',
    secondaryColor: '',
    logo: '',
  });

  const [images, setImages] = useState<BusinessUnitImages>({
    logo: null,
    images: [],
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const loadBusinessUnit = async () => {
      try {
        const businessUnitData = await getBusinessUnitById(businessUnitId);
        if (businessUnitData) {
          setBusinessUnit(businessUnitData);
          setFormData({
            name: businessUnitData.name,
            displayName: businessUnitData.displayName,
            description: businessUnitData.description || '',
            shortDescription: businessUnitData.shortDescription || '',
            propertyType: businessUnitData.propertyType,
            city: businessUnitData.city,
            state: businessUnitData.state || '',
            country: businessUnitData.country,
            address: businessUnitData.address || '',
            latitude: businessUnitData.latitude,
            longitude: businessUnitData.longitude,
            phone: businessUnitData.phone || '',
            email: businessUnitData.email || '',
            website: businessUnitData.website || '',
            slug: businessUnitData.slug,
            isActive: businessUnitData.isActive,
            isPublished: businessUnitData.isPublished,
            isFeatured: businessUnitData.isFeatured,
            sortOrder: businessUnitData.sortOrder,
            primaryColor: businessUnitData.primaryColor || '',
            secondaryColor: businessUnitData.secondaryColor || '',
            logo: businessUnitData.logo || '',
          });

          // Initialize existing logo if it exists
          if (businessUnitData.logo) {
            setImages(prev => ({
              ...prev,
              logo: {
                fileName: businessUnitData.logo || '',
                name: 'Current Logo',
                fileUrl: businessUnitData.logo || '',
              }
            }));
          }
        } else {
          setSnackbar({
            open: true,
            message: 'Business unit not found',
            severity: 'error',
          });
          router.push(`/${currentBusinessUnitId}/admin/operations/properties`);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load business unit',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (businessUnitId && currentBusinessUnitId) {
      loadBusinessUnit();
    }
  }, [businessUnitId, router, currentBusinessUnitId]);

  const handleInputChange = (field: keyof BusinessUnitFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogoUpload = (result: { fileName: string; name: string; fileUrl: string }) => {
    setImages(prev => ({
      ...prev,
      logo: result,
    }));
    setFormData(prev => ({ ...prev, logo: result.fileUrl }));
  };

  const handleLogoRemove = () => {
    setImages(prev => ({
      ...prev,
      logo: null,
    }));
    setFormData(prev => ({ ...prev, logo: '' }));
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
    setSaving(true);

    try {
      const businessUnitData: UpdateBusinessUnitData = {
        id: businessUnitId,
        ...formData,
        description: formData.description || null,
        shortDescription: formData.shortDescription || null,
        state: formData.state || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        primaryColor: formData.primaryColor || null,
        secondaryColor: formData.secondaryColor || null,
        logo: formData.logo || null,
      };

      const result = await updateBusinessUnit(businessUnitData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Business unit updated successfully',
          severity: 'success',
        });
        router.push(`/${currentBusinessUnitId}/admin/operations/properties`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update business unit',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating business unit',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: darkTheme.background, minHeight: '100vh', color: darkTheme.text }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Typography sx={{ color: darkTheme.text }}>Loading business unit...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!businessUnit) {
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
            Business unit not found
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
              onClick={() => router.push(`/${currentBusinessUnitId}/admin/operations/properties`)}
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
            Edit Property
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
            Update business unit information and settings
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: darkTheme.textSecondary,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                '&.Mui-selected': {
                  color: darkTheme.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: darkTheme.primary,
              },
            }}
          >
            <Tab label="Basic Information" />
            <Tab label="Media & Branding" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit}>
          <TabPanel value={tabValue} index={0}>
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
                      label="Property Name"
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
                      helperText="Public-facing name for the property"
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
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
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

                    <FormControl sx={{ minWidth: 200, flex: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Property Type</InputLabel>
                      <Select
                        value={formData.propertyType}
                        onChange={(e) => handleInputChange('propertyType', e.target.value as PropertyType)}
                        label="Property Type"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        }}
                      >
                        {propertyTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>

              {/* Location Information */}
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
                    Location Information
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
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
                      <TextField
                        label="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
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
                        label="State/Province"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
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
                        label="Country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
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
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Latitude"
                        type="number"
                        value={formData.latitude || ''}
                        onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : "")}
                        inputProps={{ step: 'any' }}
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
                        label="Longitude"
                        type="number"
                        value={formData.longitude || ''}
                        onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : "")}
                        inputProps={{ step: 'any' }}
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

              {/* Contact Information */}
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
                    Contact Information
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

                    <TextField
                      label="Website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
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
                  </Box>
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
                            <BusinessIcon sx={{ fontSize: 16, color: darkTheme.success }} />
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
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Logo Upload */}
              <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <PhotoIcon sx={{ fontSize: 20, color: darkTheme.primary }} />
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: darkTheme.text,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      Property Logo
                    </Typography>
                  </Box>

                  {images.logo ? (
                    <Box sx={{ mb: 3 }}>
                      <UploadedFileDisplay
                        fileName={images.logo.fileName}
                        name={images.logo.name}
                        fileUrl={images.logo.fileUrl}
                        onRemove={handleLogoRemove}
                        disabled={saving}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ mb: 3 }}>
                      <FileUpload
                        onUploadComplete={handleLogoUpload}
                        onUploadError={handleUploadError}
                        disabled={saving}
                        maxSize={5}
                        accept=".jpg,.jpeg,.png,.gif,.svg"
                      />
                    </Box>
                  )}

                  <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mt: 2 }}>
                    Upload a logo for your property. Recommended size: 200x200px or larger. Supports JPG, PNG, GIF, and SVG formats.
                  </Typography>
                </CardContent>
              </Card>

              {/* Property Images */}
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
                      Property Images
                    </Typography>
                  </Box>

                  {/* Existing Images */}
                  {images.images.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mb: 2 }}>
                        Uploaded Images ({images.images.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {images.images.map((image, index) => (
                          <UploadedFileDisplay
                            key={index}
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
                      accept=".jpg,.jpeg,.png,.gif"
                    />
                  </Box>

                  <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary }}>
                    Upload images showcasing your property. Recommended size: 1200x800px or larger. Supports JPG, PNG, and GIF formats.
                  </Typography>
                </CardContent>
              </Card>

              {/* Branding */}
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
                    Brand Colors
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Primary Color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        placeholder="#111827"
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
                        label="Secondary Color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        placeholder="#6b7280"
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
                    <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary }}>
                      Define your brand colors using hex codes (e.g., #3b82f6). These colors will be used throughout your property&apos;s interface.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 4, mt: 4 }}>
            <Button
              type="button"
              onClick={() => router.push(`/${currentBusinessUnitId}/admin/operations/properties`)}
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

export default EditBusinessUnitPage;