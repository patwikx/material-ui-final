'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import {
  RoomRateData,
  deleteRoomRate,
  toggleRoomRateStatus,
  setDefaultRoomRate,
} from '@/lib/actions/room-rates-management';
import { useBusinessUnit } from '@/context/business-unit-context';

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

interface RoomRateListPageProps {
  initialRoomRates: RoomRateData[];
}

const RoomRateListPage: React.FC<RoomRateListPageProps> = ({ initialRoomRates }) => {
  const { businessUnitId } = useBusinessUnit();

  const [roomRates, setRoomRates] = useState<RoomRateData[]>(initialRoomRates);
  const [filteredRates, setFilteredRates] = useState<RoomRateData[]>(initialRoomRates);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [defaultFilter, setDefaultFilter] = useState<'all' | 'default' | 'non-default'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roomRate: RoomRateData | null }>({
    open: false,
    roomRate: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter and search logic
  useEffect(() => {
    let filtered = roomRates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rate =>
        rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.roomType.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.roomType.businessUnit.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(rate => rate.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(rate => !rate.isActive);
    }

    // Default filter
    if (defaultFilter === 'default') {
      filtered = filtered.filter(rate => rate.isDefault);
    } else if (defaultFilter === 'non-default') {
      filtered = filtered.filter(rate => !rate.isDefault);
    }

    setFilteredRates(filtered);
  }, [roomRates, searchTerm, statusFilter, defaultFilter]);

  const handleDeleteClick = (roomRate: RoomRateData) => {
    setDeleteDialog({ open: true, roomRate });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.roomRate) return;

    setLoading(true);
    try {
      const result = await deleteRoomRate(deleteDialog.roomRate.id);
      if (result.success) {
        setRoomRates(prev => prev.filter(rate => rate.id !== deleteDialog.roomRate?.id));
        setSnackbar({
          open: true,
          message: 'Room rate deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete room rate',
          severity: 'error',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting room rate',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, roomRate: null });
    }
  };

  const handleToggleStatus = async (roomRate: RoomRateData) => {
    setLoading(true);
    try {
      const result = await toggleRoomRateStatus(roomRate.id, !roomRate.isActive);
      if (result.success) {
        setRoomRates(prev =>
          prev.map(rate =>
            rate.id === roomRate.id ? { ...rate, isActive: !rate.isActive } : rate
          )
        );
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update room rate status',
          severity: 'error',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating room rate status',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (roomRate: RoomRateData) => {
    if (roomRate.isDefault) return; // Already default

    setLoading(true);
    try {
      const result = await setDefaultRoomRate(roomRate.id);
      if (result.success) {
        setRoomRates(prev =>
          prev.map(rate => {
            if (rate.roomTypeId === roomRate.roomTypeId) {
              return { ...rate, isDefault: rate.id === roomRate.id };
            }
            return rate;
          })
        );
        setSnackbar({
          open: true,
          message: result.message,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to set default room rate',
          severity: 'error',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while setting default room rate',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(parseFloat(amount));
  };

  const getWeekDaysText = (roomRate: RoomRateData) => {
    const days = [];
    if (roomRate.monday) days.push('Mon');
    if (roomRate.tuesday) days.push('Tue');
    if (roomRate.wednesday) days.push('Wed');
    if (roomRate.thursday) days.push('Thu');
    if (roomRate.friday) days.push('Fri');
    if (roomRate.saturday) days.push('Sat');
    if (roomRate.sunday) days.push('Sun');
    
    if (days.length === 7) return 'All days';
    if (days.length === 0) return 'No days';
    return days.join(', ');
  };

  const RoomRateCard = ({ roomRate }: { roomRate: RoomRateData }) => (
    <Card 
      sx={{ 
        backgroundColor: darkTheme.surface,
        borderRadius: '12px',
        border: `1px solid ${darkTheme.border}`,
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          backgroundColor: darkTheme.surfaceHover,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        },
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" sx={{ 
                color: darkTheme.text, 
                fontWeight: 700,
                fontSize: '1.1rem',
              }}>
                {roomRate.name}
              </Typography>
              {roomRate.isDefault && (
                <StarIcon sx={{ fontSize: 18, color: darkTheme.warning }} />
              )}
            </Box>
            {roomRate.description && (
              <Typography sx={{ 
                color: darkTheme.textSecondary, 
                fontSize: '0.9rem',
                mb: 1,
              }}>
                {roomRate.description}
              </Typography>
            )}
          </Box>
          
          {/* Status Badges */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
            <Chip
              label={roomRate.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                backgroundColor: roomRate.isActive ? darkTheme.successBg : darkTheme.errorBg,
                color: roomRate.isActive ? darkTheme.success : darkTheme.error,
                border: `1px solid ${roomRate.isActive ? darkTheme.success : darkTheme.error}`,
                fontSize: '11px',
                fontWeight: 600,
                height: '24px',
              }}
            />
            {roomRate.isDefault && (
              <Chip
                label="Default"
                size="small"
                sx={{
                  backgroundColor: darkTheme.warningBg,
                  color: darkTheme.warning,
                  border: `1px solid ${darkTheme.warning}`,
                  fontSize: '11px',
                  fontWeight: 600,
                  height: '24px',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <MoneyIcon sx={{ color: darkTheme.success, fontSize: 20 }} />
          <Typography variant="h4" sx={{ 
            color: darkTheme.success, 
            fontWeight: 800,
            fontSize: '1.8rem',
          }}>
            {formatCurrency(roomRate.baseRate, roomRate.currency)}
          </Typography>
          <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.9rem' }}>
            per night
          </Typography>
        </Box>

        {/* Room Type & Business Unit */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HomeIcon sx={{ color: darkTheme.primary, fontSize: 18 }} />
          <Box>
            <Typography sx={{ 
              color: darkTheme.text, 
              fontWeight: 600,
              fontSize: '0.95rem',
            }}>
              {roomRate.roomType.displayName}
            </Typography>
            <Typography sx={{ 
              color: darkTheme.textSecondary, 
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}>
              <BusinessIcon sx={{ fontSize: 12 }} />
              {roomRate.roomType.businessUnit.displayName}
            </Typography>
          </Box>
        </Box>

        {/* Validity Dates */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarIcon sx={{ color: darkTheme.primary, fontSize: 18 }} />
          <Box>
            <Typography sx={{ 
              color: darkTheme.textSecondary, 
              fontSize: '0.85rem',
            }}>
              Valid: {formatDate(roomRate.validFrom)} - {formatDate(roomRate.validTo)}
            </Typography>
          </Box>
        </Box>

        {/* Available Days */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ScheduleIcon sx={{ color: darkTheme.primary, fontSize: 18 }} />
          <Typography sx={{ 
            color: darkTheme.textSecondary, 
            fontSize: '0.85rem',
          }}>
            {getWeekDaysText(roomRate)}
          </Typography>
        </Box>

        {/* Restrictions */}
        {(roomRate.minStay > 1 || roomRate.maxStay || roomRate.minAdvance || roomRate.maxAdvance) && (
          <>
            <Divider sx={{ backgroundColor: darkTheme.border, mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ 
                color: darkTheme.textSecondary, 
                fontSize: '0.8rem',
                fontWeight: 600,
                mb: 1,
              }}>
                RESTRICTIONS
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {roomRate.minStay > 1 && (
                  <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.75rem' }}>
                    Min stay: {roomRate.minStay} nights
                  </Typography>
                )}
                {roomRate.maxStay && (
                  <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.75rem' }}>
                    Max stay: {roomRate.maxStay} nights
                  </Typography>
                )}
                {roomRate.minAdvance && (
                  <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.75rem' }}>
                    Min advance: {roomRate.minAdvance} days
                  </Typography>
                )}
                {roomRate.maxAdvance && (
                  <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.75rem' }}>
                    Max advance: {roomRate.maxAdvance} days
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 'auto',
          pt: 2,
        }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View Details">
              <IconButton
                component={Link}
                href={`/${businessUnitId}/admin/operations/room-rates/${roomRate.id}`}
                size="small"
                sx={{
                  color: darkTheme.primary,
                  backgroundColor: darkTheme.selectedBg,
                  '&:hover': { backgroundColor: darkTheme.primary, color: 'white' },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={roomRate.isActive ? "Deactivate" : "Activate"}>
              <IconButton
                onClick={() => handleToggleStatus(roomRate)}
                size="small"
                sx={{
                  color: roomRate.isActive ? darkTheme.warning : darkTheme.success,
                  backgroundColor: roomRate.isActive ? darkTheme.warningBg : darkTheme.successBg,
                  '&:hover': { 
                    backgroundColor: roomRate.isActive ? darkTheme.warning : darkTheme.success,
                    color: 'white',
                  },
                }}
              >
                {roomRate.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!roomRate.isDefault && (
              <Tooltip title="Set as Default">
                <IconButton
                  onClick={() => handleSetDefault(roomRate)}
                  size="small"
                  sx={{
                    color: darkTheme.warning,
                    backgroundColor: darkTheme.warningBg,
                    '&:hover': { backgroundColor: darkTheme.warning, color: 'white' },
                  }}
                >
                  <StarBorderIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Delete">
              <IconButton
                onClick={() => handleDeleteClick(roomRate)}
                size="small"
                sx={{
                  color: darkTheme.error,
                  backgroundColor: darkTheme.errorBg,
                  '&:hover': { backgroundColor: darkTheme.error, color: 'white' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                  color: darkTheme.text,
                  lineHeight: 1.2,
                }}
              >
                Room Rates
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
                Manage room pricing and rate configurations
              </Typography>
            </Box>
            <Button
              component={Link}
              href={`/${businessUnitId}/admin/operations/room-rates/create`}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: darkTheme.primaryHover,
                },
              }}
            >
              Add Room Rate
            </Button>
          </Box>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ backgroundColor: darkTheme.surface, borderRadius: '8px', border: `1px solid ${darkTheme.border}`, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search room rates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: darkTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& fieldset': { borderColor: darkTheme.border },
                    '&:hover fieldset': { borderColor: darkTheme.primary },
                    '&.Mui-focused fieldset': { borderColor: darkTheme.primary },
                  },
                }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  label="Status"
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  }}
                  MenuProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: darkTheme.surface,
                        border: `1px solid ${darkTheme.border}`,
                      },
                      '& .MuiMenuItem-root': {
                        color: darkTheme.text,
                        '&:hover': { backgroundColor: darkTheme.surfaceHover },
                        '&.Mui-selected': { backgroundColor: darkTheme.selected },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: darkTheme.textSecondary }}>Default</InputLabel>
                <Select
                  value={defaultFilter}
                  onChange={(e) => setDefaultFilter(e.target.value as typeof defaultFilter)}
                  label="Default"
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: darkTheme.background,
                    color: darkTheme.text,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                  }}
                  MenuProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: darkTheme.surface,
                        border: `1px solid ${darkTheme.border}`,
                      },
                      '& .MuiMenuItem-root': {
                        color: darkTheme.text,
                        '&:hover': { backgroundColor: darkTheme.surfaceHover },
                        '&.Mui-selected': { backgroundColor: darkTheme.selected },
                      },
                    },
                  }}
                >
                  <MenuItem value="all">All Rates</MenuItem>
                  <MenuItem value="default">Default Only</MenuItem>
                  <MenuItem value="non-default">Non-Default</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: darkTheme.textSecondary, fontSize: '14px' }}>
            Showing {filteredRates.length} of {roomRates.length} room rates
          </Typography>
        </Box>

        {/* Cards Layout */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: darkTheme.primary }} />
          </Box>
        ) : filteredRates.length === 0 ? (
          <Card sx={{ 
            backgroundColor: darkTheme.surface, 
            borderRadius: '8px', 
            border: `1px solid ${darkTheme.border}`,
            textAlign: 'center',
            py: 8,
          }}>
            <Typography sx={{ color: darkTheme.textSecondary, fontSize: '1.1rem' }}>
              No room rates found
            </Typography>
          </Card>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}>
            {filteredRates.map((roomRate) => (
              <RoomRateCard key={roomRate.id} roomRate={roomRate} />
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, roomRate: null })}
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              color: darkTheme.text,
              border: `1px solid ${darkTheme.border}`,
            },
          }}
        >
          <DialogTitle sx={{ color: darkTheme.text }}>Delete Room Rate</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: darkTheme.textSecondary }}>
              Are you sure you want to delete the room rate &quot;{deleteDialog.roomRate?.name}&quot;? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialog({ open: false, roomRate: null })}
              sx={{ color: darkTheme.textSecondary }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              sx={{
                color: darkTheme.error,
                '&:hover': { backgroundColor: darkTheme.errorBg },
              }}
            >
              Delete
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
                color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
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

export default RoomRateListPage;