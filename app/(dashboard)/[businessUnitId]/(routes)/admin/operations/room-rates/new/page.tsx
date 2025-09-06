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
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { createRoomRate, CreateRoomRateData } from '@/lib/actions/room-rates-management';
import { getRoomTypes, RoomTypeData } from '@/lib/actions/room-type-management';
import { useBusinessUnit } from '@/context/business-unit-context';
import Link from 'next/link';

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

// FIX: Updated interface to match the server action and Prisma schema
interface RoomRateFormData {
  roomTypeId: string;
  name: string;
  description: string;
  baseRate: number;
  currency: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  isDefault: boolean;
  minStay: number;
  maxStay: number | null;
  minAdvance: number | null;
  maxAdvance: number | null;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

const weekDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const NewRoomRatePage: React.FC = () => {
  const router = useRouter();
  const { businessUnitId } = useBusinessUnit();
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([]);
  const [formData, setFormData] = useState<RoomRateFormData>({
    roomTypeId: '',
    name: '',
    description: '',
    baseRate: 0,
    currency: '',
    validFrom: '',
    validTo: '',
    isActive: true,
    isDefault: false,
    minStay: 1,
    maxStay: null,
    minAdvance: null,
    maxAdvance: null,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const types = await getRoomTypes(businessUnitId || "");
        setRoomTypes(types);
        if (types.length > 0) {
          setFormData(prev => ({ ...prev, roomTypeId: types[0].id }));
        }
      } catch (error) {
        console.error('Failed to load room types:', error);
      }
    };

    if (businessUnitId) {
      loadRoomTypes();
    }
  }, [businessUnitId]);

  const handleInputChange = (field: keyof RoomRateFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayOfWeekChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [day]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roomRateData: CreateRoomRateData = {
        roomTypeId: formData.roomTypeId,
        name: formData.name,
        description: formData.description || null,
        baseRate: formData.baseRate,
        currency: formData.currency,
        validFrom: new Date(formData.validFrom),
        validTo: formData.validTo ? new Date(formData.validTo) : null,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        minStay: formData.minStay,
        maxStay: formData.maxStay,
        minAdvance: formData.minAdvance,
        maxAdvance: formData.maxAdvance,
        monday: formData.monday,
        tuesday: formData.tuesday,
        wednesday: formData.wednesday,
        thursday: formData.thursday,
        friday: formData.friday,
        saturday: formData.saturday,
        sunday: formData.sunday,
      };

      const result = await createRoomRate(roomRateData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Room rate created successfully',
          severity: 'success',
        });
        router.push(`/${businessUnitId}/admin/operations/room-rates`);
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to create room rate',
          severity: 'error',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while creating room rate',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
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
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton
              component={Link}
              href={`/${businessUnitId}/admin/operations/room-rates`}
              disabled={loading}
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
            Create New Room Rate
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
            Create a new pricing strategy for room types
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                borderRadius: '8px',
                border: `1px solid ${darkTheme.border}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  transform: 'translateY(-4px)',
                }
              }}
            >
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
                    label="Rate Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    fullWidth
                    disabled={loading}
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

                  <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    disabled={loading}
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
                    <FormControl fullWidth disabled={loading} sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel sx={{ color: darkTheme.textSecondary }}>Room Type</InputLabel>
                      <Select
                        value={formData.roomTypeId}
                        onChange={(e) => handleInputChange('roomTypeId', e.target.value)}
                        label="Room Type"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: darkTheme.background,
                          color: darkTheme.text,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.border },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: darkTheme.primary },
                          transition: 'all 0.2s ease-in-out',
                        }}
                        MenuProps={{
                          sx: {
                            '& .MuiPaper-root': {
                              backgroundColor: darkTheme.surface,
                              border: `1px solid ${darkTheme.border}`,
                            },
                            '& .MuiList-root': {
                              color: darkTheme.text,
                            },
                            '& .MuiMenuItem-root': {
                              '&:hover': {
                                backgroundColor: darkTheme.surfaceHover,
                              },
                              '&.Mui-selected': {
                                backgroundColor: darkTheme.selected,
                                color: darkTheme.text,
                              },
                            },
                          },
                        }}
                      >
                        {roomTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.displayName} - {type.businessUnit.displayName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </CardContent>
            </Card>

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
                  Pricing Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Base Rate"
                      type="number"
                      value={formData.baseRate}
                      onChange={(e) => handleInputChange('baseRate', parseFloat(e.target.value) || 0)}
                      required
                      disabled={loading}
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
                      label="Currency"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      disabled={loading}
                      sx={{
                        width: 150,
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
                  Validity Period
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Valid From"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => handleInputChange('validFrom', e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
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
                    label="Valid To (Optional)"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => handleInputChange('validTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
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
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: darkTheme.textSecondary, fontWeight: 600 }}>
                    Days of the Week
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {weekDays.map((day) => (
                      <FormControlLabel
                        key={day.value}
                        control={
                          <Switch
                            checked={formData[day.value as keyof RoomRateFormData] as boolean}
                            onChange={(e) => handleDayOfWeekChange(day.value, e.target.checked)}
                            disabled={loading}
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
                              transition: 'all 0.2s ease-in-out',
                            }}
                          />
                        }
                        label={<Typography sx={{ color: darkTheme.text }}>{day.label}</Typography>}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

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
                  Booking Rules
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Minimum Stay (nights)"
                      type="number"
                      value={formData.minStay}
                      onChange={(e) => handleInputChange('minStay', parseInt(e.target.value) || 1)}
                      required
                      disabled={loading}
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
                      label="Maximum Stay (nights)"
                      type="number"
                      value={formData.maxStay || ''}
                      onChange={(e) => handleInputChange('maxStay', e.target.value ? parseInt(e.target.value) : null)}
                      disabled={loading}
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
                      label="Minimum Advance Booking (days)"
                      type="number"
                      value={formData.minAdvance || ''}
                      onChange={(e) => handleInputChange('minAdvance', e.target.value ? parseInt(e.target.value) : null)}
                      disabled={loading}
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
                      label="Maximum Advance Booking (days)"
                      type="number"
                      value={formData.maxAdvance || ''}
                      onChange={(e) => handleInputChange('maxAdvance', e.target.value ? parseInt(e.target.value) : null)}
                      disabled={loading}
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

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        disabled={loading}
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
                        <MoneyIcon sx={{ fontSize: 16, color: darkTheme.success }} />
                        <Typography sx={{ color: darkTheme.textSecondary }}>Active</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isDefault}
                        onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                        disabled={loading}
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
                        <Typography sx={{ color: darkTheme.textSecondary }}>Default Rate</Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                type="button"
                onClick={() => router.push(`/${businessUnitId}/admin/operations/room-rates`)}
                disabled={loading}
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
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
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
                {loading ? 'Creating...' : 'Create Room Rate'}
              </Button>
            </Box>
          </Box>
        </form>

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

export default NewRoomRatePage;