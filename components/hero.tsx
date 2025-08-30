'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { ArrowForward, Star, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroData, incrementHeroView, incrementHeroClick } from '../lib/actions/heroes';

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

interface HeroProps {
  heroesData?: HeroData[] | null;
}

const Hero: React.FC<HeroProps> = ({ heroesData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const defaultHero: Partial<HeroData> = {
    title: 'Experience Luxury Beyond Imagination',
    subtitle: 'Award-winning luxury hospitality since 1995',
    description: 'Discover our world-class hotels and resorts across breathtaking locations. Where every moment becomes an unforgettable memory.',
    backgroundImage: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    primaryButtonText: 'Explore Our Properties',
    primaryButtonUrl: '/properties',
    secondaryButtonText: 'View Special Offers',
    secondaryButtonUrl: '/offers',
    textAlignment: 'center',
    overlayOpacity: 0.4,
    textColor: darkTheme.text,
  };

  const heroes = heroesData && heroesData.length > 0 ? heroesData : [defaultHero];
  const currentHero = heroes[currentHeroIndex];

  // Auto-rotate heroes with smooth transitions
  useEffect(() => {
    if (heroes.length > 1) {
      const interval = setInterval(() => {
        setDirection(1);
        setCurrentHeroIndex((prev) => (prev + 1) % heroes.length);
      }, 6000); // Change hero every 6 seconds

      return () => clearInterval(interval);
    }
  }, [heroes.length]);

  // Track view for current hero
  useEffect(() => {
    if (currentHero && 'id' in currentHero && currentHero.id) {
      incrementHeroView(currentHero.id).catch(console.error);
    }
  }, [currentHero]);

  const handleButtonClick = async (url?: string | null) => {
    if (currentHero && 'id' in currentHero && currentHero.id) {
      try {
        await incrementHeroClick(currentHero.id);
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
    
    if (url) {
      window.location.href = url;
    }
  };

  const handlePrevHero = () => {
    setDirection(-1);
    setCurrentHeroIndex((prev) => (prev - 1 + heroes.length) % heroes.length);
  };

  const handleNextHero = () => {
    setDirection(1);
    setCurrentHeroIndex((prev) => (prev + 1) % heroes.length);
  };

  const handleIndicatorClick = (index: number) => {
    setDirection(index > currentHeroIndex ? 1 : -1);
    setCurrentHeroIndex(index);
  };


  const contentVariants = {
    enter: {
      y: 50,
      opacity: 0,
    },
    center: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -50,
      opacity: 0,
    },
  };

  const backgroundVariants = {
    enter: {
      scale: 1.1,
      opacity: 0,
    },
    center: {
      scale: 1,
      opacity: 1,
    },
    exit: {
      scale: 0.9,
      opacity: 0,
    },
  };

  const titleParts = currentHero.title?.split('\n') || ['Experience Luxury', 'Beyond Imagination'];
  
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: currentHero.displayType === 'banner' ? '60vh' : '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Container */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`background-${currentHeroIndex}`}
          custom={direction}
          variants={backgroundVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 1.2,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: currentHero.backgroundImage ? `url(${currentHero.backgroundImage})` : `url(${defaultHero.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: currentHero.overlayColor || `rgba(0, 0, 0, ${currentHero.overlayOpacity || 0.4})`,
              zIndex: 1,
            }}
          />

          {/* Background Video */}
          {currentHero.backgroundVideo && (
            <Box
              component="video"
              autoPlay
              muted
              loop
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
              }}
            >
              <source src={currentHero.backgroundVideo} type="video/mp4" />
            </Box>
          )}
          
          {/* Overlay Image */}
          {currentHero.overlayImage && (
            <Box
              component="img"
              src={currentHero.overlayImage}
              alt={currentHero.altText || currentHero.title || ''}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1,
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows for multiple heroes */}
      {heroes.length > 1 && (
        <>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <IconButton
              onClick={handlePrevHero}
              sx={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: darkTheme.text,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ArrowBackIos />
            </IconButton>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <IconButton
              onClick={handleNextHero}
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: darkTheme.text,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ArrowForwardIos />
            </IconButton>
          </motion.div>
        </>
      )}

      {/* Hero indicators for multiple heroes */}
      {heroes.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
            display: 'flex',
            gap: 12,
          }}
        >
          {heroes.map((_, index) => (
            <motion.div
              key={index}
              onClick={() => handleIndicatorClick(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentHeroIndex ? darkTheme.primary : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Animated Content Container */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 3,
          textAlign: currentHero.textAlignment || 'center',
          color: currentHero.textColor || darkTheme.text,
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`content-${currentHeroIndex}`}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.8,
              ease: [0.4, 0.0, 0.2, 1],
              delay: 0.2,
            }}
          >
            {currentHero.subtitle && (
              <Box sx={{ mb: 3 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    justifyContent={currentHero.textAlignment === 'left' ? 'flex-start' : currentHero.textAlignment === 'right' ? 'flex-end' : 'center'} 
                    alignItems="center" 
                    sx={{ mb: 2 }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      >
                        <Star sx={{ color: darkTheme.warning, fontSize: 24 }} />
                      </motion.div>
                    ))}
                  </Stack>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: darkTheme.textSecondary, 
                      mb: 3, 
                      textTransform: 'uppercase', 
                      fontWeight: 600, 
                      letterSpacing: 2 
                    }}
                  >
                    {currentHero.subtitle}
                  </Typography>
                </motion.div>
              </Box>
            )}

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 900,
                  mb: 3,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontSize: isMobile ? '3rem' : '4.5rem',
                  lineHeight: 1.1,
                  color: currentHero.textColor || darkTheme.text,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {titleParts[0]}
                {titleParts[1] && (
                  <>
                    <br />
                    <Box component="span" sx={{ color: darkTheme.primary }}>
                      {titleParts[1]}
                    </Box>
                  </>
                )}
              </Typography>
            </motion.div>

            {currentHero.description && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 5,
                    color: darkTheme.textSecondary,
                    maxWidth: 600,
                    mx: currentHero.textAlignment === 'center' ? 'auto' : 0,
                    lineHeight: 1.6,
                    fontSize: isMobile ? '1.25rem' : '1.5rem',
                    fontWeight: 400,
                  }}
                >
                  {currentHero.description}
                </Typography>
              </motion.div>
            )}

            {(currentHero.primaryButtonText || currentHero.secondaryButtonText) && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={3}
                  justifyContent={currentHero.textAlignment === 'left' ? 'flex-start' : currentHero.textAlignment === 'right' ? 'flex-end' : 'center'}
                  alignItems="center"
                >
                  {currentHero.primaryButtonText && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        variant={currentHero.primaryButtonStyle === 'outlined' ? 'outlined' : 'contained'}
                        size="large"
                        endIcon={<ArrowForward />}
                        onClick={() => handleButtonClick(currentHero.primaryButtonUrl)}
                        sx={{
                          px: 4,
                          py: 2.5,
                          fontSize: '1rem',
                          fontWeight: 700,
                          backgroundColor: currentHero.primaryButtonStyle === 'outlined' ? 'transparent' : darkTheme.primary,
                          color: currentHero.primaryButtonStyle === 'outlined' ? currentHero.textColor : darkTheme.text,
                          borderRadius: '8px',
                          border: currentHero.primaryButtonStyle === 'outlined' ? `2px solid ${currentHero.textColor || darkTheme.text}` : 'none',
                          borderColor: currentHero.primaryButtonStyle === 'outlined' ? currentHero.textColor || darkTheme.text : undefined,
                          boxShadow: currentHero.primaryButtonStyle === 'outlined' ? 'none' : `0 8px 24px ${darkTheme.selectedBg}`,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          minWidth: '200px',
                          '&:hover': {
                            backgroundColor: currentHero.primaryButtonStyle === 'outlined' ? `rgba(255, 255, 255, 0.1)` : darkTheme.primaryHover,
                            boxShadow: currentHero.primaryButtonStyle === 'outlined' ? 'none' : `0 12px 32px ${darkTheme.selectedBg}`,
                            borderColor: currentHero.primaryButtonStyle === 'outlined' ? darkTheme.primary : undefined,
                          },
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        {currentHero.primaryButtonText}
                      </Button>
                    </motion.div>
                  )}
                  
                  {currentHero.secondaryButtonText && (
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        variant={currentHero.secondaryButtonStyle === 'contained' ? 'contained' : 'outlined'}
                        size="large"
                        onClick={() => handleButtonClick(currentHero.secondaryButtonUrl)}
                        sx={{
                          px: 4,
                          py: 2.5,
                          fontSize: '1rem',
                          fontWeight: 700,
                          backgroundColor: currentHero.secondaryButtonStyle === 'contained' ? darkTheme.primary : 'transparent',
                          borderColor: currentHero.secondaryButtonStyle === 'contained' ? undefined : darkTheme.text,
                          color: currentHero.secondaryButtonStyle === 'contained' ? darkTheme.text : darkTheme.text,
                          borderRadius: '8px',
                          borderWidth: 2,
                          boxShadow: currentHero.secondaryButtonStyle === 'contained' ? `0 8px 24px ${darkTheme.selectedBg}` : 'none',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          minWidth: '200px',
                          '&:hover': {
                            backgroundColor: currentHero.secondaryButtonStyle === 'contained' ? darkTheme.primaryHover : `rgba(255, 255, 255, 0.1)`,
                            borderColor: currentHero.secondaryButtonStyle === 'contained' ? undefined : darkTheme.primary,
                            borderWidth: 2,
                            boxShadow: currentHero.secondaryButtonStyle === 'contained' ? `0 12px 32px ${darkTheme.selectedBg}` : 'none',
                          },
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        {currentHero.secondaryButtonText}
                      </Button>
                    </motion.div>
                  )}
                </Stack>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default Hero;