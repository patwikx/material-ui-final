'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  IconButton,
  Alert,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  CreditCard,
  Check,
  Add,
  Remove,
  LocationOn,
  Bed,
  CheckCircle,
  Cancel,
  Info,
  Phone,
  Email,
  Warning,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Enhanced dark theme
const darkTheme = {
  background: '#0a0e13',
  surface: '#1a1f29',
  surfaceHover: '#252a35',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  border: '#1e293b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

// --- CORRECTED Interfaces to match server data types ---
interface Property {
  id: string;
  displayName: string;
  slug: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  cancellationHours: number | null;
  primaryCurrency: string | null;
  location: string;
  description: string | null;
}

interface RoomType {
  id: string;
  displayName: string;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  baseRate: number;
  description: string | null;
  amenities?: string[];
  size?: string;
  images?: string[];
  features?: {
    hasBalcony?: boolean;
    hasOceanView?: boolean;
    hasPoolView?: boolean;
    hasKitchenette?: boolean;
    hasLivingArea?: boolean;
    petFriendly?: boolean;
    isAccessible?: boolean;
    smokingAllowed?: boolean;
  };
  bedConfiguration: string | null;
}

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  specialRequests: string;
  guestNotes: string;
}

interface PricingBreakdown {
  subtotal: number;
  nights: number;
  taxes: number;
  serviceFee: number;
  totalAmount: number;
}

interface PaymentModalState {
  isOpen: boolean;
  status: 'checking' | 'paid' | 'failed' | 'cancelled' | 'pending';
  confirmationNumber?: string;
  sessionId?: string;
}

interface RoomBookingClientProps {
  property: Property;
  roomType: RoomType;
}

interface PaymentStatusResponse {
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
  reservationId?: string;
  confirmationNumber?: string;
  message?: string;
  paymentDetails?: {
    amount: number;
    currency: string;
    method: string;
    provider: string;
    processedAt?: string;
  };
}

const steps = ['Guest Details', 'Stay Dates', 'Review & Pay'];

