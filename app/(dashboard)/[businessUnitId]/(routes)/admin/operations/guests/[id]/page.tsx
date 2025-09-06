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
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  VerifiedUser as VerifiedUserIcon,
  Star as StarIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { getGuestById, GuestData, updateGuest, UpdateGuestData } from '@/lib/actions/guest-management';
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

interface GuestFormData {
  businessUnitId: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  country: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  passportNumber: string;
  passportExpiry: string;
  idNumber: string;
  idType: string;
  preferences: string; // Stored as a string for the form input
  loyaltyNumber: string;
  vipStatus: boolean;
  marketingOptIn: boolean;
  source: string;
  notes: string;
}

interface GuestImages {
  images: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
    imageId?: string;
  }>;
  removeImageIds: string[];
}

const EditGuestPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const guestId = params.id as string;
  const { businessUnitId } = useBusinessUnit();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    businessUnitId: '',
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    passportNumber: '',
    passportExpiry: '',
    idNumber: '',
    idType: '',
    preferences: '',
    loyaltyNumber: '',
    vipStatus: false,
    marketingOptIn: false,
    source: '',
    notes: '',
  });
  const [images, setImages] = useState<GuestImages>({
    images: [],
    removeImageIds: [],
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const loadGuest = async () => {
      try {
        const guestData = await getGuestById(guestId);
        if (guestData) {
          setGuest(guestData);
          setFormData({
            businessUnitId: guestData.businessUnitId,
            title: guestData.title || '',
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            email: guestData.email,
            phone: guestData.phone || '',
            dateOfBirth: guestData.dateOfBirth ? new Date(guestData.dateOfBirth).toISOString().slice(0, 10) : '',
            nationality: guestData.nationality || '',
            country: guestData.country || '',
            address: guestData.address || '',
            city: guestData.city || '',
            state: guestData.state || '',
            postalCode: guestData.postalCode || '',
            passportNumber: guestData.passportNumber || '',
            passportExpiry: guestData.passportExpiry ? new Date(guestData.passportExpiry).toISOString().slice(0, 10) : '',
            idNumber: guestData.idNumber || '',
            idType: guestData.idType || '',
            preferences: guestData.preferences ? JSON.stringify(guestData.preferences) : '',
            loyaltyNumber: guestData.loyaltyNumber || '',
            vipStatus: guestData.vipStatus,
            marketingOptIn: guestData.marketingOptIn,
            source: guestData.source || '',
            notes: guestData.notes || '',
          });

          // Initialize existing guest images with proper ID tracking
          if (guestData.images && guestData.images.length > 0) {
            const existingImages = guestData.images.map(img => ({
              fileName: img.image.originalUrl.split('/').pop() || 'image',
              name: img.image.title || img.image.altText || 'Guest Image',
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
            message: 'Guest not found',
            severity: 'error',
          });
          router.push(`/${businessUnitId}/admin/operations/guests`);
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to load guest: ${error}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (guestId && businessUnitId) {
      loadGuest();
    }
  }, [guestId, router, businessUnitId]);

  const handleInputChange = (field: keyof GuestFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const preferencesObj = formData.preferences ? JSON.parse(formData.preferences) : null;

      // Filter out new images (ones that weren't in the original guest)
      const newImages = images.images
        .filter(img => {
          if (!guest?.images) return true;
          return !guest.images.some(existingImg =>
            existingImg.image.originalUrl === img.fileUrl
          );
        })
        .filter(img => img.fileUrl !== null)
        .map(img => ({
          ...img,
          fileUrl: img.fileUrl as string
        }));

      const guestData: UpdateGuestData = {
        id: guestId,
        businessUnitId: formData.businessUnitId,
        title: formData.title || null,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        nationality: formData.nationality || null,
        country: formData.country || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        postalCode: formData.postalCode || null,
        passportNumber: formData.passportNumber || null,
        passportExpiry: formData.passportExpiry ? new Date(formData.passportExpiry) : null,
        idNumber: formData.idNumber || null,
        idType: formData.idType || null,
        preferences: preferencesObj,
        notes: formData.notes || null,
        loyaltyNumber: formData.loyaltyNumber || null,
        vipStatus: formData.vipStatus,
        marketingOptIn: formData.marketingOptIn,
        source: formData.source || null,
        guestImages: newImages.length > 0 ? newImages : undefined,
        removeImageIds: images.removeImageIds.length > 0 ? images.removeImageIds : undefined,
      };

      const result = await updateGuest(guestData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Guest updated successfully',
          severity: 'success',
        });
        router.push(`/${businessUnitId}/admin/operations/guests`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update guest',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating guest ${error}`,
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ color: darkTheme.text }} />
      </Container>
    );
  }

  if (!guest) {
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
          Guest not found
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
              onClick={() => router.push(`/${businessUnitId}/admin/operations/guests`)}
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
            Edit Guest
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
            Update guest information and preferences
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Personal Information */}
            <Card sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
            }}>
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
                  Personal Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      disabled={saving}
                      sx={{
                        flex: 1,
                        minWidth: 100,
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
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
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
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
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
                  </Box>
                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    fullWidth
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
                    }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
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
                      label="Date of Birth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      InputLabelProps={{ shrink: true }}
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
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
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
                      label="Country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
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
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
            }}>
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
                  Address Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    fullWidth
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
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
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
                      label="State/Province"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
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
                      label="Postal Code"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
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
                </Box>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
            }}>
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
                  Identification
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Passport Number"
                      value={formData.passportNumber}
                      onChange={(e) => handleInputChange('passportNumber', e.target.value)}
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
                      label="Passport Expiry"
                      type="date"
                      value={formData.passportExpiry}
                      onChange={(e) => handleInputChange('passportExpiry', e.target.value)}
                      InputLabelProps={{ shrink: true }}
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
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="ID Number"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
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
                      label="ID Type"
                      value={formData.idType}
                      onChange={(e) => handleInputChange('idType', e.target.value)}
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
                  </Box>
                  <TextField
                    label="Loyalty Number"
                    value={formData.loyaltyNumber}
                    onChange={(e) => handleInputChange('loyaltyNumber', e.target.value)}
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
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
            }}>
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
                  Preferences & Notes
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Preferences (JSON)"
                    value={formData.preferences}
                    onChange={(e) => handleInputChange('preferences', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Enter preferences as a JSON object (e.g., {'bedType': 'King', 'diet': 'Vegan'})"
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
                  <TextField
                    label="Internal Notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Internal staff notes about the guest"
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

            {/* Guest Images */}
            <Card sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
            }}>
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
                    Guest Images
                  </Typography>
                </Box>

                {/* Existing Images */}
                {images.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mb: 2 }}>
                      Guest Images ({images.images.length})
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
                    maxFiles={3}
                  />
                </Box>

                <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary }}>
                  Upload up to 3 images for guest identification. Recommended size: 800x600px or larger. Supports JPG, PNG, WEBP and GIF formats.
                </Typography>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: darkTheme.primary,
                transform: 'translateY(-4px)',
              }
            }}>
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
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.vipStatus}
                        onChange={(e) => handleInputChange('vipStatus', e.target.checked)}
                        disabled={saving}
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
                          transition: 'all 0.2s ease-in-out',
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ fontSize: 16, color: darkTheme.warning }} />
                        <Typography sx={{ color: darkTheme.textSecondary }}>VIP Status</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.marketingOptIn}
                        onChange={(e) => handleInputChange('marketingOptIn', e.target.checked)}
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
                        <VerifiedUserIcon sx={{ fontSize: 16, color: darkTheme.success }} />
                        <Typography sx={{ color: darkTheme.textSecondary }}>Marketing Opt-In</Typography>
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
                onClick={() => router.push(`/${businessUnitId}/admin/operations/guests`)}
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

export default EditGuestPage;