'use client';

import React, { useState } from 'react';
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
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { deleteGuest, GuestData, toggleGuestVipStatus } from '@/lib/actions/guest-management';
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

interface GuestListPageProps {
  initialGuests: GuestData[];
}

const GuestListPage: React.FC<GuestListPageProps> = ({ initialGuests }) => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [guests, setGuests] = useState<GuestData[]>(initialGuests);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; guest: GuestData | null }>({
    open: false,
    guest: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.guest) return;

    setLoading('delete');
    try {
      const result = await deleteGuest(deleteDialog.guest.id);
      if (result.success) {
        setGuests(prev => prev.filter(g => g.id !== deleteDialog.guest!.id));
        setSnackbar({
          open: true,
          message: 'Guest deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete guest',
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
      setDeleteDialog({ open: false, guest: null });
    }
  };

  const handleToggleVip = async (guestId: string, currentVipStatus: boolean) => {
    setLoading(guestId);
    try {
      const result = await toggleGuestVipStatus(guestId, !currentVipStatus);
      if (result.success) {
        setGuests(prev => prev.map(g =>
          g.id === guestId ? { ...g, vipStatus: !currentVipStatus } : g
        ));
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update VIP status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `'An error occurred while updating VIP status ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  const getGuestInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return 'N/A';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const parsePreferences = (preferences: Record<string, unknown> | string | null): string[] => {
    if (!preferences) return [];
    
    // Check if preferences is already a parsed array or object
    if (Array.isArray(preferences)) {
      return preferences as string[];
    }
    if (typeof preferences === 'string') {
      try {
        const parsed = JSON.parse(preferences);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse guest preferences:", e);
        return [];
      }
    }

    // Default to an empty array if the format is unexpected
    return [];
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
                Operations Management
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
                Guest Management
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
                Manage guest profiles, preferences, and contact information across all properties.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/operations/guests/new`)}
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
              Create New Guest
            </Button>
          </Box>
        </Box>

        {/* Guest Cards */}
        {guests.length === 0 ? (
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
              <PersonIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
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
              No guests found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Guest profiles will appear here when reservations are made
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/operations/guests/new`)}
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
              Create Guest
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {guests.map((guest) => (
              <Card
                key={guest.id}
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
                  {/* Avatar Section */}
                  <Box
                    sx={{
                      width: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 1,
                      mr: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        backgroundColor: guest.vipStatus ? darkTheme.warning : darkTheme.primary,
                        color: 'white'
                      }}
                    >
                      {getGuestInitials(guest.firstName, guest.lastName)}
                    </Avatar>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: darkTheme.text,
                          fontSize: '1rem',
                        }}
                      >
                        {guest.firstName} {guest.lastName}
                      </Typography>
                      {guest.vipStatus && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: 12 }} />}
                          label="VIP"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '11px',
                            backgroundColor: darkTheme.warningBg,
                            color: darkTheme.warning,
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: darkTheme.warning, fontSize: 12 },
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                        <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                          {guest.email}
                        </Typography>
                      </Box>
                      {guest.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {guest.phone}
                          </Typography>
                        </Box>
                      )}
                      {guest.country && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 14, color: darkTheme.textSecondary }} />
                          <Typography variant="caption" sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {guest.city && `${guest.city}, `}{guest.country}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    {parsePreferences(guest.preferences).length > 0 && (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography
                          sx={{
                            fontSize: '11px',
                            color: darkTheme.textSecondary,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            alignSelf: 'center',
                            mr: 1,
                          }}
                        >
                          Preferences:
                        </Typography>
                        {parsePreferences(guest.preferences).map((pref: string, index: number) => (
                          <Chip
                            key={index}
                            label={pref}
                            size="small"
                            sx={{
                              fontSize: '10px',
                              height: 20,
                              backgroundColor: darkTheme.selectedBg,
                              color: darkTheme.primary,
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {/* Actions - Streamlined */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2, flexShrink: 0 }}>
                    {/* View/Edit Profile - Primary action */}
                    <Tooltip title="View & Edit Guest Profile">
                      <IconButton
                        onClick={() => router.push(`/${businessUnitId}/admin/operations/guests/${guest.id}`)}
                        sx={{
                          color: darkTheme.primary,
                          backgroundColor: darkTheme.selectedBg,
                          '&:hover': {
                            backgroundColor: darkTheme.primary,
                            color: 'white',
                          },
                          width: 40,
                          height: 40,
                        }}
                      >
                        <EditIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>

                    {/* VIP Toggle - Status action */}
                    <Tooltip title={guest.vipStatus ? 'Remove VIP Status' : 'Add VIP Status'}>
                      <IconButton
                        onClick={() => handleToggleVip(guest.id, guest.vipStatus)}
                        disabled={loading === guest.id}
                        sx={{
                          color: guest.vipStatus ? darkTheme.warning : darkTheme.textSecondary,
                          backgroundColor: guest.vipStatus ? darkTheme.warningBg : 'transparent',
                          '&:hover': {
                            backgroundColor: guest.vipStatus ? darkTheme.warning : darkTheme.warningBg,
                            color: guest.vipStatus ? 'white' : darkTheme.warning,
                          },
                          width: 38,
                          height: 38,
                        }}
                      >
                        {guest.vipStatus ? <StarIcon sx={{ fontSize: 19 }} /> : <StarBorderIcon sx={{ fontSize: 19 }} />}
                      </IconButton>
                    </Tooltip>

                    {/* Delete - Destructive action, placed last */}
                    <Tooltip title="Delete guest profile">
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, guest })}
                        sx={{
                          color: darkTheme.textSecondary,
                          '&:hover': {
                            backgroundColor: darkTheme.errorBg,
                            color: darkTheme.error,
                          },
                          width: 38,
                          height: 38,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 19 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, guest: null })}
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
            Delete Guest
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete this guest profile? This action cannot be undone.
            </Typography>
            {deleteDialog.guest && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {deleteDialog.guest.firstName} {deleteDialog.guest.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {deleteDialog.guest.email}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, guest: null })}
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
                  backgroundColor: '#dc2626',
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

export default GuestListPage;