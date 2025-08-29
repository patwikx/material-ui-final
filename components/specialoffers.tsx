'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { CalendarToday, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { SpecialOfferData } from '../lib/actions/special-offers';


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

interface SpecialOffersProps {
  offers: SpecialOfferData[];
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

const SpecialOffers: React.FC<SpecialOffersProps> = ({ offers }) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const calculateDiscount = (offer: SpecialOfferData): string => {
    if (offer.savingsPercent) {
      return `${offer.savingsPercent}% OFF`;
    }
    if (offer.savingsAmount && offer.originalPrice) {
      const percentage = Math.round((Number(offer.savingsAmount) / Number(offer.originalPrice)) * 100);
      return `${percentage}% OFF`;
    }
    return 'SPECIAL OFFER';
  };

  const getPrimaryImage = (offer: SpecialOfferData): string => {
    // Find primary image first
    const primaryImage = offer.images.find(img => img.isPrimary);
    if (primaryImage) {
      return primaryImage.image.originalUrl;
    }
    
    // Fallback to first image if no primary
    if (offer.images.length > 0) {
      return offer.images[0].image.originalUrl;
    }
    
    // Default fallback image
    return '/images/placeholder-offer.jpg';
  };

  const getImageAlt = (offer: SpecialOfferData): string => {
    const primaryImage = offer.images.find(img => img.isPrimary);
    if (primaryImage?.image.altText) {
      return primaryImage.image.altText;
    }
    if (primaryImage?.image.title) {
      return primaryImage.image.title;
    }
    return offer.title;
  };

  const generateTerms = (offer: SpecialOfferData): string[] => {
    const terms: string[] = [];
    
    terms.push(`Valid until ${formatDate(offer.validTo)}`);
    
    if (offer.businessUnit) {
      terms.push(`Available at ${offer.businessUnit.displayName}`);
    }
    
    if (offer.originalPrice && offer.offerPrice) {
      terms.push(`Original price ${offer.currency} ${Number(offer.originalPrice).toLocaleString()}`);
    }
    
    terms.push('Subject to availability');
    terms.push('Terms and conditions apply');
    
    return terms;
  };

  if (!offers || offers.length === 0) {
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
            No special offers available at the moment.
          </Typography>
          <Typography
            sx={{
              color: darkTheme.textSecondary,
              mt: 2,
            }}
          >
            Check back soon for exciting deals and packages!
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
            Limited Time Only
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
            SPECIAL OFFERS
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
            Take advantage of our exclusive deals and packages for an unforgettable luxury experience
            at unbeatable prices.
          </Typography>
        </Box>
      </Container>

      {/* Offers List - Full Width */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          width: '100%',
        }}
      >
        {offers.map((offer, index) => {
          const isEven = index % 2 === 0;
          const terms = generateTerms(offer);
          
          return (
            <motion.div
              key={offer.id}
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
                    '& .offer-image': {
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
                      image={getPrimaryImage(offer)}
                      alt={getImageAlt(offer)}
                      className="offer-image"
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
                    
                    {/* Discount Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 24,
                        [isEven ? 'right' : 'left']: 24,
                        backgroundColor: darkTheme.error,
                        color: 'white',
                        px: 4,
                        py: 2,
                        fontSize: '1.125rem',
                        fontWeight: 900,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        boxShadow: `0 4px 12px ${darkTheme.errorBg}`,
                        zIndex: 2,
                      }}
                    >
                      {calculateDiscount(offer)}
                    </Box>
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
                      {/* Offer Number */}
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
                        Offer {String(index + 1).padStart(2, '0')}
                      </Typography>

                      {/* Offer Title */}
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
                        {offer.title}
                      </Typography>

                      {/* Valid Until */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 4,
                        justifyContent: { 
                          xs: 'center', 
                          md: isEven ? 'flex-start' : 'flex-end' 
                        },
                      }}>
                        <CalendarToday sx={{ 
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
                          Valid until {formatDate(offer.validTo)}
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
                        {offer.shortDesc || offer.description}
                      </Typography>

                      {/* Price Information */}
                      {offer.originalPrice && (
                        <Box sx={{ mb: 4 }}>
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={2}
                            sx={{
                              justifyContent: { 
                                xs: 'center', 
                                md: isEven ? 'flex-start' : 'flex-end' 
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '1.5rem',
                                fontWeight: 900,
                                color: darkTheme.error,
                              }}
                            >
                              {offer.currency} {Number(offer.offerPrice).toLocaleString()}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                color: darkTheme.textSecondary,
                                textDecoration: 'line-through',
                              }}
                            >
                              {offer.currency} {Number(offer.originalPrice).toLocaleString()}
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      {/* Terms & Conditions */}
                      <Box sx={{ mb: 5 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: darkTheme.text,
                            mb: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                          }}
                        >
                          Terms & Conditions
                        </Typography>
                        <Stack 
                          spacing={1}
                          sx={{ 
                            alignItems: { 
                              xs: 'center', 
                              md: isEven ? 'flex-start' : 'flex-end' 
                            },
                          }}
                        >
                          {terms.slice(0, 2).map((term, termIndex) => (
                            <Typography
                              key={termIndex}
                              sx={{
                                fontSize: '0.95rem',
                                color: darkTheme.textSecondary,
                                fontWeight: 500,
                                position: 'relative',
                                maxWidth: '400px',
                                textAlign: { xs: 'center', md: isEven ? 'left' : 'right' },
                                '&::before': {
                                  content: '"•"',
                                  color: darkTheme.primary,
                                  fontWeight: 700,
                                  mr: 1,
                                }
                              }}
                            >
                              {term}
                            </Typography>
                          ))}
                          {terms.length > 2 && (
                            <Typography
                              sx={{
                                fontSize: '0.95rem',
                                color: darkTheme.textSecondary,
                                fontWeight: 500,
                                position: 'relative',
                                '&::before': {
                                  content: '"•"',
                                  color: darkTheme.primary,
                                  fontWeight: 700,
                                  mr: 1,
                                }
                              }}
                            >
                              +{terms.length - 2} more conditions apply
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Book Now Button */}
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
                              boxShadow: `0 12px 24px ${darkTheme.selectedBg}`,
                            },
                          }}
                          href={`/offers/${offer.slug}`}
                          component="a"
                        >
                          Book Now
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
            Limited time offers
            <br />
            won&apos;t last long
          </Typography>
          
          <Button
            component="a"
            href="/special-offers"
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
            View All Offers
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SpecialOffers;