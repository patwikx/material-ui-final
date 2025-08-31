import React from 'react';
import { notFound } from 'next/navigation';
import { Box, Container, Typography, Button, Card, Chip, Stack } from '@mui/material';
import { 
  LocationOn, 
  ArrowForward, 
  ArrowBack,
  People,
  Bed,
  AspectRatio,
  Balcony,
  Pool,
  Kitchen,
  SmokingRooms,
  Pets,
  Accessible,
  Star,
} from '@mui/icons-material';
import Link from 'next/link';
import { getRoomTypeByIdAndProperty } from '@/lib/room-details';


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
  selected: '#1e40af',
  selectedBg: 'rgba(59, 130, 246, 0.1)',
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.1)',
  error: '#ef4444',
  errorBg: 'rgba(239, 68, 68, 0.1)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.1)',
};

interface RoomDetailPageProps {
  params: { slug: string; id: string };
}

const RoomDetailPage: React.FC<RoomDetailPageProps> = async ({ params }) => {
  const { slug, id } = await params;
  
  const roomType = await getRoomTypeByIdAndProperty(id, slug);

  if (!roomType) {
    notFound();
  }

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Number(amount));
  };


  const getRoomTypeDisplay = (type: string): string => {
    return type.replace('_', ' ').toLowerCase();
  };

  const primaryImage = roomType.images.find(img => img.isPrimary)?.image.originalUrl || 
                       roomType.images[0]?.image.originalUrl || 
                       'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1920';

  const defaultRate = roomType.rates.find(rate => rate.isDefault) || roomType.rates[0];

  return (
    <Box sx={{ backgroundColor: darkTheme.background, color: darkTheme.text, minHeight: '100vh' }}>
      {/* Back Navigation */}
      <Container maxWidth="xl" sx={{ pt: 4, pb: 2 }}>
        <Button
          component={Link}
          href={`/properties/${slug}`}
          startIcon={<ArrowBack />}
          sx={{
            color: darkTheme.textSecondary,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              color: darkTheme.text,
              backgroundColor: 'transparent',
            },
          }}
        >
          Back to {roomType.businessUnit.displayName}
        </Button>
      </Container>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '70vh',
          backgroundImage: `url(${primaryImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ maxWidth: '800px' }}>
            <Chip
              label={getRoomTypeDisplay(roomType.type)}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                fontWeight: 600,
                textTransform: 'capitalize',
                mb: 3,
              }}
            />
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '3rem', md: '4rem', lg: '5rem' },
                color: 'white',
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 0.9,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {roomType.displayName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <LocationOn sx={{ color: 'white', mr: 1, fontSize: 24 }} />
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {roomType.businessUnit.city}, {roomType.businessUnit.country}
              </Typography>
            </Box>
            {roomType.description && (
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '1.25rem',
                  lineHeight: 1.6,
                  mb: 6,
                  maxWidth: '600px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {roomType.description}
              </Typography>
            )}
            {defaultRate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 900,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {formatCurrency(defaultRate.baseRate, defaultRate.currency)}
                </Typography>
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  per night
                </Typography>
              </Box>
            )}
            <Link href={`/properties/${slug}/rooms/${id}/booking`} passHref>
              <Button
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: darkTheme.primary,
                  color: 'white',
                  px: 6,
                  py: 3,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: darkTheme.primaryHover,
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)',
                  },
                }}
              >
                Book This Room
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Room Details */}
        <Box sx={{ mb: { xs: 8, md: 12 } }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              color: darkTheme.text,
              mb: 6,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            Room Details
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)'
              },
              gap: 4,
              mb: 8,
            }}
          >
            {/* Occupancy */}
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                border: `1px solid ${darkTheme.border}`,
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
              }}
            >
              <People sx={{ fontSize: 40, color: darkTheme.primary, mb: 2 }} />
              <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                Maximum Occupancy
              </Typography>
              <Typography sx={{ color: darkTheme.textSecondary, fontSize: '1.1rem' }}>
                {roomType.maxOccupancy} guests
              </Typography>
              <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.9rem', mt: 1 }}>
                {roomType.maxAdults} adults, {roomType.maxChildren} children, {roomType.maxInfants} infants
              </Typography>
            </Card>

            {/* Bed Configuration */}
            {roomType.bedConfiguration && (
              <Card
                sx={{
                  backgroundColor: darkTheme.surface,
                  border: `1px solid ${darkTheme.border}`,
                  borderRadius: '8px',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Bed sx={{ fontSize: 40, color: darkTheme.primary, mb: 2 }} />
                <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                  Bed Configuration
                </Typography>
                <Typography sx={{ color: darkTheme.textSecondary }}>
                  {roomType.bedConfiguration}
                </Typography>
              </Card>
            )}

            {/* Room Size */}
            {roomType.roomSize && (
              <Card
                sx={{
                  backgroundColor: darkTheme.surface,
                  border: `1px solid ${darkTheme.border}`,
                  borderRadius: '8px',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <AspectRatio sx={{ fontSize: 40, color: darkTheme.primary, mb: 2 }} />
                <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                  Room Size
                </Typography>
                <Typography sx={{ color: darkTheme.textSecondary }}>
                  {roomType.roomSize} sqm
                </Typography>
              </Card>
            )}
          </Box>

          {/* Features */}
          <Box sx={{ mb: 8 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: darkTheme.text,
                mb: 4,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Room Features
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)'
                },
                gap: 3,
              }}
            >
              {roomType.hasBalcony && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Balcony sx={{ color: darkTheme.success, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Private Balcony
                  </Typography>
                </Box>
              )}
              {roomType.hasOceanView && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Star sx={{ color: darkTheme.success, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Ocean View
                  </Typography>
                </Box>
              )}
              {roomType.hasPoolView && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Pool sx={{ color: darkTheme.success, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Pool View
                  </Typography>
                </Box>
              )}
              {roomType.hasKitchenette && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Kitchen sx={{ color: darkTheme.success, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Kitchenette
                  </Typography>
                </Box>
              )}
              {roomType.hasLivingArea && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Star sx={{ color: darkTheme.success, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Living Area
                  </Typography>
                </Box>
              )}
              {roomType.smokingAllowed && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SmokingRooms sx={{ color: darkTheme.warning, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Smoking Allowed
                  </Typography>
                </Box>
              )}
              {roomType.petFriendly && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Pets sx={{ color: darkTheme.success, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Pet Friendly
                  </Typography>
                </Box>
              )}
              {roomType.isAccessible && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Accessible sx={{ color: darkTheme.success, fontSize: 24 }} />
                  <Typography sx={{ color: darkTheme.text, fontWeight: 600 }}>
                    Accessible
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Amenities */}
          {roomType.amenities.length > 0 && (
            <Box sx={{ mb: 8 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: darkTheme.text,
                  mb: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Amenities
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)'
                  },
                  gap: 3,
                }}
              >
                {roomType.amenities.map((amenityRelation) => (
                  <Card
                    key={amenityRelation.id}
                    sx={{
                      backgroundColor: darkTheme.surface,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: '8px',
                      p: 3,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                      {amenityRelation.amenity.name}
                    </Typography>
                    {amenityRelation.amenity.description && (
                      <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.9rem' }}>
                        {amenityRelation.amenity.description}
                      </Typography>
                    )}
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Room Gallery */}
          {roomType.images.length > 1 && (
            <Box sx={{ mb: 8 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: darkTheme.text,
                  mb: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Room Gallery
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)'
                  },
                  gap: 4,
                }}
              >
                {roomType.images.map((imageRelation) => (
                  <Box
                    key={imageRelation.id}
                    sx={{
                      position: 'relative',
                      height: 250,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundImage: `url(${imageRelation.image.originalUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    {imageRelation.image.title && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                          p: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem',
                          }}
                        >
                          {imageRelation.image.title}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Pricing */}
          {roomType.rates.length > 0 && (
            <Box sx={{ mb: 8 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: darkTheme.text,
                  mb: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Room Rates
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)'
                  },
                  gap: 4,
                }}
              >
                {roomType.rates.map((rate) => (
                  <Card
                    key={rate.id}
                    sx={{
                      backgroundColor: rate.isDefault ? darkTheme.selectedBg : darkTheme.surface,
                      border: `1px solid ${rate.isDefault ? darkTheme.primary : darkTheme.border}`,
                      borderRadius: '8px',
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography sx={{ fontWeight: 600, color: darkTheme.text, fontSize: '1.1rem' }}>
                        {rate.name}
                      </Typography>
                      {rate.isDefault && (
                        <Chip
                          label="Default"
                          size="small"
                          sx={{
                            backgroundColor: darkTheme.primary,
                            color: 'white',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </Box>
                    {rate.description && (
                      <Typography sx={{ color: darkTheme.textSecondary, mb: 2, fontSize: '0.9rem' }}>
                        {rate.description}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: '1.5rem',
                        color: darkTheme.primary,
                        mb: 1,
                      }}
                    >
                      {formatCurrency(rate.baseRate, rate.currency)}
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.9rem' }}>
                      per night
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Additional Charges */}
          {(roomType.extraPersonRate || roomType.extraChildRate) && (
            <Box sx={{ mb: 8 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: darkTheme.text,
                  mb: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Additional Charges
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)'
                  },
                  gap: 4,
                }}
              >
                {roomType.extraPersonRate && (
                  <Card
                    sx={{
                      backgroundColor: darkTheme.surface,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: '8px',
                      p: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                      Extra Person
                    </Typography>
                    <Typography sx={{ color: darkTheme.primary, fontSize: '1.2rem', fontWeight: 700 }}>
                      {formatCurrency(roomType.extraPersonRate, defaultRate?.currency || 'PHP')}
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.9rem' }}>
                      per night
                    </Typography>
                  </Card>
                )}
                {roomType.extraChildRate && (
                  <Card
                    sx={{
                      backgroundColor: darkTheme.surface,
                      border: `1px solid ${darkTheme.border}`,
                      borderRadius: '8px',
                      p: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                      Extra Child
                    </Typography>
                    <Typography sx={{ color: darkTheme.primary, fontSize: '1.2rem', fontWeight: 700 }}>
                      {formatCurrency(roomType.extraChildRate, defaultRate?.currency || 'PHP')}
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.9rem' }}>
                      per night
                    </Typography>
                  </Card>
                )}
              </Box>
            </Box>
          )}

          {/* Availability */}
          <Box sx={{ mb: 8 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: darkTheme.text,
                mb: 4,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Availability
            </Typography>
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                border: `1px solid ${darkTheme.border}`,
                borderRadius: '8px',
                p: 4,
              }}
            >
              <Typography sx={{ color: darkTheme.text, fontSize: '1.1rem', mb: 2 }}>
                <strong>{roomType._count.rooms}</strong> rooms of this type available
              </Typography>
              <Typography sx={{ color: darkTheme.textSecondary }}>
                Contact us for real-time availability and special rates for extended stays.
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            backgroundColor: darkTheme.surface,
            p: { xs: 6, md: 8 },
            borderRadius: '8px',
            border: `1px solid ${darkTheme.border}`,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              color: darkTheme.text,
              mb: 4,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            Ready to Book?
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1.2rem',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Experience luxury and comfort in our {roomType.displayName}. 
            Book now to secure your perfect getaway.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <Link href={`/properties/${slug}/rooms/${id}/booking`} passHref>
              <Button
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: darkTheme.primary,
                  color: 'white',
                  px: 8,
                  py: 3,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: darkTheme.primaryHover,
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)',
                  },
                }}
              >
                Book Now
              </Button>
            </Link>
            <Button
              variant="outlined"
              sx={{
                borderColor: darkTheme.border,
                color: darkTheme.text,
                px: 6,
                py: 3,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: darkTheme.primary,
                  backgroundColor: darkTheme.selectedBg,
                },
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default RoomDetailPage;