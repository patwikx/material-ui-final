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
  Photo as PhotoIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { EventType, EventStatus } from '@prisma/client';
import { EventData } from '@/lib/actions/events';
import { BusinessUnitData, getBusinessUnits } from '@/lib/actions/business-units';
import { getEventById, updateEvent, UpdateEventData } from '@/lib/cms-actions/events-management';

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

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueDetails: string;
  venueCapacity: number | null;
  isFree: boolean;
  ticketPrice: number | null;
  currency: string;
  requiresBooking: boolean;
  maxAttendees: number | null;
  businessUnitId: string;
  isPublished: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  sortOrder: number;
}

interface EventImages {
  images: Array<{ 
    fileName: string; 
    name: string; 
    fileUrl: string;
    imageId?: string;
  }>;
  removeImageIds: string[];
}

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'CELEBRATION', label: 'Celebration' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'PRIVATE', label: 'Private' },
];

const eventStatuses: { value: EventStatus; label: string }[] = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'POSTPONED', label: 'Postponed' },
];

const EditEventPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    description: '',
    shortDesc: '',
    type: 'CONFERENCE',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    venueDetails: '',
    venueCapacity: null,
    isFree: false,
    ticketPrice: null,
    currency: 'PHP',
    requiresBooking: true,
    maxAttendees: null,
    businessUnitId: '',
    isPublished: false,
    isFeatured: false,
    isPinned: false,
    sortOrder: 0,
  });
  const [images, setImages] = useState<EventImages>({
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
        const [eventData, units] = await Promise.all([
          getEventById(eventId),
          getBusinessUnits()
        ]);

        setBusinessUnits(units);

        if (eventData) {
          setEvent(eventData);
          setFormData({
            title: eventData.title,
            slug: eventData.slug,
            description: eventData.description,
            shortDesc: eventData.shortDesc || '',
            type: eventData.type as EventType,
            status: eventData.status as EventStatus,
            startDate: new Date(eventData.startDate).toISOString().slice(0, 10),
            endDate: new Date(eventData.endDate).toISOString().slice(0, 10),
            startTime: eventData.startTime || '',
            endTime: eventData.endTime || '',
            venue: eventData.venue,
            venueDetails: eventData.venueDetails || '',
            venueCapacity: eventData.venueCapacity,
            isFree: eventData.isFree,
            ticketPrice: eventData.ticketPrice,
            currency: eventData.currency,
            requiresBooking: eventData.requiresBooking,
            maxAttendees: eventData.maxAttendees,
            businessUnitId: eventData.businessUnit?.id || '',
            isPublished: true, // Assuming published if we can fetch it
            isFeatured: false, // You might want to add this to EventData
            isPinned: false, // You might want to add this to EventData
            sortOrder: 0, // You might want to add this to EventData
          });

          // Initialize existing event images with proper ID tracking
          if (eventData.images && eventData.images.length > 0) {
            const existingImages = eventData.images.map(img => ({
              fileName: img.image.originalUrl.split('/').pop() || 'image',
              name: img.image.title || img.image.altText || 'Event Image',
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
            message: 'Event not found',
            severity: 'error',
          });
          router.push('/admin/cms/events');
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to load event: ${error}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadData();
    }
  }, [eventId, router]);

  const handleInputChange = (field: keyof EventFormData, value: string | number | boolean) => {
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
      // Filter out new images (ones that weren't in the original event)
      const newImages = images.images
        .filter(img => {
          if (!event?.images) return true;
          return !event.images.some(existingImg => 
            existingImg.image.originalUrl === img.fileUrl
          );
        })
        .filter(img => img.fileUrl !== null)
        .map(img => ({
          ...img,
          fileUrl: img.fileUrl as string
        }));

      const eventData: UpdateEventData = {
        id: eventId,
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        eventImages: newImages.length > 0 ? newImages : undefined,
        removeImageIds: images.removeImageIds.length > 0 ? images.removeImageIds : undefined,
      };

      const result = await updateEvent(eventData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Event updated successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update event',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating event: ${error}`,
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
          <Typography sx={{ color: darkTheme.text }}>Loading event...</Typography>
        </Box>
      </Container>
    );
  }

  if (!event) {
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
          Event not found
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
              onClick={() => router.push('/admin/cms/events')}
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
            Edit Event
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
            Update event information and settings.
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
                    label="Event Title"
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
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Event Type</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value as EventType)}
                        label="Event Type"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                        }}
                      >
                        {eventTypes.map((type) => (
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
                        onChange={(e) => handleInputChange('status', e.target.value as EventStatus)}
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
                        {eventStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
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

            {/* Date & Time */}
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
                  Date & Time
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
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
                      label="End Date"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
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

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
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
                      label="End Time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
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
                </Box>
              </CardContent>
            </Card>

            {/* Venue Information */}
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
                  Venue Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
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
                    label="Venue Details"
                    value={formData.venueDetails}
                    onChange={(e) => handleInputChange('venueDetails', e.target.value)}
                    multiline
                    rows={3}
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
                      label="Venue Capacity"
                      type="number"
                      value={formData.venueCapacity || ''}
                      onChange={(e) => handleInputChange('venueCapacity', e.target.value ? parseInt(e.target.value) : "")}
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
                      label="Max Attendees"
                      type="number"
                      value={formData.maxAttendees || ''}
                      onChange={(e) => handleInputChange('maxAttendees', e.target.value ? parseInt(e.target.value) : "")}
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

            {/* Pricing & Booking */}
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
                  Pricing & Booking
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isFree}
                        onChange={(e) => handleInputChange('isFree', e.target.checked)}
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
                    label={<Typography sx={{ color: darkTheme.textSecondary }}>Free Event</Typography>}
                  />

                  {!formData.isFree && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        label="Ticket Price"
                        type="number"
                        value={formData.ticketPrice || ''}
                        onChange={(e) => handleInputChange('ticketPrice', e.target.value ? parseFloat(e.target.value) : "")}
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
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.requiresBooking}
                        onChange={(e) => handleInputChange('requiresBooking', e.target.checked)}
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
                    label={<Typography sx={{ color: darkTheme.textSecondary }}>Requires Booking</Typography>}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Event Images */}
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
                    Event Images
                  </Typography>
                </Box>

                {/* Existing Images */}
                {images.images.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontSize: '12px', color: darkTheme.textSecondary, mb: 2 }}>
                      Event Images ({images.images.length})
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
                  Upload up to 5 images showcasing your event. Recommended size: 1200x800px or larger. Supports JPG, PNG, WEBP and GIF formats.
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
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Published</Typography>}
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
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Featured</Typography>}
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
                      label={<Typography sx={{ color: darkTheme.textSecondary }}>Pinned</Typography>}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                type="button"
                onClick={() => router.push('/admin/cms/events')}
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

export default EditEventPage;