// app/booking/success/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { Box, Container, Typography, Card, Button, Divider } from '@mui/material';
import { CheckCircleOutline, Home } from '@mui/icons-material';
import Link from 'next/link';
import { getReservationByConfirmationNumber } from '@/lib/reservation-check';


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
};

interface SuccessPageProps {
  searchParams: {
    confirmation?: string;
  };
}

const SuccessPage: React.FC<SuccessPageProps> = async ({ searchParams }) => {
  const confirmationNumber = searchParams.confirmation;

  if (!confirmationNumber) {
    notFound();
  }

  const reservation = await getReservationByConfirmationNumber(confirmationNumber);

  if (!reservation) {
    notFound();
  }
  
  const guestFullName = `${reservation.guest.firstName} ${reservation.guest.lastName}`;
  const roomTypeName = reservation.rooms[0]?.roomType?.displayName || 'Room';
  const checkInDate = new Date(reservation.checkInDate).toLocaleDateString();
  const checkOutDate = new Date(reservation.checkOutDate).toLocaleDateString();
  const nights = reservation.nights;
  const totalAmount = reservation.totalAmount.toNumber();
  const currency = reservation.currency || 'PHP';

  const formatCurrency = (amount: number, cur: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
    }).format(amount);
  };

  return (
    <Box sx={{ backgroundColor: darkTheme.background, minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <Card
          sx={{
            backgroundColor: darkTheme.surface,
            border: `1px solid ${darkTheme.border}`,
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
          }}
        >
          <Box sx={{ color: darkTheme.success, mb: 4 }}>
            <CheckCircleOutline sx={{ fontSize: '80px' }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: darkTheme.text,
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Booking Confirmed!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1.1rem',
              maxWidth: '500px',
              mx: 'auto',
              mb: 4,
            }}
          >
            Thank you for your reservation, {guestFullName}. Your booking has been successfully confirmed. A detailed receipt has been sent to your email.
          </Typography>

          <Card
            sx={{
              backgroundColor: darkTheme.background,
              border: `1px solid ${darkTheme.border}`,
              borderRadius: '8px',
              p: { xs: 2, md: 4 },
              textAlign: 'left',
              mb: 4,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.text, mb: 2 }}>
              Booking Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: darkTheme.textSecondary }}>Confirmation No.:</Typography>
                <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>{confirmationNumber}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: darkTheme.textSecondary }}>Guest Name:</Typography>
                <Typography sx={{ color: darkTheme.text }}>{guestFullName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: darkTheme.textSecondary }}>Property:</Typography>
                <Typography sx={{ color: darkTheme.text }}>{reservation.businessUnit.displayName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: darkTheme.textSecondary }}>Room Type:</Typography>
                <Typography sx={{ color: darkTheme.text }}>{roomTypeName}</Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: darkTheme.border }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: darkTheme.textSecondary }}>Check-in:</Typography>
                <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>{checkInDate}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: darkTheme.textSecondary }}>Check-out:</Typography>
                <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>{checkOutDate}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: darkTheme.textSecondary }}>Nights:</Typography>
                <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>{nights}</Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: darkTheme.border }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.text }}>
                  Total Paid:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: darkTheme.success }}>
                  {formatCurrency(totalAmount, currency)}
                </Typography>
              </Box>
            </Box>
          </Card>

          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<Home />}
            sx={{
              backgroundColor: darkTheme.primary,
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              '&:hover': {
                backgroundColor: darkTheme.primaryHover,
              },
            }}
          >
            Go to Homepage
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default SuccessPage;