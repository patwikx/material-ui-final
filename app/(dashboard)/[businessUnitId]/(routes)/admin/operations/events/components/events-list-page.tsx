'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { EventData } from '@/lib/actions/events';
import { deleteEvent } from '@/lib/cms-actions/events-management';
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
};

interface EventListPageProps {
  initialEvents: EventData[];
}

const EventListPage: React.FC<EventListPageProps> = ({ initialEvents }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; event: EventData | null }>({
    open: false,
    event: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.event) return;

    setLoading('delete');
    try {
      const result = await deleteEvent(deleteDialog.event.id);
      if (result.success) {
        setEvents(prev => prev.filter(e => e.id !== deleteDialog.event!.id));
        setSnackbar({
          open: true,
          message: 'Event deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete event',
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
      setDeleteDialog({ open: false, event: null });
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

  const getEventTypeColor = (type: string) => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'WEDDING': 'primary',
      'CONFERENCE': 'primary',
      'MEETING': 'primary',
      'WORKSHOP': 'success',
      'CELEBRATION': 'warning',
      'CULTURAL': 'primary',
      'SEASONAL': 'warning',
      'ENTERTAINMENT': 'primary',
      'CORPORATE': 'primary',
      'PRIVATE': 'primary',
    };
    return colorMap[type] || 'textSecondary';
  };

  const getEventTypeBackground = (type: string) => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'WEDDING': 'selectedBg',
      'CONFERENCE': 'selectedBg',
      'MEETING': 'selectedBg',
      'WORKSHOP': 'successBg',
      'CELEBRATION': 'warningBg',
      'CULTURAL': 'selectedBg',
      'SEASONAL': 'warningBg',
      'ENTERTAINMENT': 'selectedBg',
      'CORPORATE': 'selectedBg',
      'PRIVATE': 'selectedBg',
    };
    return colorMap[type] || 'surfaceHover';
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'PLANNING': 'textSecondary',
      'CONFIRMED': 'success',
      'IN_PROGRESS': 'warning',
      'COMPLETED': 'primary',
      'CANCELLED': 'error',
      'POSTPONED': 'warning',
    };
    return colorMap[status] || 'textSecondary';
  };

  const getStatusBackground = (status: string) => {
    const colorMap: Record<string, keyof typeof darkTheme> = {
      'PLANNING': 'surfaceHover',
      'CONFIRMED': 'successBg',
      'IN_PROGRESS': 'warningBg',
      'COMPLETED': 'selectedBg',
      'CANCELLED': 'errorBg',
      'POSTPONED': 'warningBg',
    };
    return colorMap[status] || 'surfaceHover';
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
                Events
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
                Manage events across all properties. Create, edit, and organize events to engage your guests.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/cms/events/new`)}
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
              Create Event
            </Button>
          </Box>
        </Box>

        {/* Event Cards */}
        {events.length === 0 ? (
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
              <EventIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No events found
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Create your first event to get started
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/cms/events/new`)}
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
              Create Event
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.map((event) => (
              <Card
                key={event.id}
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Image Preview */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: '300px' },
                      height: '200px',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: darkTheme.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {event.images.length > 0 ? (
                      <Box
                        component="img"
                        src={event.images[0].image.originalUrl}
                        alt={event.images[0].image.altText || event.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: darkTheme.textSecondary }}>
                        <EventIcon sx={{ fontSize: 32 }} />
                        <Typography variant="body2">No Image</Typography>
                      </Box>
                    )}
                    {/* Status & Type Chips */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        gap: 1,
                        flexDirection: 'column',
                      }}
                    >
                      <Chip
                        label={event.status.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getStatusBackground(event.status)],
                          color: darkTheme[getStatusColor(event.status)],
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={event.type.replace('_', ' ')}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          textTransform: 'capitalize',
                          backgroundColor: darkTheme[getEventTypeBackground(event.type)],
                          color: darkTheme[getEventTypeColor(event.type)],
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    {/* Date Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        backgroundColor: darkTheme.surface,
                        px: 2,
                        py: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        minWidth: '60px',
                        borderRadius: '4px',
                        border: `1px solid ${darkTheme.border}`
                      }}
                    >
                      <Typography 
                        sx={{ 
                          fontWeight: 900,
                          color: darkTheme.text,
                          fontSize: '1.25rem',
                          lineHeight: 1,
                        }}
                      >
                        {event.startDate.getDate()}
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontWeight: 700,
                          color: darkTheme.textSecondary,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          lineHeight: 1,
                        }}
                      >
                        {event.startDate.toLocaleDateString('en-US', { month: 'short' })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, p: 3 }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: darkTheme.text,
                              mb: 1,
                              fontSize: '1.25rem',
                            }}
                          >
                            {event.title}
                          </Typography>
                          {event.shortDesc && (
                            <Typography
                              sx={{
                                color: darkTheme.textSecondary,
                                mb: 1,
                                fontWeight: 500,
                                fontSize: '0.875rem'
                              }}
                            >
                              {event.shortDesc}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          color: darkTheme.textSecondary,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem'
                        }}
                      >
                        {event.description}
                      </Typography>

                      {/* Event Details */}
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {formatDate(event.startDate)} - {formatDate(event.endDate)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {event.venue}
                            {event.businessUnit && ` • ${event.businessUnit.displayName}`}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Metadata */}
                      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                          Capacity: {event.venueCapacity || 'Unlimited'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                          Attendees: {event.currentAttendees}/{event.maxAttendees || '∞'}
                        </Typography>
                        {event.isFree ? (
                          <Typography variant="caption" sx={{ color: darkTheme.success, fontWeight: 600 }}>
                            Free Event
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary }}>
                            {event.currency} {event.ticketPrice?.toLocaleString()}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ p: 0, pt: 2, justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton
                        onClick={() => router.push(`/${businessUnitId}/admin/cms/events/${event.id}`)}
                        sx={{ 
                          color: darkTheme.textSecondary,
                          backgroundColor: 'transparent',
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
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, event })}
                        sx={{ 
                          color: darkTheme.textSecondary,
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: darkTheme.errorBg,
                            color: darkTheme.error,
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </CardActions>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, event: null })}
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
            Delete Event
          </DialogTitle>
          <DialogContent>
            <Typography 
              sx={{ 
                fontSize: '12px',
                color: darkTheme.textSecondary, 
                lineHeight: 1.6 
              }}
            >
              Are you sure you want to delete &quot;{deleteDialog.event?.title}&quot;? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, event: null })}
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
              variant="contained"
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
                  backgroundColor: darkTheme.error,
                },
                '&:disabled': {
                  backgroundColor: darkTheme.textSecondary,
                },
              }}
            >
              {loading === 'delete' ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

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

export default EventListPage;