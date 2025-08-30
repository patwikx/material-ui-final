'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
} from '@mui/material';
import {
  LocationOn,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// FIX: Corrected the interface definition to match the server action's output
export interface RestaurantWithDetails {
  id: string;
  businessUnitId: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  type: string;
  cuisine: string[];
  location: string | null;
  phone: string | null;
  email: string | null;
  totalSeats: number | null;
  privateRooms: number;
  outdoorSeating: boolean;
  airConditioned: boolean;
  operatingHours: Record<string, unknown> | null;
  features: string[];
  dressCode: string | null;
  priceRange: string | null;
  averageMeal: string | null; // Corrected type to string | null
  currency: string;
  acceptsReservations: boolean;
  advanceBookingDays: number;
  minPartySize: number;
  maxPartySize: number | null;
  virtualTourUrl: string | null;
  hasMenu: boolean;
  menuUrl: string | null;
  menuUpdated: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
  };
  _count: {
    menuCategories: number;
    reservations: number;
  };
  images: {
    id: string;
    isPrimary: boolean;
    image: {
      originalUrl: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
      largeUrl: string | null;
      title: string | null;
      description: string | null;
      altText: string | null;
    };
  }[];
}

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
  errorHover: '#b91c1c',
};

interface RestaurantCardProps {
  restaurants: RestaurantWithDetails[];
}


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
    scale: 1,
  }
};

// Helper function to get the best image URL
const getImageUrl = (images: RestaurantWithDetails['images']): string => {
  if (!images || images.length === 0) {
    // Fallback image if no images are available
    return 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800';
  }

  // Find primary image first, otherwise use the first image
  const primaryImage = images.find(img => img.isPrimary) || images[0];
  
  // Return the best available image URL (prefer medium, fall back to original, then thumbnail)
  return primaryImage?.image?.mediumUrl || 
         primaryImage?.image?.originalUrl || 
         primaryImage?.image?.thumbnailUrl ||
         'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800';
};

// Helper function to get image alt text
const getImageAlt = (images: RestaurantWithDetails['images'], restaurantName: string): string => {
  if (!images || images.length === 0) {
    return `${restaurantName} interior`;
  }

  const primaryImage = images.find(img => img.isPrimary) || images[0];
  return primaryImage.image.altText || 
         primaryImage.image.title || 
         `${restaurantName} interior`;
};

// Helper function to format price range
const formatPriceRange = (priceRange: string | null): string => {
  if (!priceRange) return 'Moderate';
  return priceRange;
};

