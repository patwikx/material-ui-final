'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Alert,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Image as ImageIcon,
  Monitor,
  Palette,
  Visibility,
  Star,
  People,
  AccessTime,
  BarChart,
  Report,
} from '@mui/icons-material';
import Link from 'next/link';
import { createHeroSlide } from '@/lib/cms-actions/hero';
import { FileUpload, UploadedFileDisplay } from '@/components/file-upload'; // Import the FileUpload component
import { useRouter } from 'next/navigation';



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

const NewHeroSlidePage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const [targetPages, setTargetPages] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);

  // FIX: State to hold uploaded file information
  const [uploadedImage, setUploadedImage] = useState<{ fileName: string; name: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadedVideo, setUploadedVideo] = useState<{ fileName: string; name: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setNotification(null);
    setErrors({});

    if (!formRef.current) return;

    const formData = new FormData(event.currentTarget);

    // FIX: Add uploaded file info to FormData
    if (uploadedImage) {
      formData.set('backgroundImage', uploadedImage.fileName);
    }
    if (uploadedVideo) {
      formData.set('backgroundVideo', uploadedVideo.fileName);
    }
    
    // Convert multi-select arrays to FormData
    targetPages.forEach(page => formData.append('targetPages', page));
    targetAudience.forEach(audience => formData.append('targetAudience', audience));

    const result = await createHeroSlide(formData);

    if (result.success) {
      setNotification({ type: 'success', message: 'Hero slide created successfully! Redirecting...' });
      setTimeout(() => {
        router.push('/admin/cms/hero-slides');
      }, 2000);
    } else {
      setNotification({ type: 'error', message: result.message });
      setErrors(result.errors || {});
    }
    setIsLoading(false);
  };

  const getError = (field: string) => errors[field];

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
                <ArrowBack />
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
            </Box>
            
            <Button
              form="hero-form"
              type="submit"
              disabled={isLoading}
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
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            >
              {isLoading ? 'Creating...' : 'Create Hero Slide'}
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
            Create New Hero Slide
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
            Design compelling hero sections that capture attention and drive engagement
          </Typography>
        </Box>

        {/* Notification Alert */}
        {notification && (
          <Alert 
            severity={notification.type} 
            sx={{ 
              mb: 4,
              backgroundColor: notification.type === 'success' ? darkTheme.successBg : darkTheme.errorBg,
              borderColor: notification.type === 'success' ? darkTheme.success : darkTheme.error,
              border: `1px solid`,
              borderRadius: '8px',
              color: notification.type === 'success' ? darkTheme.success : darkTheme.error,
              '& .MuiAlert-icon': { 
                color: notification.type === 'success' ? darkTheme.success : darkTheme.error 
              }
            }}
          >
            {notification.message}
            {notification.type === 'error' && Object.keys(errors).length > 0 && (
              <Box component="ul" sx={{ m: 0, pl: 2, mt: 1 }}>
                {Object.entries(errors).map(([field, error]) => (
                  <Box component="li" key={field} sx={{ fontSize: '0.875rem' }}>
                    {error}
                  </Box>
                ))}
              </Box>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit} ref={formRef} id="hero-form">
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
                        <Monitor sx={{ color: darkTheme.success, fontSize: 24 }} />
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
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1, fontSize: '0.875rem' }}>
                          Background Image
                        </Typography>
                        {uploadedImage ? (
                          <UploadedFileDisplay
                            file={uploadedImage}
                            onRemove={() => setUploadedImage(null)}
                          />
                        ) : (
                          <FileUpload
                            onUploadComplete={setUploadedImage}
                            onUploadError={(message) => setNotification({ type: 'error', message })}
                            accept="image/jpeg,image/png,image/gif"
                          />
                        )}
                      </Box>

                      {/* Background Video URL */}
                      <TextField
                        label="Background Video URL"
                        name="backgroundVideo"
                        fullWidth
                        placeholder="https://example.com/hero-video.mp4"
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

                      {/* Alt Text and Caption */}
                      <TextField
                        label="Alt Text"
                        name="altText"
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

            {/* Right Column - Sidebar */}
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
                  <Box sx={{ p: 3, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: darkTheme.selectedBg,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Report sx={{ color: darkTheme.primary, fontSize: 16 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.125rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Slide Status
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: darkTheme.text }}>
                              Active
                            </Typography>
                            <Chip
                                size="small"
                                icon={<Visibility sx={{ fontSize: 14 }} />}
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
                          defaultChecked={true}
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
                                icon={<Star sx={{ fontSize: 14 }} />}
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
                          defaultChecked={false}
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
                        defaultValue={0}
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
                  <Box sx={{ p: 3, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: darkTheme.warningBg,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Palette sx={{ color: darkTheme.warning, fontSize: 16 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.125rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Design & Layout
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      {['displayType', 'textAlignment'].map((field) => (
                        <FormControl 
                          key={field}
                          fullWidth 
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              backgroundColor: darkTheme.background,
                              borderRadius: '8px',
                              color: darkTheme.text,
                              '& fieldset': { borderColor: darkTheme.border },
                              '&:hover fieldset': { borderColor: darkTheme.primary },
                              '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                              color: darkTheme.textSecondary,
                              '&.Mui-focused': { color: darkTheme.primary },
                            },
                            '& .MuiSelect-icon': { color: darkTheme.textSecondary },
                          }}
                        >
                          <InputLabel>
                            {field === 'displayType' ? 'Display Type' : 'Text Alignment'}
                          </InputLabel>
                          <Select
                            name={field}
                            defaultValue={field === 'displayType' ? 'fullscreen' : 'center'}
                            label={field === 'displayType' ? 'Display Type' : 'Text Alignment'}
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
                            {field === 'displayType' ? [
                              <MenuItem key="fullscreen" value="fullscreen">Fullscreen</MenuItem>,
                              <MenuItem key="banner" value="banner">Banner</MenuItem>,
                              <MenuItem key="carousel" value="carousel">Carousel</MenuItem>
                            ] : [
                              <MenuItem key="left" value="left">Left Aligned</MenuItem>,
                              <MenuItem key="center" value="center">Center Aligned</MenuItem>,
                              <MenuItem key="right" value="right">Right Aligned</MenuItem>
                            ]}
                          </Select>
                        </FormControl>
                      ))}
                      
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1, fontSize: '0.875rem' }}>
                          Overlay Color
                        </Typography>
                        <TextField
                          name="overlayColor"
                          type="color"
                          defaultValue="#000000"
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
                          }}
                        />
                      </Box>
                      
                      <TextField
                        label="Overlay Opacity"
                        name="overlayOpacity"
                        type="number"
                        defaultValue={0.3}
                        placeholder="0.3"
                        inputProps={{ min: "0", max: "1", step: "0.1" }}
                        fullWidth
                        error={!!getError('overlayOpacity')}
                        helperText={getError('overlayOpacity')}
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
                            color: getError('overlayOpacity') ? darkTheme.error : darkTheme.textSecondary,
                          },
                        }}
                      />
                      
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1, fontSize: '0.875rem' }}>
                          Text Color
                        </Typography>
                        <TextField
                          name="textColor"
                          type="color"
                          defaultValue="#ffffff"
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
                          }}
                        />
                      </Box>
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
                  <Box sx={{ p: 3, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: darkTheme.selectedBg,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <People sx={{ color: darkTheme.primary, fontSize: 16 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.125rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Targeting
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <FormControl 
                        fullWidth 
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            backgroundColor: darkTheme.background,
                            borderRadius: '8px',
                            color: darkTheme.text,
                            '& fieldset': { borderColor: darkTheme.border },
                            '&:hover fieldset': { borderColor: darkTheme.primary },
                            '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                          },
                          '& .MuiInputLabel-root': {
                            fontWeight: 600,
                            color: darkTheme.textSecondary,
                            '&.Mui-focused': { color: darkTheme.primary },
                          },
                          '& .MuiSelect-icon': { color: darkTheme.textSecondary },
                        }}
                      >
                        <InputLabel>Target Pages</InputLabel>
                        <Select
                          name="targetPages"
                          multiple
                          value={targetPages}
                          onChange={(e) => {
                            const value = e.target.value as string[];
                            setTargetPages(typeof value === 'string' ? [value] : value);
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
                          <MenuItem key="homepage" value="homepage">Homepage</MenuItem>
                          <MenuItem key="properties" value="properties">Properties</MenuItem>
                          <MenuItem key="offers" value="offers">Offers</MenuItem>
                          <MenuItem key="events" value="events">Events</MenuItem>
                          <MenuItem key="about" value="about">About</MenuItem>
                          <MenuItem key="all" value="all">All Pages</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl 
                        fullWidth 
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            backgroundColor: darkTheme.background,
                            borderRadius: '8px',
                            color: darkTheme.text,
                            '& fieldset': { borderColor: darkTheme.border },
                            '&:hover fieldset': { borderColor: darkTheme.primary },
                            '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                          },
                          '& .MuiInputLabel-root': {
                            fontWeight: 600,
                            color: darkTheme.textSecondary,
                            '&.Mui-focused': { color: darkTheme.primary },
                          },
                          '& .MuiSelect-icon': { color: darkTheme.textSecondary },
                        }}
                      >
                        <InputLabel>Target Audience</InputLabel>
                        <Select
                          name="targetAudience"
                          multiple
                          value={targetAudience}
                          onChange={(e) => {
                            const value = e.target.value as string[];
                            setTargetAudience(typeof value === 'string' ? [value] : value);
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
                          <MenuItem key="all" value="all">All Visitors</MenuItem>
                          <MenuItem key="returning-visitors" value="returning-visitors">Returning Visitors</MenuItem>
                          <MenuItem key="mobile-users" value="mobile-users">Mobile Users</MenuItem>
                          <MenuItem key="desktop-users" value="desktop-users">Desktop Users</MenuItem>
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
                  <Box sx={{ p: 3, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: darkTheme.selectedBg,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AccessTime sx={{ color: darkTheme.primary, fontSize: 16 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.125rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Schedule
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <TextField
                        label="Show From"
                        name="showFrom"
                        type="datetime-local"
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

                {/* Analytics Preview Card */}
                <Card 
                  sx={{ 
                    backgroundColor: darkTheme.surface,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 3, borderBottom: `1px solid ${darkTheme.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: darkTheme.successBg,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BarChart sx={{ color: darkTheme.success, fontSize: 16 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.125rem',
                          color: darkTheme.text,
                          textTransform: 'uppercase',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Analytics
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', mb: 2 }}>
                      {['Views', 'Clicks', 'Conversions'].map((metric) => (
                        <Box key={metric}>
                          <Typography
                            sx={{
                              fontSize: '2rem',
                              fontWeight: 900,
                              color: darkTheme.text,
                              lineHeight: 1,
                            }}
                          >
                            0
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: darkTheme.textSecondary,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              fontWeight: 600,
                            }}
                          >
                            {metric}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: darkTheme.textSecondary,
                        textAlign: 'center',
                      }}
                    >
                      Analytics will be available after publishing
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default NewHeroSlidePage;