export function RoomBookingClient({ property, roomType }: RoomBookingClientProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    guestNotes: '',
  });

  const [nights, setNights] = useState(0);

  const [pricing, setPricing] = useState<PricingBreakdown>({
    subtotal: 0,
    nights: 0,
    taxes: 0,
    serviceFee: 0,
    totalAmount: 0,
  });

  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    isOpen: false,
    status: 'checking',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to calculate pricing using the API
  const calculatePricing = useCallback(async (checkInDate: string, checkOutDate: string) => {
    if (!checkInDate || !checkOutDate) return;

    setIsCalculatingPrice(true);
    
    try {
      const params = new URLSearchParams({
        businessUnitId: property.id,
        roomTypeId: roomType.id,
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
      });

      const response = await axios.get(`/api/pricing/calculate?${params}`);
      const pricingData = response.data;
      
      setPricing({
        subtotal: pricingData.subtotal,
        nights: pricingData.nights,
        taxes: pricingData.taxes,
        serviceFee: pricingData.serviceFee,
        totalAmount: pricingData.totalAmount,
      });
      
      setNights(pricingData.nights);
      
    } catch (error) {
      console.error('Error calculating pricing:', error);
      // Reset to basic calculation on error
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const calculatedNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (calculatedNights > 0) {
        setNights(calculatedNights);
        setPricing(prev => ({
          ...prev,
          subtotal: roomType.baseRate * calculatedNights,
          nights: calculatedNights,
          taxes: 0,
          serviceFee: 0,
          totalAmount: roomType.baseRate * calculatedNights,
        }));
      }
    } finally {
      setIsCalculatingPrice(false);
    }
  }, [property.id, roomType.id, roomType.baseRate]);

  // Calculate pricing when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      calculatePricing(formData.checkInDate, formData.checkOutDate);
    } else {
      // Reset pricing when dates are cleared
      setPricing({
        subtotal: 0,
        nights: 0,
        taxes: 0,
        serviceFee: 0,
        totalAmount: 0,
      });
      setNights(0);
    }
  }, [formData.checkInDate, formData.checkOutDate, calculatePricing]);

  // Handle polling for payment status
  const startPolling = useCallback((sessionId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get<PaymentStatusResponse>(`/api/booking/payment-status?sessionId=${sessionId}`);
        const { status, confirmationNumber } = response.data;
        
        console.log(`Polling for session ${sessionId}, current status: ${status}`);
        
        if (status === 'paid' || status === 'failed' || status === 'cancelled') {
          setPaymentModal({
            isOpen: true,
            status,
            confirmationNumber,
          });
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        setPaymentModal({
          isOpen: true,
          status: 'failed',
          confirmationNumber: undefined,
        });
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      }
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback((field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  }, [errors]);

  const handleGuestCountChange = useCallback((type: 'adults' | 'children', increment: boolean) => {
    setFormData(prev => {
      const currentCount = prev[type];
      const newCount = increment ? currentCount + 1 : Math.max(type === 'adults' ? 1 : 0, currentCount - 1);
      
      if (type === 'adults' && newCount > roomType.maxAdults) return prev;
      if (type === 'children' && newCount > roomType.maxChildren) return prev;
      if ((prev.adults + prev.children) >= roomType.maxOccupancy && increment) return prev;
      
      return {
        ...prev,
        [type]: newCount,
      };
    });
  }, [roomType.maxAdults, roomType.maxChildren, roomType.maxOccupancy]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    }
    
    if (step === 1) {
      if (!formData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
      if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
      
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) newErrors.checkInDate = 'Check-in date cannot be in the past';
      if (checkOut <= checkIn) newErrors.checkOutDate = 'Check-out date must be after check-in date';
      
      const totalGuests = formData.adults + formData.children;
      if (totalGuests > roomType.maxOccupancy) {
        newErrors.guests = `Maximum ${roomType.maxOccupancy} guests allowed`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, roomType.maxOccupancy]);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setIsSubmitting(true);
    
    try {
      const bookingData = {
        ...formData,
        checkInDate: new Date(formData.checkInDate).toISOString(),
        checkOutDate: new Date(formData.checkOutDate).toISOString(),
        businessUnitId: property.id,
        roomTypeId: roomType.id,
        nights: nights,
        subtotal: pricing.subtotal,
        taxes: pricing.taxes,
        serviceFee: pricing.serviceFee,
        totalAmount: pricing.totalAmount,
      };

      const response = await axios.post('/api/booking/create-with-payment', bookingData);
      
      const { checkoutUrl, paymentSessionId } = response.data;
      
      window.open(checkoutUrl, '_blank');
      
      setPaymentModal({
        isOpen: true,
        status: 'checking',
        sessionId: paymentSessionId,
      });

      startPolling(paymentSessionId);

    } catch (error) {
      console.error('Booking error:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        errorMessage = error.message;
      }
      setPaymentModal({
        isOpen: true,
        status: 'failed',
        confirmationNumber: undefined,
      });
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setPaymentModal(prev => ({ ...prev, isOpen: false }));
    
    if (paymentModal.status === 'paid' && paymentModal.confirmationNumber) {
      router.push(`/booking/success?confirmation=${paymentModal.confirmationNumber}`);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const totalGuests = formData.adults + formData.children;

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: darkTheme.text }}>
              Guest Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: darkTheme.surface,
                      '& fieldset': { borderColor: darkTheme.border },
                      '&:hover fieldset': { borderColor: darkTheme.primary },
                    },
                    '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                    '& .MuiInputBase-input': { color: darkTheme.text },
                  }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: darkTheme.surface,
                      '& fieldset': { borderColor: darkTheme.border },
                      '&:hover fieldset': { borderColor: darkTheme.primary },
                    },
                    '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                    '& .MuiInputBase-input': { color: darkTheme.text },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: darkTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: darkTheme.surface,
                    '& fieldset': { borderColor: darkTheme.border },
                    '&:hover fieldset': { borderColor: darkTheme.primary },
                  },
                  '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                  '& .MuiInputBase-input': { color: darkTheme.text },
                }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: darkTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: darkTheme.surface,
                    '& fieldset': { borderColor: darkTheme.border },
                    '&:hover fieldset': { borderColor: darkTheme.primary },
                  },
                  '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                  '& .MuiInputBase-input': { color: darkTheme.text },
                }}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: darkTheme.text }}>
              Stay Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  error={!!errors.checkInDate}
                  helperText={errors.checkInDate}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: minDate }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: darkTheme.surface,
                      '& fieldset': { borderColor: darkTheme.border },
                      '&:hover fieldset': { borderColor: darkTheme.primary },
                    },
                    '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                    '& .MuiInputBase-input': { color: darkTheme.text },
                  }}
                />
                <TextField
                  fullWidth
                  label="Check-out Date"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                  error={!!errors.checkOutDate}
                  helperText={errors.checkOutDate}
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: formData.checkInDate || minDate }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: darkTheme.surface,
                      '& fieldset': { borderColor: darkTheme.border },
                      '&:hover fieldset': { borderColor: darkTheme.primary },
                    },
                    '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                    '& .MuiInputBase-input': { color: darkTheme.text },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 3, color: darkTheme.text }}>
                  Number of Guests
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Card sx={{ backgroundColor: darkTheme.surface, border: `1px solid ${darkTheme.border}` }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: darkTheme.text }}>
                          Adults
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                          Age 13+
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                          onClick={() => handleGuestCountChange('adults', false)}
                          disabled={formData.adults <= 1}
                          sx={{ 
                            color: darkTheme.primary,
                            '&:disabled': { color: darkTheme.textSecondary }
                          }}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: darkTheme.text }}>
                          {formData.adults}
                        </Typography>
                        <IconButton
                          onClick={() => handleGuestCountChange('adults', true)}
                          disabled={formData.adults >= roomType.maxAdults}
                          sx={{ 
                            color: darkTheme.primary,
                            '&:disabled': { color: darkTheme.textSecondary }
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ backgroundColor: darkTheme.surface, border: `1px solid ${darkTheme.border}` }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: darkTheme.text }}>
                          Children
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                          Age 0-12
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                          onClick={() => handleGuestCountChange('children', false)}
                          disabled={formData.children <= 0}
                          sx={{ 
                            color: darkTheme.primary,
                            '&:disabled': { color: darkTheme.textSecondary }
                          }}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, color: darkTheme.text }}>
                          {formData.children}
                        </Typography>
                        <IconButton
                          onClick={() => handleGuestCountChange('children', true)}
                          disabled={formData.children >= roomType.maxChildren || totalGuests >= roomType.maxOccupancy}
                          sx={{ 
                            color: darkTheme.primary,
                            '&:disabled': { color: darkTheme.textSecondary }
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {errors.guests && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.guests}
                  </Alert>
                )}
              </Box>

              <TextField
                fullWidth
                label="Special Requests"
                multiline
                rows={4}
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special requests or preferences for your stay?"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: darkTheme.surface,
                    '& fieldset': { borderColor: darkTheme.border },
                    '&:hover fieldset': { borderColor: darkTheme.primary },
                  },
                  '& .MuiInputLabel-root': { color: darkTheme.textSecondary },
                  '& .MuiInputBase-input': { color: darkTheme.text },
                }}
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: darkTheme.text }}>
              Review Your Booking
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Booking Summary */}
              <Card sx={{ backgroundColor: darkTheme.surface, border: `1px solid ${darkTheme.border}` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkTheme.text }}>
                    Booking Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: darkTheme.textSecondary }}>Guest:</Typography>
                      <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                        {formData.firstName} {formData.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: darkTheme.textSecondary }}>Email:</Typography>
                      <Typography sx={{ color: darkTheme.text }}>
                        {formData.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: darkTheme.textSecondary }}>Check-in:</Typography>
                      <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                        {new Date(formData.checkInDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: darkTheme.textSecondary }}>Check-out:</Typography>
                      <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                        {new Date(formData.checkOutDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: darkTheme.textSecondary }}>Guests:</Typography>
                      <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                        {formData.adults} adult{formData.adults > 1 ? 's' : ''}
                        {formData.children > 0 && `, ${formData.children} child${formData.children > 1 ? 'ren' : ''}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: darkTheme.textSecondary }}>Nights:</Typography>
                      <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                        {nights}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Pricing Breakdown (with real calculations) */}
              {nights > 0 && (
                <Card sx={{ backgroundColor: darkTheme.surface, border: `1px solid ${darkTheme.border}` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: darkTheme.text }}>
                      Price Breakdown
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: darkTheme.textSecondary }}>
                          Room Rate ({nights} nights)
                        </Typography>
                        <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                          {isCalculatingPrice ? (
                            <CircularProgress size={16} sx={{ color: darkTheme.primary }} />
                          ) : (
                            `₱${pricing.subtotal.toLocaleString()}`
                          )}
                        </Typography>
                      </Box>
                      
                      {pricing.taxes > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: darkTheme.textSecondary }}>Taxes</Typography>
                          <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                            {isCalculatingPrice ? (
                              <CircularProgress size={16} sx={{ color: darkTheme.primary }} />
                            ) : (
                              `₱${pricing.taxes.toLocaleString()}`
                            )}
                          </Typography>
                        </Box>
                      )}
                      
                      {pricing.serviceFee > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: darkTheme.textSecondary }}>Service Fee</Typography>
                          <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                            {isCalculatingPrice ? (
                              <CircularProgress size={16} sx={{ color: darkTheme.primary }} />
                            ) : (
                              `₱${pricing.serviceFee.toLocaleString()}`
                            )}
                          </Typography>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1, borderColor: darkTheme.border }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.text }}>
                          Total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.primary }}>
                          {isCalculatingPrice ? (
                            <CircularProgress size={20} sx={{ color: darkTheme.primary }} />
                          ) : (
                            `₱${pricing.totalAmount.toLocaleString()}`
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Terms & Conditions */}
              <Alert severity="info" icon={<Info sx={{ color: darkTheme.primary }} />} sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <Typography variant="body2" sx={{ color: darkTheme.text }}>
                  By proceeding with this booking, you agree to our terms and conditions. 
                  Cancellation is free up to {property.cancellationHours || 24} hours before check-in.
                </Typography>
              </Alert>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  const primaryImage = roomType.images?.[0] || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1920';

  return (
    <Box sx={{ backgroundColor: darkTheme.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Back Button */}
        <Button
          component={Link}
          href={`/properties/${property.slug}/rooms/${roomType.id}`}
          startIcon={<ArrowBack />}
          sx={{
            color: darkTheme.textSecondary,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            mb: 4,
            '&:hover': {
              color: darkTheme.text,
              backgroundColor: 'transparent',
            },
          }}
        >
          Back to Room Details
        </Button>

        {/* Header */}
        <Box
          sx={{ mb: 6 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: darkTheme.text,
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            Book Your Stay
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: darkTheme.textSecondary,
              fontWeight: 400,
            }}
          >
            {property.displayName} • {roomType.displayName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 6 }}>
          {/* Main Content */}
          <Box sx={{ flex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Stepper */}
              <Card sx={{ backgroundColor: darkTheme.surface, border: `1px solid ${darkTheme.border}`, mb: 4 }}>
                <CardContent>
                  <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel
                          sx={{
                            '& .MuiStepLabel-label': {
                              color: index <= activeStep ? darkTheme.text : darkTheme.textSecondary,
                              fontWeight: index <= activeStep ? 600 : 400,
                            },
                            '& .MuiStepIcon-root': {
                              color: index < activeStep ? darkTheme.success : 
                                     index === activeStep ? darkTheme.primary : darkTheme.textSecondary,
                            },
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>

              {/* Step Content */}
              <Card sx={{ backgroundColor: darkTheme.surface, border: `1px solid ${darkTheme.border}` }}>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderStepContent(activeStep)}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 4, mt: 4, borderTop: `1px solid ${darkTheme.border}` }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      sx={{
                        color: darkTheme.textSecondary,
                        '&:disabled': { color: darkTheme.border },
                      }}
                    >
                      Back
                    </Button>

                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isCalculatingPrice}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <CreditCard />}
                        sx={{
                          backgroundColor: darkTheme.primary,
                          color: 'white',
                          px: 6,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          '&:hover': {
                            backgroundColor: darkTheme.primaryHover,
                          },
                          '&:disabled': {
                            backgroundColor: darkTheme.textSecondary,
                          },
                        }}
                      >
                        {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{
                          backgroundColor: darkTheme.primary,
                          color: 'white',
                          px: 4,
                          py: 2,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: darkTheme.primaryHover,
                          },
                        }}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>

          {/* Sidebar - Room Details */}
          <Box sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card 
                sx={{ 
                  backgroundColor: darkTheme.surface, 
                  border: `1px solid ${darkTheme.border}`,
                  position: 'sticky',
                  top: 24,
                }}
              >
                {/* Room Image */}
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${primaryImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px 8px 0 0',
                  }}
                />

                <CardContent>
                  {/* Room Info */}
                  <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.text, mb: 1 }}>
                    {roomType.displayName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <LocationOn sx={{ color: darkTheme.textSecondary, fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                      {property.location}
                    </Typography>
                  </Box>

                  {/* Room Features */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: darkTheme.text, mb: 2 }}>
                      Room Features
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {roomType.bedConfiguration && (
                        <Chip
                          icon={<Bed />}
                          label={roomType.bedConfiguration}
                          size="small"
                          sx={{
                            backgroundColor: darkTheme.background,
                            color: darkTheme.text,
                            '& .MuiChip-icon': { color: darkTheme.primary },
                          }}
                        />
                      )}
                      {roomType.size && (
                        <Chip
                          label={roomType.size}
                          size="small"
                          sx={{
                            backgroundColor: darkTheme.background,
                            color: darkTheme.text,
                          }}
                        />
                      )}
                      {roomType.features?.hasOceanView && (
                        <Chip
                          label="Ocean View"
                          size="small"
                          sx={{
                            backgroundColor: darkTheme.background,
                            color: darkTheme.text,
                          }}
                        />
                      )}
                      {roomType.features?.hasBalcony && (
                        <Chip
                          label="Balcony"
                          size="small"
                          sx={{
                            backgroundColor: darkTheme.background,
                            color: darkTheme.text,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Amenities */}
                  {roomType.amenities && roomType.amenities.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: darkTheme.text, mb: 2 }}>
                        Amenities
                      </Typography>
                      <Stack spacing={1}>
                        {roomType.amenities.slice(0, 5).map((amenity, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Check sx={{ color: darkTheme.success, fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: darkTheme.text }}>
                              {amenity}
                            </Typography>
                          </Box>
                        ))}
                        {roomType.amenities.length > 5 && (
                          <Typography variant="body2" sx={{ color: darkTheme.textSecondary, fontStyle: 'italic' }}>
                            +{roomType.amenities.length - 5} more amenities
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}

                  <Divider sx={{ my: 3, borderColor: darkTheme.border }} />

                  {/* Pricing Summary (Sidebar) */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: darkTheme.text, mb: 2 }}>
                      Price Summary
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: darkTheme.textSecondary }}>
                          Base Rate (per night)
                        </Typography>
                        <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                          ₱{roomType.baseRate.toLocaleString()}
                        </Typography>
                      </Box>

                      {nights > 0 && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: darkTheme.textSecondary }}>
                              Subtotal ({nights} nights)
                            </Typography>
                            <Typography sx={{ color: darkTheme.text, fontWeight: 500 }}>
                              {isCalculatingPrice ? (
                                <CircularProgress size={16} sx={{ color: darkTheme.primary }} />
                              ) : (
                                `₱${pricing.subtotal.toLocaleString()}`
                              )}
                            </Typography>
                          </Box>

                          {(pricing.taxes > 0 || pricing.serviceFee > 0) && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography sx={{ color: darkTheme.textSecondary }}>Taxes & Fees</Typography>
                              <Typography sx={{ color: darkTheme.text }}>
                                {isCalculatingPrice ? (
                                  <CircularProgress size={16} sx={{ color: darkTheme.primary }} />
                                ) : (
                                  `₱${(pricing.taxes + pricing.serviceFee).toLocaleString()}`
                                )}
                              </Typography>
                            </Box>
                          )}

                          <Divider sx={{ my: 1, borderColor: darkTheme.border }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.text }}>
                              Total
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.primary }}>
                              {isCalculatingPrice ? (
                                <CircularProgress size={20} sx={{ color: darkTheme.primary }} />
                              ) : (
                                `₱${pricing.totalAmount.toLocaleString()}`
                              )}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Policies */}
                  <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${darkTheme.border}` }}>
                    <Typography variant="caption" sx={{ color: darkTheme.textSecondary, display: 'block', mb: 1 }}>
                      • Free cancellation up to {property.cancellationHours || 24} hours before check-in
                    </Typography>
                    <Typography variant="caption" sx={{ color: darkTheme.textSecondary, display: 'block', mb: 1 }}>
                      • Check-in: {property.checkInTime || '3:00 PM'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: darkTheme.textSecondary, display: 'block' }}>
                      • Check-out: {property.checkOutTime || '12:00 PM'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Box>
      </Container>

      {/* Payment Status Modal */}
      <Dialog
        open={paymentModal.isOpen}
        onClose={() => {}} // Prevent closing with backdrop click or Esc key
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkTheme.surface,
            border: `1px solid ${darkTheme.border}`,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: darkTheme.text }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {paymentModal.status === 'checking' && (
              <>
                <CircularProgress sx={{ color: darkTheme.primary }} />
                <Typography variant="h6">Processing Payment</Typography>
              </>
            )}
            {paymentModal.status === 'paid' && (
              <>
                <Avatar sx={{ bgcolor: darkTheme.success, width: 64, height: 64 }}>
                  <CheckCircle sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6">Payment Successful!</Typography>
              </>
            )}
            {paymentModal.status === 'pending' && (
              <>
                <Avatar sx={{ bgcolor: darkTheme.warning, width: 64, height: 64 }}>
                  <Info sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6">Awaiting Payment</Typography>
              </>
            )}
            {paymentModal.status === 'failed' && (
              <>
                <Avatar sx={{ bgcolor: darkTheme.error, width: 64, height: 64 }}>
                  <Cancel sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6">Payment Failed</Typography>
              </>
            )}
            {paymentModal.status === 'cancelled' && (
              <>
                <Avatar sx={{ bgcolor: darkTheme.warning, width: 64, height: 64 }}>
                  <Warning sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6">Payment Cancelled</Typography>
              </>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center' }}>
          {paymentModal.status === 'checking' && (
            <Typography sx={{ color: darkTheme.textSecondary }}>
              Please wait while we verify your payment. This may take a few moments.
            </Typography>
          )}
          {paymentModal.status === 'paid' && (
            <Typography sx={{ color: darkTheme.textSecondary }}>
              Your reservation has been confirmed! 
              {paymentModal.confirmationNumber && (
                <>
                  <br />
                  Confirmation Number: <strong>{paymentModal.confirmationNumber}</strong>
                </>
              )}
            </Typography>
          )}
          {paymentModal.status === 'pending' && (
            <Typography sx={{ color: darkTheme.textSecondary }}>
              Your payment is still being processed. You can close this window and check your email for confirmation.
            </Typography>
          )}
          {paymentModal.status === 'failed' && (
            <Typography sx={{ color: darkTheme.textSecondary }}>
              There was an issue processing your payment. Please try again or contact support.
            </Typography>
          )}
          {paymentModal.status === 'cancelled' && (
            <Typography sx={{ color: darkTheme.textSecondary }}>
              Your payment was cancelled. You can try booking again.
            </Typography>
          )}
        </DialogContent>

        {paymentModal.status !== 'checking' && (
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={handleModalClose}
              variant="contained"
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: darkTheme.primaryHover,
                },
              }}
            >
              {paymentModal.status === 'paid' ? 'View Booking Details' : 'Try Again'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>Creating your reservation...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
}