const Restaurants: React.FC<RestaurantCardProps> = ({ restaurants }) => {
  // State to track current image index for each restaurant (for future slideshow functionality)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  // Initialize image indices
  useEffect(() => {
    const initialIndices: { [key: string]: number } = {};
    restaurants.forEach((restaurant) => {
      initialIndices[restaurant.id] = 0;
    });
    setCurrentImageIndex(initialIndices);
  }, [restaurants]);

  // Don't render if no restaurants
  if (!restaurants || restaurants.length === 0) {
    return (
      <Box 
        sx={{ 
          py: { xs: 8, md: 16 },
          backgroundColor: darkTheme.background,
          textAlign: 'center',
          color: darkTheme.text,
        }}
      >
        <Container maxWidth="xl">
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              color: darkTheme.text,
              mb: 4,
              textTransform: 'uppercase',
            }}
          >
            No restaurants available at this time.
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              fontSize: '1.125rem',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Check back soon for exciting culinary experiences.
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
            Culinary Excellence
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
            OUR RESTAURANTS
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
            Experience culinary excellence across all our properties. Each restaurant
            offers unique flavors inspired by its surroundings, crafted by world-class chefs.
          </Typography>
        </Box>
      </Container>

      {/* Restaurants List - Full Width */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          width: '100%',
        }}
      >
        {restaurants.map((restaurant, index) => {
          const isEven = index % 2 === 0;
          const restaurantImages = restaurant.images || [];
          const imageUrl = getImageUrl(restaurantImages);
          const imageAlt = getImageAlt(restaurantImages, restaurant.name);
          
          return (
            <motion.div
              key={restaurant.id}
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
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: 'none',
                  width: '100vw',
                  position: 'relative',
                  left: '50%',
                  right: '50%',
                  marginLeft: '-50vw',
                  marginRight: '-50vw',
                  '&:hover': {
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    '& .restaurant-image': {
                      transform: 'scale(1.05)',
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
                    minHeight: { xs: 'auto', md: '500px' },
                    maxWidth: '100%',
                  }}
                >
                  {/* Image Section */}
                  <Box 
                    sx={{ 
                      flex: { xs: '1', md: '0 0 50%' },
                      position: 'relative',
                      overflow: 'hidden',
                      height: { xs: '350px', md: 'auto' },
                      minHeight: { md: '100%' },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      alt={imageAlt}
                      className="restaurant-image"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />

                    {/* Image Overlay for Better Text Visibility */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
                      }}
                    />
                    
                    {/* Restaurant Type Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 24,
                        [isEven ? 'right' : 'left']: 24,
                        backgroundColor: darkTheme.surface,
                        px: 3,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '60px',
                        zIndex: 2,
                        borderRadius: '8px',
                        border: `1px solid ${darkTheme.border}`,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700,
                          color: darkTheme.text,
                          fontSize: '0.875rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {restaurant.type.replace('_', ' ')}
                      </Typography>
                    </Box>

                    {/* Price Badge */}
                    {(restaurant.priceRange || restaurant.averageMeal) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 24,
                          [isEven ? 'right' : 'left']: 24,
                          backgroundColor: darkTheme.surface,
                          px: 3,
                          py: 1.5,
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          zIndex: 2,
                          borderRadius: '8px',
                          boxShadow: `0 2px 8px ${darkTheme.surfaceHover}`,
                          border: `1px solid ${darkTheme.border}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: darkTheme.text,
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {formatPriceRange(restaurant.priceRange)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Content Section */}
                  <Box 
                    sx={{ 
                      flex: { xs: '1', md: '0 0 50%' },
                      display: 'flex',
                      flexDirection: 'column',
                      maxWidth: '100%',
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        p: { xs: 4, md: 8 },
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        textAlign: { xs: 'center', md: isEven ? 'left' : 'right' },
                        maxWidth: '100%',
                      }}
                    >
                      {/* Restaurant Number */}
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: darkTheme.textSecondary,
                          letterSpacing: '2px',
                          mb: 2,
                          display: 'block',
                          textTransform: 'uppercase',
                        }}
                      >
                        Restaurant {String(index + 1).padStart(2, '0')}
                      </Typography>
                      
                      {/* Restaurant Name */}
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
                          wordBreak: 'break-word',
                        }}
                      >
                        {restaurant.name}
                      </Typography>
                      
                      {/* Location */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 4,
                        justifyContent: { 
                          xs: 'center', 
                          md: isEven ? 'flex-start' : 'flex-end' 
                        },
                      }}>
                        <LocationOn sx={{ 
                          color: darkTheme.textSecondary,
                          mr: 1,
                          fontSize: 20,
                        }} />
                        <Typography 
                          sx={{ 
                            color: darkTheme.textSecondary,
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          }}
                        >
                          {restaurant.location || restaurant.businessUnit.displayName}
                        </Typography>
                      </Box>
                      
                      {/* Description */}
                      <Typography
                        sx={{
                          color: darkTheme.textSecondary,
                          fontSize: { xs: '1.1rem', md: '1.2rem' },
                          lineHeight: 1.6,
                          mb: 5,
                          fontWeight: 400,
                          maxWidth: '500px',
                          mx: { xs: 'auto', md: isEven ? '0' : 'auto' },
                          ml: { md: isEven ? '0' : 'auto' },
                        }}
                      >
                        {restaurant.shortDesc || (restaurant.description ? restaurant.description.substring(0, 200) + '...' : '')}
                      </Typography>
                      
                      {/* View Menu Button */}
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
                              boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)',
                            },
                          }}
                          href={`/restaurants/${restaurant.slug}`}
                          component="a"
                        >
                          View Menu
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
      <Container maxWidth="xl">
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: { xs: 4, md: 8 },
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
            Ready to experience
            <br />
            culinary excellence?
          </Typography>
          
          <Button
            component="a"
            href="/restaurants"
            sx={{
              backgroundColor: darkTheme.primary,
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
                backgroundColor: darkTheme.primaryHover,
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 24px rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            View All Restaurants
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Restaurants;