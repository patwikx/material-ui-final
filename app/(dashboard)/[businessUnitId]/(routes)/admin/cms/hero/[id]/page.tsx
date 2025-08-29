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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Visibility,
} from '@mui/icons-material';
import {
  Image as ImageIcon,
  Monitor,
  Palette,
  Star,
  Link as LinkIcon,
} from 'lucide-react';
import { getHeroById, updateHeroSlide } from '@/lib/cms-actions/hero-management';

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
};

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
    overlayColor: '',
    overlayOpacity: 0.3,
    textColor: '',
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
  const [newTargetPage, setNewTargetPage] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');

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
            displayType: heroData.displayType,
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

  const handleAddTargetPage = () => {
    if (newTargetPage.trim() && !formData.targetPages.includes(newTargetPage.trim())) {
      setFormData(prev => ({
        ...prev,
        targetPages: [...prev.targetPages, newTargetPage.trim()],
      }));
      setNewTargetPage('');
    }
  };

  const handleRemoveTargetPage = (page: string) => {
    setFormData(prev => ({
      ...prev,
      targetPages: prev.targetPages.filter(p => p !== page),
    }));
  };

  const handleAddTargetAudience = () => {
    if (newTargetAudience.trim() && !formData.targetAudience.includes(newTargetAudience.trim())) {
      setFormData(prev => ({
        ...prev,
        targetAudience: [...prev.targetAudience, newTargetAudience.trim()],
      }));
      setNewTargetAudience('');
    }
  };

  const handleRemoveTargetAudience = (audience: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter(a => a !== audience),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateHeroSlide(heroId, {
        ...formData,
        showFrom: formData.showFrom ? new Date(formData.showFrom) : null,
        showUntil: formData.showUntil ? new Date(formData.showUntil) : null,
      });

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Hero slide updated successfully',
          severity: 'success',
        });
        // Optionally redirect back to list
        // router.push('/admin/cms/hero-slides');
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
        <Typography>Loading hero slide...</Typography>
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
              startIcon={saving ? null : <SaveIcon />}
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

        {/* Form */}
        <form onSubmit={handleSubmit} id="hero-form">
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', xl: 'row' } }}>
            {/* Left Column */}
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
                        <ImageIcon size={24} color={darkTheme.primary} />
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
                        <Monitor size={24} color={darkTheme.success} />
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
                      {['backgroundImage', 'backgroundVideo', 'overlayImage'].map((field) => (
                        <TextField
                          key={field}
                          label={field === 'backgroundImage' ? 'Background Image URL' : field === 'backgroundVideo' ? 'Background Video URL' : 'Overlay Image URL'}
                          name={field}
                          value={formData[field as keyof HeroFormData]}
                          onChange={(e) => handleInputChange(field as keyof HeroFormData, e.target.value)}
                          fullWidth
                          placeholder={
                            field === 'backgroundImage' ? 'https://example.com/hero-image.jpg' :
                            field === 'backgroundVideo' ? 'https://example.com/hero-video.mp4' :
                            'https://example.com/overlay-image.jpg'
                          }
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
                      ))}
                      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
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
                      </Box>
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
                       {/* <Report size={16} style={{ fontSize: 14 }} /> */}
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
                              icon={<Star style={{ fontSize: 14 }} />}
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
                        <Palette size={16} color={darkTheme.warning} />
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

                {/* Call-to-Action Buttons Card */}
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
                          backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LinkIcon size={24} color={'#7c3aed'} />
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
                        Call-to-Action Buttons
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Primary and secondary action buttons
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      {/* Primary Button */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.text, fontWeight: 600 }}>
                          Primary Button
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <TextField
                            label="Button Text"
                            value={formData.primaryButtonText}
                            onChange={(e) => handleInputChange('primaryButtonText', e.target.value)}
                            sx={{
                              flex: 1,
                              minWidth: 200,
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
                            value={formData.primaryButtonUrl}
                            onChange={(e) => handleInputChange('primaryButtonUrl', e.target.value)}
                            sx={{
                              flex: 1,
                              minWidth: 200,
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
                          <FormControl sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: darkTheme.background } }}>
                            <InputLabel sx={{ color: darkTheme.textSecondary, fontWeight: 600 }}>Style</InputLabel>
                            <Select
                              value={formData.primaryButtonStyle}
                              onChange={(e) => handleInputChange('primaryButtonStyle', e.target.value)}
                              label="Style"
                              sx={{
                                color: darkTheme.text,
                                '& .MuiSelect-icon': { color: darkTheme.textSecondary },
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
                              <MenuItem value="primary">Primary</MenuItem>
                              <MenuItem value="secondary">Secondary</MenuItem>
                              <MenuItem value="outline">Outline</MenuItem>
                              <MenuItem value="ghost">Ghost</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>

                      {/* Secondary Button */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.text, fontWeight: 600 }}>
                          Secondary Button
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <TextField
                            label="Button Text"
                            value={formData.secondaryButtonText}
                            onChange={(e) => handleInputChange('secondaryButtonText', e.target.value)}
                            sx={{
                              flex: 1,
                              minWidth: 200,
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
                            value={formData.secondaryButtonUrl}
                            onChange={(e) => handleInputChange('secondaryButtonUrl', e.target.value)}
                            sx={{
                              flex: 1,
                              minWidth: 200,
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
                          <FormControl sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: darkTheme.background } }}>
                            <InputLabel sx={{ color: darkTheme.textSecondary, fontWeight: 600 }}>Style</InputLabel>
                            <Select
                              value={formData.secondaryButtonStyle}
                              onChange={(e) => handleInputChange('secondaryButtonStyle', e.target.value)}
                              label="Style"
                              sx={{
                                color: darkTheme.text,
                                '& .MuiSelect-icon': { color: darkTheme.textSecondary },
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
                              <MenuItem value="primary">Primary</MenuItem>
                              <MenuItem value="secondary">Secondary</MenuItem>
                              <MenuItem value="outline">Outline</MenuItem>
                              <MenuItem value="ghost">Ghost</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Scheduling & Targeting */}
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
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                       {/* <AccessTime size={24} color={'#4f46e5'} /> */}
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
                        Scheduling & Targeting
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
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          label="Show From"
                          type="datetime-local"
                          value={formData.showFrom}
                          onChange={(e) => handleInputChange('showFrom', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{
                            flex: 1,
                            minWidth: 250,
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
                          type="datetime-local"
                          value={formData.showUntil}
                          onChange={(e) => handleInputChange('showUntil', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          sx={{
                            flex: 1,
                            minWidth: 250,
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
                      {/* Target Pages */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.text, fontWeight: 600 }}>
                          Target Pages
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          <TextField
                            label="Add Target Page"
                            value={newTargetPage}
                            onChange={(e) => setNewTargetPage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTargetPage()}
                            sx={{
                              flex: 1,
                              minWidth: 200,
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
                          <Button
                            onClick={handleAddTargetPage}
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                              backgroundColor: darkTheme.primary,
                              color: 'white',
                              px: 3,
                              py: 1,
                              borderRadius: '8px',
                              '&:hover': {
                                backgroundColor: darkTheme.primaryHover,
                              },
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          {formData.targetPages.map((page) => (
                            <Chip
                              key={page}
                              label={page}
                              onDelete={() => handleRemoveTargetPage(page)}
                              deleteIcon={<CloseIcon />}
                              sx={{
                                backgroundColor: darkTheme.selectedBg,
                                color: darkTheme.primary,
                                fontWeight: 600,
                                '& .MuiChip-deleteIcon': {
                                  color: darkTheme.primary,
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      {/* Target Audience */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.text, fontWeight: 600 }}>
                          Target Audience
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                          <TextField
                            label="Add Target Audience"
                            value={newTargetAudience}
                            onChange={(e) => setNewTargetAudience(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTargetAudience()}
                            sx={{
                              flex: 1,
                              minWidth: 200,
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
                          <Button
                            onClick={handleAddTargetAudience}
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                              backgroundColor: darkTheme.primary,
                              color: 'white',
                              px: 3,
                              py: 1,
                              borderRadius: '8px',
                              '&:hover': {
                                backgroundColor: darkTheme.primaryHover,
                              },
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                          {formData.targetAudience.map((audience) => (
                            <Chip
                              key={audience}
                              label={audience}
                              onDelete={() => handleRemoveTargetAudience(audience)}
                              deleteIcon={<CloseIcon />}
                              sx={{
                                backgroundColor: darkTheme.selectedBg,
                                color: darkTheme.primary,
                                fontWeight: 600,
                                '& .MuiChip-deleteIcon': {
                                  color: darkTheme.primary,
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
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