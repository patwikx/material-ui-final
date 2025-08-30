'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Image as ImageIcon,
  PlayArrow as PlayIcon,
  Visibility,
  VisibilityOff,
  TrendingUp,
  Schedule,
  ChevronRightTwoTone,
  Mouse as ClickIcon,
} from '@mui/icons-material';
import { HeroData } from '@/lib/actions/heroes';
import { deleteHeroSlide, toggleHeroFeatured, toggleHeroStatus } from '@/lib/cms-actions/hero-management';
import { useBusinessUnit } from '@/context/business-unit-context';

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
  // FIX: Added the missing property
  errorHover: '#b91c1c',
};

interface HeroListPageProps {
  initialHeroes: HeroData[];
}

const HeroListPage: React.FC<HeroListPageProps> = ({ initialHeroes }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [heroes, setHeroes] = useState<HeroData[]>(initialHeroes);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; hero: HeroData | null }>({
    open: false,
    hero: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.hero) return;

    setLoading('delete');
    try {
      const result = await deleteHeroSlide(deleteDialog.hero.id);
      if (result.success) {
        setHeroes(prev => prev.filter(h => h.id !== deleteDialog.hero!.id));
        setSnackbar({
          open: true,
          message: 'Hero slide deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete hero slide',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while deleting ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
      setDeleteDialog({ open: false, hero: null });
    }
  };

  const handleToggleStatus = async (heroId: string, currentStatus: boolean) => {
    setLoading(heroId);
    try {
      const result = await toggleHeroStatus(heroId, !currentStatus);
      if (result.success) {
        setHeroes(prev => prev.map(h => 
          h.id === heroId ? { ...h, isActive: !currentStatus } : h
        ));
        setSnackbar({
          open: true,
          message: `Hero slide ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating status ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleToggleFeatured = async (heroId: string, currentFeatured: boolean) => {
    setLoading(heroId);
    try {
      const result = await toggleHeroFeatured(heroId, !currentFeatured);
      if (result.success) {
        setHeroes(prev => prev.map(h => 
          h.id === heroId ? { ...h, isFeatured: !currentFeatured } : h
        ));
        setSnackbar({
          open: true,
          message: `Hero slide ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update featured status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating featured status ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getMediaIcon = (hero: HeroData) => {
    if (hero.backgroundVideo) return PlayIcon;
    if (hero.backgroundImage) return ImageIcon;
    return ImageIcon;
  };

  const getMediaLabel = (hero: HeroData) => {
    if (hero.backgroundVideo) return 'Video Background';
    if (hero.backgroundImage) return 'Image Background';
    return 'No Background';
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
        {/* Enhanced Header with BusinessUnit-style typography */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ flex: 1 }}>
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
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                  color: darkTheme.text,
                  lineHeight: 1.2,
                  mb: 2,
                }}
              >
                Hero Slides
              </Typography>
              <Typography
                sx={{
                  color: darkTheme.textSecondary,
                  fontSize: '1rem',
                  maxWidth: '600px',
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Manage hero slides that appear on your website. Create engaging visuals to capture visitor attention and drive conversions.
              </Typography>
            </Box>
            
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/admin/cms/hero/new`)}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: darkTheme.primaryHover,
                },
              }}
            >
              Create Hero
            </Button>
          </Box>

          {/* Enhanced Stats with BusinessUnit-style layout */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
            {[
              { 
                label: 'Total Slides', 
                value: heroes.length, 
                icon: ImageIcon, 
                color: darkTheme.primary,
                sublabel: 'Hero Slides' 
              },
              { 
                label: 'Active', 
                value: heroes.filter(h => h.isActive).length, 
                icon: Visibility, 
                color: darkTheme.success,
                sublabel: 'Published' 
              },
              { 
                label: 'Featured', 
                value: heroes.filter(h => h.isFeatured).length, 
                icon: StarIcon, 
                color: darkTheme.warning,
                sublabel: 'Highlighted' 
              },
              { 
                label: 'Total Views', 
                value: heroes.reduce((sum, h) => sum + h.viewCount, 0).toLocaleString(), 
                icon: TrendingUp, 
                color: darkTheme.primary,
                sublabel: 'Impressions' 
              },
            ].map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  backgroundColor: darkTheme.surface,
                  borderRadius: '8px',
                  p: 2,
                  border: `1px solid ${darkTheme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <stat.icon sx={{ 
                  mr: 1.5, 
                  fontSize: '18px', 
                  color: darkTheme.textSecondary 
                }} />
                <Box>
                  <Typography 
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 600,
                      color: darkTheme.text,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: '12px',
                      color: darkTheme.textSecondary,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.sublabel}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Hero Cards with BusinessUnit-inspired styling */}
        {heroes.length === 0 ? (
          <Box
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              p: 6,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                backgroundColor: darkTheme.selectedBg,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ImageIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
            </Box>
            <Typography 
              sx={{ 
                fontSize: '14px',
                fontWeight: 600,
                color: darkTheme.text,
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              No hero slides found
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Create your first hero slide to get started
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/admin/cms/hero/new`)}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { backgroundColor: darkTheme.primaryHover },
              }}
            >
              Create Hero Slide
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {heroes.map((hero) => {
              const MediaIcon = getMediaIcon(hero);
              
              return (
                <Card
                  key={hero.id}
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: '8px',
                    border: `1px solid ${darkTheme.border}`,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: darkTheme.surfaceHover,
                      borderColor: darkTheme.primary,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    {/* Media Preview - BusinessUnit style icon */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '8px',
                        backgroundColor: hero.backgroundImage || hero.backgroundVideo ? 'transparent' : darkTheme.background,
                        border: `1px solid ${darkTheme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        mr: 2,
                      }}
                    >
                      {hero.backgroundImage ? (
  <Box
    component="img"
    src={hero.backgroundImage}
    alt={hero.altText || hero.title || ''} // FIX: Added a final fallback of an empty string
    sx={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  />
) : hero.backgroundVideo ? (
  <Box // FIX: Conditionally render the video preview as an img
    component="img"
    src={hero.backgroundVideo} // This will be the video thumbnail URL if available
    alt={hero.altText || hero.title || ''} // FIX: Added a final fallback
    sx={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  />
) : (
  <MediaIcon sx={{
    fontSize: '24px',
    color: darkTheme.textSecondary
  }} />
)}
                    </Box>

                    {/* Content - BusinessUnit style layout */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            sx={{ 
                              fontSize: '14px',
                              fontWeight: 600,
                              color: darkTheme.text,
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {hero.title}
                          </Typography>
                          <Typography 
                            sx={{ 
                              fontSize: '12px',
                              color: darkTheme.textSecondary,
                              lineHeight: 1.2,
                            }}
                          >
                            {getMediaLabel(hero)}
                          </Typography>
                        </Box>

                        {/* Status badges */}
                        <Box sx={{ display: 'flex', gap: 1, ml: 2, flexShrink: 0 }}>
                          {hero.isFeatured && (
                            <Chip
                              icon={<StarIcon sx={{ fontSize: 12 }} />}
                              label="Featured"
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '11px',
                                backgroundColor: darkTheme.warningBg,
                                color: darkTheme.warning,
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: darkTheme.warning },
                              }}
                            />
                          )}
                          <Chip
                            icon={hero.isActive ? <Visibility sx={{ fontSize: 12 }} /> : <VisibilityOff sx={{ fontSize: 12 }} />}
                            label={hero.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '11px',
                              backgroundColor: hero.isActive ? darkTheme.successBg : darkTheme.errorBg,
                              color: hero.isActive ? darkTheme.success : darkTheme.error,
                              fontWeight: 600,
                              '& .MuiChip-icon': { 
                                color: hero.isActive ? darkTheme.success : darkTheme.error 
                              },
                            }}
                          />
                        </Box>
                      </Box>

                      {hero.subtitle && (
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: darkTheme.textSecondary,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                            mb: 2,
                          }}
                        >
                          {hero.subtitle}
                        </Typography>
                      )}

                      {/* Analytics in BusinessUnit style */}
                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        {[
                          { icon: TrendingUp, value: hero.viewCount, label: 'Views' },
                          { icon: ClickIcon, value: hero.clickCount, label: 'Clicks' },
                          { icon: Schedule, value: `Order ${hero.sortOrder}`, label: 'Priority' },
                        ].map((metric, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <metric.icon sx={{ 
                              fontSize: 14, 
                              color: darkTheme.textSecondary 
                            }} />
                            <Typography 
                              sx={{ 
                                fontSize: '12px',
                                color: darkTheme.textSecondary,
                                fontWeight: 500,
                              }}
                            >
                              {metric.value} {metric.label.toLowerCase()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    {/* Actions - BusinessUnit style button group */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={hero.isActive}
                            onChange={() => handleToggleStatus(hero.id, hero.isActive)}
                            disabled={loading === hero.id}
                            size="small"
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
                        label=""
                        sx={{ mr: 0 }}
                      />
                      
                      <Tooltip title={hero.isFeatured ? 'Remove from featured' : 'Add to featured'}>
                        <IconButton
                          onClick={() => handleToggleFeatured(hero.id, hero.isFeatured)}
                          disabled={loading === hero.id}
                          sx={{
                            color: hero.isFeatured ? darkTheme.warning : darkTheme.textSecondary,
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: hero.isFeatured ? darkTheme.warningBg : darkTheme.surfaceHover,
                            },
                            width: 32,
                            height: 32,
                          }}
                        >
                          {hero.isFeatured ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit hero slide">
                        <IconButton
                          onClick={() => router.push(`/admin/cms/hero/${hero.id}`)}
                          sx={{ 
                            color: darkTheme.textSecondary,
                            '&:hover': {
                              backgroundColor: darkTheme.selectedBg,
                              color: darkTheme.primary,
                            },
                            width: 32,
                            height: 32,
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete hero slide">
                        <IconButton
                          onClick={() => setDeleteDialog({ open: true, hero })}
                          disabled={loading === 'delete'}
                          sx={{ 
                            color: darkTheme.textSecondary,
                            '&:hover': {
                              backgroundColor: darkTheme.errorBg,
                              color: darkTheme.error,
                            },
                            width: 32,
                            height: 32,
                          }}
                        >
                          {loading === 'delete' ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Enhanced Delete Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, hero: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
            },
          }}
        >
          <DialogTitle 
            sx={{ 
              fontWeight: 600, 
              color: darkTheme.text,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Delete Hero Slide
          </DialogTitle>
          <DialogContent>
            <Typography 
              sx={{ 
                fontSize: '12px',
                color: darkTheme.textSecondary, 
                lineHeight: 1.6 
              }}
            >
              Are you sure you want to delete &quot;{deleteDialog.hero?.title}&quot;? This action cannot be undone and will permanently remove all associated data.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, hero: null })}
              sx={{ 
                color: darkTheme.textSecondary,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading === 'delete'}
              sx={{
                backgroundColor: darkTheme.error,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { 
                  backgroundColor: darkTheme.errorHover,
                },
                '&:disabled': {
                  backgroundColor: darkTheme.textSecondary,
                },
              }}
            >
              {loading === 'delete' ? <CircularProgress size={16} color="inherit" /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar !== null}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar?.severity}
            sx={{ 
              width: '100%',
              backgroundColor: snackbar?.severity === 'success' ? darkTheme.successBg : darkTheme.errorBg,
              borderColor: snackbar?.severity === 'success' ? darkTheme.success : darkTheme.error,
              border: `1px solid`,
              borderRadius: '8px',
              color: snackbar?.severity === 'success' ? darkTheme.success : darkTheme.error,
              fontSize: '12px',
              fontWeight: 600,
              '& .MuiAlert-icon': { 
                color: snackbar?.severity === 'success' ? darkTheme.success : darkTheme.error 
              },
            }}
          >
            {snackbar?.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default HeroListPage;