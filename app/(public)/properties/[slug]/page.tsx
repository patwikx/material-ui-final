import React from 'react';
import { notFound } from 'next/navigation';
import { Box, Container, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import { LocationOn, Phone, Email, ArrowForward, } from '@mui/icons-material';
import { getBusinessUnitBySlug } from '@/lib/actions/business-units';
import { getRestaurantsByBusinessUnit } from '@/lib/actions/restaurants';
import { getEventsByBusinessUnit } from '@/lib/actions/events';
import { getRoomTypes } from '@/lib/actions/room-type-management';

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

interface PropertyPageProps {
  params: { slug: string };
}

const PropertyPage: React.FC<PropertyPageProps> = async ({ params }) => {
  const { slug } = await params;
  
  const [property, roomTypes] = await Promise.all([
    getBusinessUnitBySlug(slug),
    getBusinessUnitBySlug(slug).then(p => p ? getRestaurantsByBusinessUnit(p.id) : []),
    getBusinessUnitBySlug(slug).then(p => p ? getEventsByBusinessUnit(p.id) : []),
    getBusinessUnitBySlug(slug).then(p => p ? getRoomTypes(p.id) : []),
  ]);

  if (!property) {
    notFound();
  }


  const getPropertyTypeDisplay = (type: string): string => {
    return type.replace('_', ' ').toLowerCase();
  };


  const primaryImage = property.images.find(img => img.isPrimary)?.image.originalUrl || 
                     property.images[0]?.image.originalUrl || 
                     'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1920';

  return (
    <Box sx={{ backgroundColor: darkTheme.background, color: darkTheme.text, minHeight: '100vh' }}>
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
              label={getPropertyTypeDisplay(property.propertyType)}
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
              {property.displayName}
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
                {property.city}, {property.country}
              </Typography>
            </Box>
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
              {property.shortDescription || property.description}
            </Typography>
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
              Book Your Stay
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Property Details */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Room Types Section */}
        {roomTypes.length > 0 && (
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
              Our Rooms & Suites
            </Typography>
            {/* Using CSS Grid instead of Material-UI Grid */}
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
              {roomTypes.slice(0, 6).map((roomType) => (
                <Card
                  key={roomType.id}
                  sx={{
                    backgroundColor: darkTheme.surface,
                    border: `1px solid ${darkTheme.border}`,
                    borderRadius: '8px',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                      borderColor: darkTheme.primary,
                    },
                  }}
                >
                  {roomType.images.length > 0 && (
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${roomType.images[0].image.originalUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      sx={{
                        color: darkTheme.textSecondary,
                        mb: 3,
                        lineHeight: 1.6,
                      }}
                    >
                      {roomType.description}
                    </Typography>
                    <Button
                      fullWidth
                      href={`/properties/${slug}/rooms/${roomType.id}`}
                      sx={{
                        backgroundColor: darkTheme.primary,
                        color: 'white',
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        '&:hover': {
                          backgroundColor: darkTheme.primaryHover,
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Contact Information */}
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
            Contact Information
          </Typography>
          {/* Using CSS Grid for contact cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)'
              },
              gap: 4,
            }}
          >
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                border: `1px solid ${darkTheme.border}`,
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Phone sx={{ fontSize: 40, color: darkTheme.primary, mb: 2 }} />
              <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                Phone
              </Typography>
              <Typography sx={{ color: darkTheme.textSecondary }}>
                {property.phone || '+1 (555) 123-4567'}
              </Typography>
            </Card>
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                border: `1px solid ${darkTheme.border}`,
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Email sx={{ fontSize: 40, color: darkTheme.primary, mb: 2 }} />
              <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                Email
              </Typography>
              <Typography sx={{ color: darkTheme.textSecondary }}>
                {property.email || `info@${property.slug}.com`}
              </Typography>
            </Card>
            <Card
              sx={{
                backgroundColor: darkTheme.surface,
                border: `1px solid ${darkTheme.border}`,
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
              }}
            >
              <LocationOn sx={{ fontSize: 40, color: darkTheme.primary, mb: 2 }} />
              <Typography sx={{ fontWeight: 600, color: darkTheme.text, mb: 1 }}>
                Address
              </Typography>
              <Typography sx={{ color: darkTheme.textSecondary }}>
                {property.address || `${property.city}, ${property.country}`}
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
            Ready to Experience Luxury?
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
            Book your stay at {property.displayName} and discover why we&apos;re the preferred choice for discerning travelers.
          </Typography>
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
        </Box>
      </Container>
    </Box>
  );
};

export default PropertyPage;