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
} from '@mui/material';
import { CalendarToday, LocationOn, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { EventData } from '@/lib/actions/events';

interface EventsProps {
  events: EventData[];
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
    scale: 1
  }
};

const Events: React.FC<EventsProps> = ({ events }) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | null): string => {
    if (!timeString) return '';
    // Assuming timeString is in format "HH:MM" or "HH:MM:SS"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getPrimaryImage = (images: EventData['images']) => {
    // Find primary image first, otherwise use first image, or fallback
    const primaryImage = images.find(img => img.isPrimary);
    const fallbackImage = images[0];
    const imageToUse = primaryImage || fallbackImage;
    
    return imageToUse?.image?.mediumUrl || 
           imageToUse?.image?.originalUrl || 
           '/images/events/default-event.jpg'; // Add a default fallback
  };

  const getEventTypeDisplay = (type: string): string => {
    const typeMap: Record<string, string> = {
      'WEDDING': 'Wedding',
      'CONFERENCE': 'Conference',
      'MEETING': 'Meeting',
      'WORKSHOP': 'Workshop',
      'CELEBRATION': 'Celebration',
      'CULTURAL': 'Cultural',
      'SEASONAL': 'Seasonal',
      'ENTERTAINMENT': 'Entertainment',
      'CORPORATE': 'Corporate',
      'PRIVATE': 'Private Event'
    };
    return typeMap[type] || type;
  };

  const formatPrice = (price: number | null, currency: string, isFree: boolean): string => {
    if (isFree) return 'Free';
    if (!price) return 'Contact for pricing';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  // Show message if no events
  if (!events || events.length === 0) {
    return (
      <Box 
        sx={{ 
          py: { xs: 8, md: 16 },
          backgroundColor: '#f8f9fa',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="xl">
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#111827',
              mb: 4,
              textTransform: 'uppercase',
            }}
          >
            No Upcoming Events
          </Typography>
          <Typography
            sx={{
              color: '#6b7280',
              fontSize: '1.125rem',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Check back soon for exciting upcoming events and experiences.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 16 },
        backgroundColor: '#f8f9fa',
        position: 'relative',
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Typography
            variant="overline"
            sx={{
              color: '#6b7280',
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: '0.875rem',
              mb: 2,
              display: 'block',
              textTransform: 'uppercase',
            }}
          >
            Exclusive Collection
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.75rem', md: '4rem', lg: '5rem' },
              lineHeight: { xs: 0.9, md: 0.85 },
              color: '#111827',
              mb: 4,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            UPCOMING EVENTS
          </Typography>
          <Typography
            sx={{
              color: '#6b7280',
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              lineHeight: 1.6,
              maxWidth: '600px',
              mx: 'auto',
              fontWeight: 400,
              mt: 3,
            }}
          >
            Join us for exclusive events and experiences across our premium properties.
            Create memories that last a lifetime.
          </Typography>
        </Box>
      </Container>

      {/* Events List - Full Width */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          width: '100%',
        }}
      >
        {events.map((event, index) => {
          const isEven = index % 2 === 0;
          const primaryImage = getPrimaryImage(event.images);
          
          return (
            <motion.div
              key={event.id}
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
                  backgroundColor: 'white',
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
                    '& .event-image': {
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
                      image={primaryImage}
                      alt={event.images[0]?.image?.altText || event.title}
                      className="event-image"
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
                    
                    {/* Date Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 24,
                        [isEven ? 'right' : 'left']: 24,
                        backgroundColor: 'white',
                        px: 3,
                        py: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        minWidth: '60px',
                        zIndex: 2,
                      }}
                    >
                      <Typography 
                        sx={{ 
                          fontWeight: 900,
                          color: '#111827',
                          fontSize: '1.5rem',
                          lineHeight: 1,
                          mb: 0.5,
                        }}
                      >
                        {event.startDate.getDate()}
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontWeight: 700,
                          color: '#6b7280',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          lineHeight: 1,
                        }}
                      >
                        {event.startDate.toLocaleDateString('en-US', { month: 'short' })}
                      </Typography>
                    </Box>

                    {/* Price Badge */}
                    {(event.isFree || event.ticketPrice) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 24,
                          [isEven ? 'right' : 'left']: 24,
                          backgroundColor: event.isFree ? '#10b981' : '#111827',
                          color: 'white',
                          px: 3,
                          py: 1.5,
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          zIndex: 2,
                        }}
                      >
                        {formatPrice(event.ticketPrice, event.currency, event.isFree)}
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
                      {/* Event Number & Business Unit */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                          }}
                        >
                          Event {String(index + 1).padStart(2, '0')}
                        </Typography>
                        {event.businessUnit && (
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#111827',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              mt: 0.5,
                            }}
                          >
                            {event.businessUnit.displayName}
                          </Typography>
                        )}
                      </Box>

                      {/* Event Title */}
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                          color: '#111827',
                          mb: 3,
                          letterSpacing: '-0.02em',
                          lineHeight: 0.9,
                          textTransform: 'uppercase',
                          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                          wordBreak: 'break-word',
                        }}
                      >
                        {event.title}
                      </Typography>

                      {/* Event Details */}
                      <Stack 
                        spacing={2} 
                        sx={{ 
                          mb: 4,
                          alignItems: { xs: 'center', md: isEven ? 'flex-start' : 'flex-end' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ 
                            color: '#6b7280', 
                            mr: 2, 
                            fontSize: 20 
                          }} />
                          <Typography 
                            sx={{ 
                              color: '#6b7280',
                              fontWeight: 600,
                              fontSize: '1rem',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                            }}
                          >
                            {formatDate(event.startDate)}
                            {event.startTime && ` • ${formatTime(event.startTime)}`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ 
                            color: '#6b7280', 
                            mr: 2, 
                            fontSize: 20 
                          }} />
                          <Typography 
                            sx={{ 
                              color: '#6b7280',
                              fontWeight: 600,
                              fontSize: '1rem',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                            }}
                          >
                            {event.venue}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Description */}
                      <Typography
                        sx={{
                          color: '#6b7280',
                          fontSize: { xs: '1.1rem', md: '1.2rem' },
                          lineHeight: 1.6,
                          mb: 5,
                          fontWeight: 400,
                          maxWidth: '500px',
                          mx: { xs: 'auto', md: isEven ? '0' : 'auto' },
                          ml: { md: isEven ? '0' : 'auto' },
                        }}
                      >
                        {event.shortDesc || event.description.substring(0, 200) + '...'}
                      </Typography>

                      {/* Event Type/Category */}
                      <Box sx={{ mb: 5 }}>
                        <Typography 
                          sx={{ 
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#111827',
                            mb: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                          }}
                        >
                          Event Details
                        </Typography>
                        <Stack 
                          direction="row" 
                          spacing={3} 
                          sx={{ 
                            flexWrap: 'wrap', 
                            gap: 2,
                            justifyContent: { 
                              xs: 'center', 
                              md: isEven ? 'flex-start' : 'flex-end' 
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.95rem',
                              color: '#6b7280',
                              fontWeight: 500,
                              position: 'relative',
                              '&::before': {
                                content: '"•"',
                                color: '#111827',
                                fontWeight: 700,
                                mr: 1,
                              }
                            }}
                          >
                            {getEventTypeDisplay(event.type)}
                          </Typography>
                          {event.maxAttendees && (
                            <Typography
                              sx={{
                                fontSize: '0.95rem',
                                color: '#6b7280',
                                fontWeight: 500,
                                position: 'relative',
                                '&::before': {
                                  content: '"•"',
                                  color: '#111827',
                                  fontWeight: 700,
                                  mr: 1,
                                }
                              }}
                            >
                              Max {event.maxAttendees} Attendees
                            </Typography>
                          )}
                          {event.requiresBooking && (
                            <Typography
                              sx={{
                                fontSize: '0.95rem',
                                color: '#6b7280',
                                fontWeight: 500,
                                position: 'relative',
                                '&::before': {
                                  content: '"•"',
                                  color: '#111827',
                                  fontWeight: 700,
                                  mr: 1,
                                }
                              }}
                            >
                              Booking Required
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Reserve Spot Button */}
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
                            backgroundColor: '#111827',
                            color: 'white',
                            px: 6,
                            py: 2.5,
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            borderRadius: 0,
                            minWidth: '200px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: '#1f2937',
                              transform: 'translateY(-3px)',
                              boxShadow: '0 12px 24px rgba(17, 24, 39, 0.3)',
                            },
                          }}
                          href={`/events/${event.slug}`} // Link to event detail page
                          component="a"
                        >
                          {event.requiresBooking ? 'Reserve Spot' : 'Learn More'}
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
              color: '#111827',
              mb: 4,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 0.9,
            }}
          >
            Don&apos;t miss out on
            <br />
            exclusive experiences
          </Typography>
          
          <Button
            component="a"
            href="/events"
            sx={{
              backgroundColor: '#111827',
              color: 'white',
              px: 10,
              py: 3.5,
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: 0,
              mt: 4,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#1f2937',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 24px rgba(17, 24, 39, 0.3)',
              },
            }}
          >
            View All Events
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Events;