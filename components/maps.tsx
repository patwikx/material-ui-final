'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { LocationOn, Phone, Email, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { BusinessUnitData, getBusinessUnits } from '@/lib/actions/business-units';


// Enhanced dark theme matching the reference aesthetic
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

// Create motion variants for the animations
const cardVariants = {
  hiddenLeft: {
    opacity: 0,
    x: -1200, // Start from far left (fixed value)
    scale: 0.9
  },
  hiddenRight: {
    opacity: 0,
    x: 1200, // Start from far right (fixed value)
    scale: 0.9
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1
  }
};

const Maps: React.FC = () => {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        setLoading(true);
        const units = await getBusinessUnits();
        setBusinessUnits(units);
      } catch (err) {
        console.error('Error fetching business units:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessUnits();
  }, []);

  // Generate Google Maps Static API URL
  const generateMapUrl = (lat: number | null, lng: number | null, name: string): string => {
    if (!lat || !lng) {
      // Fallback to a generic map if coordinates are missing
      return `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(name)}&zoom=13&size=600x450&markers=color:red%7C${encodeURIComponent(name)}&key=YOUR_API_KEY`;
    }
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=13&size=600x450&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;
  };

  // Generate email from property name
  const generateEmail = (name: string): string => {
    return `info@${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
  };

  // Extract amenities from property (you might need to adjust this based on your data structure)
  const getAmenities = (property: BusinessUnitData): string[] => {
    // This is a placeholder - you might have amenities in a different field
    // or need to create them based on property type, room count, restaurant count, etc.
    const amenities = [];
    
    if (property._count.rooms > 0) {
      amenities.push(`${property._count.rooms} Rooms`);
    }
    if (property._count.restaurants > 0) {
      amenities.push(`${property._count.restaurants} Restaurants`);
    }
    if (property._count.specialOffers > 0) {
      amenities.push('Special Offers');
    }
    if (property._count.events > 0) {
      amenities.push('Events');
    }
    
    // Add some default amenities based on property type
    switch (property.propertyType) {
      case 'HOTEL':
        amenities.push('Luxury Suites', 'Spa', 'Pool');
        break;
      case 'RESORT':
        amenities.push('Beach Access', 'Golf Course', 'Wellness Center');
        break;
      default:
        amenities.push('Premium Service', 'Concierge', 'Valet');
    }
    
    return amenities.slice(0, 3); // Limit to 3 amenities
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          py: 16,
          backgroundColor: darkTheme.background,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress size={60} sx={{ color: darkTheme.text }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          py: 16,
          backgroundColor: darkTheme.background,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ color: darkTheme.error, mb: 2 }}>
            Error Loading Properties
          </Typography>
          <Typography sx={{ color: darkTheme.textSecondary }}>
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  if (businessUnits.length === 0) {
    return (
      <Box 
        sx={{ 
          py: 16,
          backgroundColor: darkTheme.background,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ color: darkTheme.text, mb: 2 }}>
            No Properties Available
          </Typography>
          <Typography sx={{ color: darkTheme.textSecondary }}>
            Please check back later for our property listings.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 16 },
        backgroundColor: darkTheme.background,
        position: 'relative',
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Typography
            variant="overline"
            sx={{
              color: darkTheme.textSecondary,
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: '0.875rem',
              mb: 2,
              display: 'block',
              textTransform: 'uppercase',
            }}
          >
            Global Locations
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.75rem', md: '4rem', lg: '5rem' },
              lineHeight: { xs: 0.9, md: 0.85 },
              color: darkTheme.text,
              mb: 4,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            FIND OUR
            <br />
            PROPERTIES
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              lineHeight: 1.6,
              maxWidth: '600px',
              mx: 'auto',
              fontWeight: 400,
              mt: 3,
            }}
          >
            Discover our luxurious properties across prime locations. Each destination offers
            unique experiences and world-class amenities.
          </Typography>
        </Box>

        {/* Properties List */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 6, md: 8 },
            maxWidth: '1200px',
            mx: 'auto',
          }}
        >
          {businessUnits.map((property, index) => {
            const isEven = index % 2 === 0;
            const amenities = getAmenities(property);
            const location = `${property.city}${property.state ? ', ' + property.state : ''}, ${property.country}`;
            
            return (
              <motion.div
                key={property.id}
                initial={isEven ? "hiddenLeft" : "hiddenRight"}
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.1, 0.25, 1],
                  type: "tween"
                }}
              >
                <Card
                  sx={{
                    backgroundColor: darkTheme.surface,
                    borderRadius: 0,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: 'none',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                      '& .map-overlay': {
                        opacity: 0.7,
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { 
                        xs: 'column', 
                        md: isEven ? 'row' : 'row-reverse' 
                      },
                      minHeight: { xs: 'auto', md: '450px' },
                    }}
                  >
                    {/* Map Section */}
                    <Box 
                      sx={{ 
                        flex: { xs: '1', md: '0 0 50%' },
                        position: 'relative',
                        overflow: 'hidden',
                        height: { xs: '320px', md: '450px' },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${generateMapUrl(property.latitude, property.longitude, `${property.name}, ${location}`)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: darkTheme.surfaceHover,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Map Overlay */}
                        <Box
                          className="map-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: `${darkTheme.surfaceHover}cc`,
                            transition: 'opacity 0.3s ease',
                          }}
                        />
                        
                        {/* Location Indicator */}
                        <Box
                          sx={{
                            position: 'relative',
                            zIndex: 2,
                            backgroundColor: darkTheme.surface,
                            color: darkTheme.text,
                            p: 4,
                            textAlign: 'center',
                            maxWidth: '300px',
                          }}
                        >
                          <LocationOn sx={{ fontSize: 40, mb: 2, color: darkTheme.textSecondary }} />
                          <Typography 
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '1.25rem',
                              mb: 1,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              color: darkTheme.text,
                            }}
                          >
                            {property.displayName || property.name}
                          </Typography>
                          <Typography sx={{ color: darkTheme.textSecondary, fontWeight: 500 }}>
                            {location}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Content Section */}
                    <Box 
                      sx={{ 
                        flex: { xs: '1', md: '0 0 50%' },
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardContent 
                        sx={{ 
                          p: { xs: 4, md: 6 },
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          textAlign: { xs: 'center', md: isEven ? 'left' : 'right' },
                        }}
                      >
                        {/* Property Name */}
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                            color: darkTheme.text,
                            mb: 3,
                            letterSpacing: '-0.02em',
                            lineHeight: 0.9,
                            textTransform: 'uppercase',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                          }}
                        >
                          {property.displayName || property.name}
                        </Typography>

                        {/* Description */}
                        <Typography
                          sx={{
                            color: darkTheme.textSecondary,
                            fontSize: { xs: '1.1rem', md: '1.2rem' },
                            lineHeight: 1.6,
                            mb: 5,
                            fontWeight: 400,
                            maxWidth: '400px',
                            mx: { xs: 'auto', md: isEven ? '0' : 'auto' },
                            ml: { md: isEven ? '0' : 'auto' },
                          }}
                        >
                          {property.shortDescription || property.description || `Experience luxury and comfort at ${property.displayName || property.name}.`}
                        </Typography>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                          <Box sx={{ mb: 5 }}>
                            <Typography 
                              sx={{ 
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: darkTheme.text,
                                mb: 3,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                              }}
                            >
                              Key Amenities
                            </Typography>
                            <Stack 
                              direction="row" 
                              spacing={2} 
                              sx={{ 
                                flexWrap: 'wrap', 
                                gap: 2,
                                justifyContent: { 
                                  xs: 'center', 
                                  md: isEven ? 'flex-start' : 'flex-end' 
                                },
                              }}
                            >
                              {amenities.map((amenity) => (
                                <Chip
                                  key={amenity}
                                  label={amenity}
                                  sx={{
                                    backgroundColor: darkTheme.surfaceHover,
                                    color: darkTheme.text,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    borderRadius: 0,
                                    height: 32,
                                    '&:hover': {
                                      backgroundColor: darkTheme.surface,
                                    },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Contact Info */}
                        <Box sx={{ mb: 6 }}>
                          <Typography 
                            sx={{ 
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: darkTheme.text,
                              mb: 3,
                              textTransform: 'uppercase',
                              letterSpacing: '2px',
                            }}
                          >
                            Contact Information
                          </Typography>
                          <Stack 
                            spacing={2}
                            sx={{
                              alignItems: { 
                                xs: 'center', 
                                md: isEven ? 'flex-start' : 'flex-end' 
                              },
                            }}
                          >
                            {/* Address */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              flexDirection: { xs: 'row', md: isEven ? 'row' : 'row-reverse' },
                            }}>
                              <LocationOn sx={{ 
                                color: darkTheme.textSecondary,
                                fontSize: 20,
                                mx: 1,
                              }} />
                              <Typography 
                                sx={{ 
                                  color: darkTheme.textSecondary,
                                  fontWeight: 500,
                                  fontSize: '0.95rem',
                                }}
                              >
                                {property.address || location}
                              </Typography>
                            </Box>
                            
                            {/* Phone */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              flexDirection: { xs: 'row', md: isEven ? 'row' : 'row-reverse' },
                            }}>
                              <Phone sx={{ 
                                color: darkTheme.textSecondary,
                                fontSize: 20,
                                mx: 1,
                              }} />
                              <Typography 
                                sx={{ 
                                  color: darkTheme.textSecondary,
                                  fontWeight: 500,
                                  fontSize: '0.95rem',
                                }}
                              >
                                {property.phone || '+1 (555) 123-4567'}
                              </Typography>
                            </Box>
                            
                            {/* Email */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              flexDirection: { xs: 'row', md: isEven ? 'row' : 'row-reverse' },
                            }}>
                              <Email sx={{ 
                                color: darkTheme.textSecondary,
                                fontSize: 20,
                                mx: 1,
                              }} />
                              <Typography 
                                sx={{ 
                                  color: darkTheme.textSecondary,
                                  fontWeight: 500,
                                  fontSize: '0.95rem',
                                }}
                              >
                                {property.email || generateEmail(property.name)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Get Directions Button */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: { 
                              xs: 'center', 
                              md: isEven ? 'flex-start' : 'flex-end' 
                            },
                          }}
                        >
                          <Button
                            endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                            onClick={() => {
                              if (property.latitude && property.longitude) {
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`,
                                  '_blank'
                                );
                              } else {
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.name}, ${location}`)}`,
                                  '_blank'
                                );
                              }
                            }}
                            sx={{
                              backgroundColor: darkTheme.primary,
                              color: 'white',
                              px: 6,
                              py: 2.5,
                              fontSize: '1rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              borderRadius: '8px',
                              minWidth: '200px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: darkTheme.primaryHover,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 24px ${darkTheme.selectedBg}`,
                              },
                            }}
                          >
                            Get Directions
                          </Button>
                        </Box>
                      </CardContent>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            );
          })}
        </Box>

        {/* Bottom Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: { xs: 12, md: 20 },
            py: { xs: 6, md: 8 },
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.5rem', md: '4rem' },
              color: darkTheme.text,
              mb: 4,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
            }}
          >
            Ready to visit
            <br />
            our locations?
          </Typography>
          
          <Button
            sx={{
              backgroundColor: darkTheme.error,
              color: 'white',
              px: 10,
              py: 3.5,
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: '8px',
              mt: 4,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: darkTheme.errorHover,
                transform: 'translateY(-3px)',
                boxShadow: `0 12px 24px ${darkTheme.errorBg}`,
              },
            }}
          >
            Plan Your Visit
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Maps;