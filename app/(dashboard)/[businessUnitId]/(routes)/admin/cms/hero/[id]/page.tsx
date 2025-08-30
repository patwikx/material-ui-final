'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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
  Switch,
  Stack,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Visibility,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Monitor as MonitorIcon,
  Palette as PaletteIcon,
  People as PeopleIcon,
  Report as ReportIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { getHeroById, updateHeroSlide } from '@/lib/cms-actions/hero-management';
import { FileUpload, UploadedFileDisplay } from '@/components/file-upload';

// Dark theme colors matching the sidebar
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

interface HeroFormData {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundImage: string;
  backgroundVideo: string;
  overlayImage: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  displayType: string;
  textAlignment: string;
  overlayColor: string;
  overlayOpacity: number;
  textColor: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  primaryButtonStyle: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  secondaryButtonStyle: string;
  showFrom: string;
  showUntil: string;
  targetPages: string[];
  targetAudience: string[];
  altText: string;
  caption: string;
}

const EditHeroPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const heroId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<HeroFormData>({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonUrl: '',
    backgroundImage: '',
    backgroundVideo: '',
    overlayImage: '',
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    displayType: 'fullscreen',
    textAlignment: 'center',
    overlayColor: '#000000',
    overlayOpacity: 0.3,
    textColor: '#ffffff',
    primaryButtonText: '',
    primaryButtonUrl: '',
    primaryButtonStyle: 'primary',
    secondaryButtonText: '',
    secondaryButtonUrl: '',
    secondaryButtonStyle: 'secondary',
    showFrom: '',
    showUntil: '',
    targetPages: [],
    targetAudience: [],
    altText: '',
    caption: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Updated state for uploaded files - now storing both fileName and fileUrl
  const [uploadedFiles, setUploadedFiles] = useState<{
    backgroundImage: { fileName: string; name: string; fileUrl: string } | null;
    backgroundVideo: { fileName: string; name: string; fileUrl: string } | null;
    overlayImage: { fileName: string; name: string; fileUrl: string } | null;
  }>({
    backgroundImage: null,
    backgroundVideo: null,
    overlayImage: null,
  });

  useEffect(() => {
    const loadHero = async () => {
      try {
        const heroData = await getHeroById(heroId);
        if (heroData) {
          setFormData({
            title: heroData.title || '',
            subtitle: heroData.subtitle || '',
            description: heroData.description || '',
            buttonText: heroData.buttonText || '',
            buttonUrl: heroData.buttonUrl || '',
            backgroundImage: heroData.backgroundImage || '',
            backgroundVideo: heroData.backgroundVideo || '',
            overlayImage: heroData.overlayImage || '',
            isActive: heroData.isActive,
            isFeatured: heroData.isFeatured,
            sortOrder: heroData.sortOrder,
            displayType: heroData.displayType || 'fullscreen',
            textAlignment: heroData.textAlignment || 'center',
            overlayColor: heroData.overlayColor || '#000000',
            overlayOpacity: heroData.overlayOpacity || 0.3,
            textColor: heroData.textColor || '#ffffff',
            primaryButtonText: heroData.primaryButtonText || '',
            primaryButtonUrl: heroData.primaryButtonUrl || '',
            primaryButtonStyle: heroData.primaryButtonStyle || 'primary',
            secondaryButtonText: heroData.secondaryButtonText || '',
            secondaryButtonUrl: heroData.secondaryButtonUrl || '',
            secondaryButtonStyle: heroData.secondaryButtonStyle || 'secondary',
            showFrom: heroData.showFrom ? new Date(heroData.showFrom).toISOString().slice(0, 16) : '',
            showUntil: heroData.showUntil ? new Date(heroData.showUntil).toISOString().slice(0, 16) : '',
            targetPages: heroData.targetPages,
            targetAudience: heroData.targetAudience,
            altText: heroData.altText || '',
            caption: heroData.caption || '',
          });

          // Set uploaded files with both fileName and public URL
          if (heroData.backgroundImage) {
            setUploadedFiles(prev => ({
              ...prev,
              backgroundImage: {
                fileName: heroData.backgroundImage!.split('/').pop()!,
                name: heroData.backgroundImage!.split('/').pop()!,
                fileUrl: heroData.backgroundImage!, // This is now the full public URL
              }
            }));
          }
          
          if (heroData.backgroundVideo) {
            setUploadedFiles(prev => ({
              ...prev,
              backgroundVideo: {
                fileName: heroData.backgroundVideo!.split('/').pop()!,
                name: heroData.backgroundVideo!.split('/').pop()!,
                fileUrl: heroData.backgroundVideo!, // This is now the full public URL
              }
            }));
          }
          
          if (heroData.overlayImage) {
            setUploadedFiles(prev => ({
              ...prev,
              overlayImage: {
                fileName: heroData.overlayImage!.split('/').pop()!,
                name: heroData.overlayImage!.split('/').pop()!,
                fileUrl: heroData.overlayImage!, // This is now the full public URL
              }
            }));
          }

        } else {
          setSnackbar({
            open: true,
            message: 'Hero slide not found',
            severity: 'error',
          });
          router.push('/admin/cms/hero-slides');
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to load hero slide: ${error}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (heroId) {
      loadHero();
    }
  }, [heroId, router]);

  const handleInputChange = (field: keyof HeroFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Updated upload handlers to work with the new API response structure
  const handleBackgroundImageUpload = (result: { fileName: string; name: string }) => {
    // Since the API now returns fileUrl, we need to construct it from the response
    const fileUrl = `/api/file/${result.fileName}`; // Adjust this based on your actual file serving endpoint
    
    setUploadedFiles(prev => ({
      ...prev,
      backgroundImage: {
        fileName: result.fileName,
        name: result.name,
        fileUrl: fileUrl,
      }
    }));
    
    // Update form data with just the fileName for storage
    handleInputChange('backgroundImage', result.fileName);
  };

  const handleBackgroundVideoUpload = (result: { fileName: string; name: string }) => {
    const fileUrl = `/api/file/${result.fileName}`;
    
    setUploadedFiles(prev => ({
      ...prev,
      backgroundVideo: {
        fileName: result.fileName,
        name: result.name,
        fileUrl: fileUrl,
      }
    }));
    
    handleInputChange('backgroundVideo', result.fileName);
  };

  const handleOverlayImageUpload = (result: { fileName: string; name: string }) => {
    const fileUrl = `/api/file/${result.fileName}`;
    
    setUploadedFiles(prev => ({
      ...prev,
      overlayImage: {
        fileName: result.fileName,
        name: result.name,
        fileUrl: fileUrl,
      }
    }));
    
    handleInputChange('overlayImage', result.fileName);
  };

  // Updated remove handlers
  const handleRemoveBackgroundImage = () => {
    setUploadedFiles(prev => ({
      ...prev,
      backgroundImage: null,
    }));
    handleInputChange('backgroundImage', '');
  };

  const handleRemoveBackgroundVideo = () => {
    setUploadedFiles(prev => ({
      ...prev,
      backgroundVideo: null,
    }));
    handleInputChange('backgroundVideo', '');
  };

  const handleRemoveOverlayImage = () => {
    setUploadedFiles(prev => ({
      ...prev,
      overlayImage: null,
    }));
    handleInputChange('overlayImage', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Use just the fileName for database storage (not the full URL)
      const updatedData = {
        ...formData,
        backgroundImage: uploadedFiles.backgroundImage?.fileName || '',
        backgroundVideo: uploadedFiles.backgroundVideo?.fileName || '',
        overlayImage: uploadedFiles.overlayImage?.fileName || '',
        showFrom: formData.showFrom ? new Date(formData.showFrom) : null,
        showUntil: formData.showUntil ? new Date(formData.showUntil) : null,
      };

      const result = await updateHeroSlide(heroId, updatedData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Hero slide updated successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update hero slide',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating: ${error}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getError = (field: keyof HeroFormData) => errors[field];

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          backgroundColor: darkTheme.background,
          color: darkTheme.text,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <CircularProgress size={60} sx={{ color: darkTheme.text }} />
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
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                component={Link} 
                href="/admin/cms/hero-slides"
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
                Back to Hero Slides
              </Typography>
              <Typography sx={{ color: darkTheme.textSecondary, mx: 1 }}>/</Typography>
              <Typography
                sx={{
                  color: darkTheme.primary,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Edit Hero Slide
              </Typography>
            </Box>
            
            <Button
              type="submit"
              form="hero-form"
              disabled={saving}
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
                  color: darkTheme.surface,
                },
              }}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
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
              mb: 2,
            }}
          >
            Edit Hero Slide
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1.125rem',
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            Update the hero content and settings to customize its appearance and behavior.
          </Typography>
        </Box>

        {/* Notification Alert */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              backgroundColor: snackbar.severity === 'success' ? darkTheme.successBg : darkTheme.errorBg,
              borderColor: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
              border: `1px solid`,
              borderRadius: '8px',
              color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <form onSubmit={handleSubmit} id="hero-form">
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', xl: 'row' } }}>
            {/* Left Column - Main Content */}
            <Box sx={{ flex: { xl: '2' } }}>
              <Stack spacing={4}>
                {/* Hero Content Card */}
                <Card
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 4, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: darkTheme.selectedBg,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ImageIcon sx={{ color: darkTheme.primary, fontSize: 24 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.5rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Hero Content
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Main content and messaging for your hero slide
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      <TextField
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                        fullWidth
                        placeholder="Discover Paradise Across the Philippines"
                        error={!!getError('title')}
                        helperText={getError('title')}
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
                            '& fieldset': {
                              borderColor: darkTheme.border,
                            },
                            '&:hover fieldset': {
                              borderColor: darkTheme.primary,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: darkTheme.primary,
                            },
                          },
                          '& .MuiFormHelperText-root': {
                            color: getError('title') ? darkTheme.error : darkTheme.textSecondary,
                          },
                        }}
                      />

                      <TextField
                        label="Subtitle"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                        fullWidth
                        placeholder="Experience world-class hospitality"
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

                      <TextField
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Detailed description for the hero section..."
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

                      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField
                          label="Button Text"
                          name="buttonText"
                          value={formData.buttonText}
                          onChange={(e) => handleInputChange('buttonText', e.target.value)}
                          fullWidth
                          placeholder="Book Your Stay"
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

                        <TextField
                          label="Button URL"
                          name="buttonUrl"
                          value={formData.buttonUrl}
                          onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                          fullWidth
                          placeholder="/reservations"
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
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Media Assets Card */}
                <Card
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 4, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: darkTheme.successBg,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MonitorIcon sx={{ color: darkTheme.success, fontSize: 24 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.5rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Media Assets
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Images and videos for your hero slide
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      {/* Background Image Upload */}
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 2, fontSize: '0.875rem' }}>
                          Background Image
                        </Typography>
                        {uploadedFiles.backgroundImage ? (
                          <UploadedFileDisplay
                            fileName={uploadedFiles.backgroundImage.fileName}
                            name={uploadedFiles.backgroundImage.name}
                            fileUrl={uploadedFiles.backgroundImage.fileUrl}
                            onRemove={handleRemoveBackgroundImage}
                          />
                        ) : (
                          <FileUpload
                            onUploadComplete={handleBackgroundImageUpload}
                            onUploadError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
                            accept=".jpg,.jpeg,.png,.gif,.webp"
                            maxSize={16}
                          />
                        )}
                      </Box>

                      {/* Background Video Upload */}
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 2, fontSize: '0.875rem' }}>
                          Background Video
                        </Typography>
                        {uploadedFiles.backgroundVideo ? (
                          <UploadedFileDisplay
                            fileName={uploadedFiles.backgroundVideo.fileName}
                            name={uploadedFiles.backgroundVideo.name}
                            fileUrl={uploadedFiles.backgroundVideo.fileUrl}
                            onRemove={handleRemoveBackgroundVideo}
                          />
                        ) : (
                          <FileUpload
                            onUploadComplete={handleBackgroundVideoUpload}
                            onUploadError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
                            accept=".mp4,.webm,.mov"
                            maxSize={50}
                          />
                        )}
                      </Box>

                      {/* Overlay Image Upload */}
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 2, fontSize: '0.875rem' }}>
                          Overlay Image
                        </Typography>
                        {uploadedFiles.overlayImage ? (
                          <UploadedFileDisplay
                            fileName={uploadedFiles.overlayImage.fileName}
                            name={uploadedFiles.overlayImage.name}
                            fileUrl={uploadedFiles.overlayImage.fileUrl}
                            onRemove={handleRemoveOverlayImage}
                          />
                        ) : (
                          <FileUpload
                            onUploadComplete={handleOverlayImageUpload}
                            onUploadError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
                            accept=".jpg,.jpeg,.png,.gif,.webp"
                            maxSize={16}
                          />
                        )}
                      </Box>

                      {/* Alt Text and Caption */}
                      <TextField
                        label="Alt Text"
                        name="altText"
                        value={formData.altText}
                        onChange={(e) => handleInputChange('altText', e.target.value)}
                        fullWidth
                        placeholder="Stunning view of tropical resort"
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
                      <TextField
                        label="Caption"
                        name="caption"
                        value={formData.caption}
                        onChange={(e) => handleInputChange('caption', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Image caption or subtitle"
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
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>

            {/* Right Column */}
            <Box sx={{ flex: { xl: '1' }, minWidth: { xl: '350px' } }}>
              <Stack spacing={3}>
                {/* Hero Status Card */}
                <Card
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 4, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: darkTheme.selectedBg,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ReportIcon sx={{ color: darkTheme.primary, fontSize: 24 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.5rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Slide Status
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Control the visibility of this slide on the website
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: darkTheme.text }}>
                              Active
                            </Typography>
                            <Chip
                                size="small"
                                icon={<Visibility style={{ fontSize: 14 }} />}
                                label="Visible"
                                sx={{
                                  backgroundColor: darkTheme.selectedBg,
                                  color: darkTheme.primary,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  height: 24,
                                  '& .MuiChip-icon': { color: darkTheme.primary },
                                }}
                              />
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: darkTheme.textSecondary }}>
                            Slide is visible to users
                          </Typography>
                        </Box>
                        <Switch
                          name="isActive"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
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
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: darkTheme.text }}>
                              Featured
                            </Typography>
                            <Chip
                                size="small"
                                icon={<StarIcon style={{ fontSize: 14 }} />}
                                label="Priority"
                                sx={{
                                  backgroundColor: darkTheme.warningBg,
                                  color: darkTheme.warning,
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  height: 24,
                                  '& .MuiChip-icon': { color: darkTheme.warning },
                                }}
                              />
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: darkTheme.textSecondary }}>
                            Higher priority display
                          </Typography>
                        </Box>
                        <Switch
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
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
                      </Box>

                      <TextField
                        label="Sort Order"
                        name="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        inputProps={{ min: "0" }}
                        helperText="Lower numbers appear first"
                        fullWidth
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
                    </Stack>
                  </CardContent>
                </Card>

                {/* Design & Layout Card */}
                <Card
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 4, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: darkTheme.warningBg,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PaletteIcon sx={{ color: darkTheme.warning, fontSize: 24 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.5rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Design & Layout
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Define how the slide looks and behaves
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      <FormControl fullWidth sx={{
                        '& .MuiOutlinedInput-root': { backgroundColor: darkTheme.background, borderRadius: '8px' },
                        '& .MuiInputLabel-root': { fontWeight: 600, color: darkTheme.textSecondary, '&.Mui-focused': { color: darkTheme.primary } },
                        '& .MuiSelect-icon': { color: darkTheme.textSecondary }
                      }}>
                        <InputLabel>Display Type</InputLabel>
                        <Select
                          name="displayType"
                          value={formData.displayType}
                          onChange={(e) => handleInputChange('displayType', e.target.value)}
                          label="Display Type"
                          sx={{
                            color: darkTheme.text,
                            '& fieldset': { borderColor: darkTheme.border },
                            '&:hover fieldset': { borderColor: darkTheme.primary },
                            '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: darkTheme.surface,
                                border: `1px solid ${darkTheme.border}`,
                                borderRadius: '8px',
                                '& .MuiMenuItem-root': {
                                  color: darkTheme.text,
                                  '&:hover': { backgroundColor: darkTheme.surfaceHover },
                                  '&.Mui-selected': { backgroundColor: darkTheme.selectedBg },
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="fullscreen">Fullscreen</MenuItem>
                          <MenuItem value="banner">Banner</MenuItem>
                          <MenuItem value="carousel">Carousel</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth sx={{
                        '& .MuiOutlinedInput-root': { backgroundColor: darkTheme.background, borderRadius: '8px' },
                        '& .MuiInputLabel-root': { fontWeight: 600, color: darkTheme.textSecondary, '&.Mui-focused': { color: darkTheme.primary } },
                        '& .MuiSelect-icon': { color: darkTheme.textSecondary }
                      }}>
                        <InputLabel>Text Alignment</InputLabel>
                        <Select
                          name="textAlignment"
                          value={formData.textAlignment}
                          onChange={(e) => handleInputChange('textAlignment', e.target.value)}
                          label="Text Alignment"
                          sx={{
                            color: darkTheme.text,
                            '& fieldset': { borderColor: darkTheme.border },
                            '&:hover fieldset': { borderColor: darkTheme.primary },
                            '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: darkTheme.surface,
                                border: `1px solid ${darkTheme.border}`,
                                borderRadius: '8px',
                                '& .MuiMenuItem-root': {
                                  color: darkTheme.text,
                                  '&:hover': { backgroundColor: darkTheme.surfaceHover },
                                  '&.Mui-selected': { backgroundColor: darkTheme.selectedBg },
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="left">Left Aligned</MenuItem>
                          <MenuItem value="center">Center Aligned</MenuItem>
                          <MenuItem value="right">Right Aligned</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        label="Overlay Color"
                        name="overlayColor"
                        type="color"
                        value={formData.overlayColor}
                        onChange={(e) => handleInputChange('overlayColor', e.target.value)}
                        fullWidth
                        sx={{
                          height: '56px',
                          '& .MuiInputBase-root': {
                            p: 0,
                            backgroundColor: darkTheme.background,
                            borderRadius: '8px',
                          },
                          '& .MuiOutlinedInput-input': {
                            height: '100%',
                            p: 0,
                            borderRadius: '8px',
                            border: `1px solid ${darkTheme.border}`,
                            '&::-webkit-color-swatch-wrapper': { p: 0 },
                            '&::-webkit-color-swatch': { border: 'none', borderRadius: '8px' },
                          },
                          '& .MuiInputLabel-root': { display: 'none' },
                        }}
                      />
                      <TextField
                        label="Overlay Opacity"
                        name="overlayOpacity"
                        type="number"
                        value={formData.overlayOpacity}
                        onChange={(e) => handleInputChange('overlayOpacity', parseFloat(e.target.value) || 0)}
                        fullWidth
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                        helperText="Value between 0.0 and 1.0"
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
                          '& .MuiFormHelperText-root': { color: darkTheme.textSecondary },
                        }}
                      />
                      <TextField
                        label="Text Color"
                        name="textColor"
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => handleInputChange('textColor', e.target.value)}
                        fullWidth
                        sx={{
                          height: '56px',
                          '& .MuiInputBase-root': {
                            p: 0,
                            backgroundColor: darkTheme.background,
                            borderRadius: '8px',
                          },
                          '& .MuiOutlinedInput-input': {
                            height: '100%',
                            p: 0,
                            borderRadius: '8px',
                            border: `1px solid ${darkTheme.border}`,
                            '&::-webkit-color-swatch-wrapper': { p: 0 },
                            '&::-webkit-color-swatch': { border: 'none', borderRadius: '8px' },
                          },
                          '& .MuiInputLabel-root': { display: 'none' },
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {/* Targeting Card */}
                <Card
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 4, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: darkTheme.selectedBg,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PeopleIcon sx={{ color: darkTheme.primary, fontSize: 24 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.5rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Targeting
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Define when and where this slide is displayed
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      <FormControl fullWidth sx={{
                        '& .MuiOutlinedInput-root': { backgroundColor: darkTheme.background, borderRadius: '8px' },
                        '& .MuiInputLabel-root': { fontWeight: 600, color: darkTheme.textSecondary, '&.Mui-focused': { color: darkTheme.primary } },
                        '& .MuiSelect-icon': { color: darkTheme.textSecondary },
                      }}>
                        <InputLabel>Target Pages</InputLabel>
                        <Select
                          name="targetPages"
                          multiple
                          value={formData.targetPages}
                          onChange={(e) => {
                            const value = e.target.value as string[];
                            setFormData(prev => ({ ...prev, targetPages: value }));
                          }}
                          label="Target Pages"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{
                                    backgroundColor: darkTheme.selectedBg,
                                    color: darkTheme.primary,
                                    fontWeight: 600,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: darkTheme.surface,
                                border: `1px solid ${darkTheme.border}`,
                                borderRadius: '8px',
                                '& .MuiMenuItem-root': {
                                  color: darkTheme.text,
                                  '&:hover': { backgroundColor: darkTheme.surfaceHover },
                                  '&.Mui-selected': { backgroundColor: darkTheme.selectedBg },
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="homepage">Homepage</MenuItem>
                          <MenuItem value="properties">Properties</MenuItem>
                          <MenuItem value="offers">Offers</MenuItem>
                          <MenuItem value="events">Events</MenuItem>
                          <MenuItem value="about">About</MenuItem>
                          <MenuItem value="all">All Pages</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': { backgroundColor: darkTheme.background, borderRadius: '8px' },
                          '& .MuiInputLabel-root': { fontWeight: 600, color: darkTheme.textSecondary, '&.Mui-focused': { color: darkTheme.primary } },
                          '& .MuiSelect-icon': { color: darkTheme.textSecondary },
                        }}
                      >
                        <InputLabel>Target Audience</InputLabel>
                        <Select
                          name="targetAudience"
                          multiple
                          value={formData.targetAudience}
                          onChange={(e) => {
                            const value = e.target.value as string[];
                            setFormData(prev => ({ ...prev, targetAudience: value }));
                          }}
                          label="Target Audience"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{
                                    backgroundColor: darkTheme.selectedBg,
                                    color: darkTheme.primary,
                                    fontWeight: 600,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: darkTheme.surface,
                                border: `1px solid ${darkTheme.border}`,
                                borderRadius: '8px',
                                '& .MuiMenuItem-root': {
                                  color: darkTheme.text,
                                  '&:hover': { backgroundColor: darkTheme.surfaceHover },
                                  '&.Mui-selected': { backgroundColor: darkTheme.selectedBg },
                                },
                              },
                            },
                          }}
                        >
                          <MenuItem value="all">All Visitors</MenuItem>
                          <MenuItem value="returning-visitors">Returning Visitors</MenuItem>
                          <MenuItem value="mobile-users">Mobile Users</MenuItem>
                          <MenuItem value="desktop-users">Desktop Users</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Schedule Card */}
                <Card
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 4, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: darkTheme.selectedBg,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AccessTimeIcon sx={{ color: darkTheme.primary, fontSize: 24 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.5rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Schedule
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Define when this slide is displayed
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      <TextField
                        label="Show From"
                        name="showFrom"
                        type="datetime-local"
                        value={formData.showFrom}
                        onChange={(e) => handleInputChange('showFrom', e.target.value)}
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
                      <TextField
                        label="Show Until"
                        name="showUntil"
                        type="datetime-local"
                        value={formData.showUntil}
                        onChange={(e) => handleInputChange('showUntil', e.target.value)}
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
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Box>
        </form>
      </Container>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor: snackbar.severity === 'success' ? darkTheme.successBg : darkTheme.errorBg,
            borderColor: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
            border: `1px solid`,
            borderRadius: '8px',
            color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditHeroPage;