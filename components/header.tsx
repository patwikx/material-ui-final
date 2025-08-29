'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  Fade,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowForward,
} from '@mui/icons-material';
import Image from 'next/image';
import { BusinessUnitData } from '@/lib/actions/business-units';

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

// New interface for website configuration data
interface WebsiteConfigData {
  siteName: string;
  logo: string | null;
  primaryPhone: string | null;
  primaryEmail: string | null;
}

// Header now accepts both business units and website config as props
interface HeaderProps {
  businessUnits: BusinessUnitData[];
  websiteConfig: WebsiteConfigData | null;
}

const Header: React.FC<HeaderProps> = ({ businessUnits, websiteConfig }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const dropdownRef = useRef<HTMLDivElement>(null);
  const propertiesButtonRef = useRef<HTMLButtonElement>(null);

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        propertiesButtonRef.current &&
        !propertiesButtonRef.current.contains(event.target as Node)
      ) {
        setPropertiesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, propertiesButtonRef]);

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handlePropertiesToggle = () => {
    setPropertiesDropdownOpen(!propertiesDropdownOpen);
  };

  const handlePropertyClick = (slug: string) => {
    window.location.href = `/properties/${slug}`;
  };

  const handleViewAllProperties = () => {
    window.location.href = '/properties';
  };

  const navigationItems = [
    { name: 'Properties', href: '/properties' },
    { name: 'Restaurants', href: '/restaurants' },
    { name: 'Events', href: '/events' },
    { name: 'Offers', href: '/special-offers' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const formatLocation = (businessUnit: BusinessUnitData): string => {
    const parts = [businessUnit.city, businessUnit.state, businessUnit.country]
      .filter(part => part)
      .filter(Boolean);
    return parts.join(', ');
  };

  const drawerContent = (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: darkTheme.background,
        color: darkTheme.text,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 3,
        }}
      >
        <IconButton
          onClick={handleMobileDrawerToggle}
          sx={{
            color: darkTheme.text,
            backgroundColor: darkTheme.surfaceHover,
            '&:hover': {
              backgroundColor: darkTheme.primary,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Image 
            src={websiteConfig?.logo || "https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx"} 
            height={60} 
            width={60} 
            alt={websiteConfig?.siteName || "TWC Logo"} 
            className='mr-4' 
            style={{ filter: 'invert(1)' }}
          />
          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                // FIX: Reduced font size to 3/4
                fontSize: { xs: '1.05rem', md: '1.35rem' },
                color: darkTheme.text,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 0.9,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {websiteConfig?.siteName || "Tropicana"}
            </Typography>
          </Box>
        </Box>
        <Typography
          sx={{
            color: darkTheme.textSecondary,
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Premium Hospitality
        </Typography>
      </Box>

      <Box sx={{ flex: 1, px: 4 }}>
        {navigationItems.map((item, index) => (
          <Box key={item.name}>
            <Button
              onClick={handleMobileDrawerToggle}
              href={item.href}
              sx={{
                width: '100%',
                textAlign: 'left',
                justifyContent: 'flex-start',
                py: 3,
                px: 0,
                color: darkTheme.text,
                fontSize: '2rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: darkTheme.primary,
                  transform: 'translateX(20px)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: darkTheme.textSecondary,
                  mr: 3,
                  minWidth: '40px',
                  textAlign: 'right',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </Typography>
              {item.name}
            </Button>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 4 }}>
        <Button
          endIcon={<ArrowForward />}
          onClick={handleMobileDrawerToggle}
          href="/reservations"
          sx={{
            width: '100%',
            backgroundColor: darkTheme.primary,
            color: darkTheme.text,
            py: 3,
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: darkTheme.primaryHover,
              transform: 'translateY(-3px)',
              boxShadow: `0 12px 24px ${darkTheme.selectedBg}`,
            },
          }}
        >
          Book Your Experience
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: darkTheme.background,
          transition: 'box-shadow 0.3s ease',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Container maxWidth="xl" sx={{ backgroundColor: darkTheme.background }}>
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              py: 2,
              minHeight: '70px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Image 
                src={websiteConfig?.logo || "https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx"} 
                height={60} 
                width={60} 
                alt={websiteConfig?.siteName || "TWC Logo"} 
                className='mr-4' 
                style={{ filter: 'invert(1)' }}
              />
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    // FIX: Reduced font size to 3/4
                    fontSize: { xs: '1.05rem', md: '1.35rem' },
                    color: darkTheme.text,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    lineHeight: 0.9,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {websiteConfig?.siteName || "Tropicana"}
                </Typography>
              </Box>
            </Box>

            {isMobile ? (
              <IconButton
                onClick={handleMobileDrawerToggle}
                sx={{
                  color: darkTheme.text,
                  backgroundColor: darkTheme.surfaceHover,
                  p: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: darkTheme.primary,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <MenuIcon sx={{ fontSize: 24 }} />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Button
                    ref={propertiesButtonRef}
                    onClick={handlePropertiesToggle}
                    sx={{
                      color: darkTheme.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      px: 3,
                      py: 2,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: darkTheme.text,
                        backgroundColor: 'transparent',
                        transform: 'translateY(-2px)',
                        '&::after': {
                          width: '100%',
                          opacity: 1,
                        },
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: '2px',
                        backgroundColor: darkTheme.text,
                        transition: 'all 0.3s ease',
                        opacity: 0,
                      },
                    }}
                  >
                    Properties
                  </Button>
                  {/* Dropdown for Properties */}
                  <Fade in={propertiesDropdownOpen} timeout={300}>
                    <Paper
                      ref={dropdownRef}
                      sx={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        mt: 1,
                        width: '800px',
                        backgroundColor: darkTheme.surface,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        zIndex: 1300,
                        border: `1px solid ${darkTheme.border}`,
                        opacity: propertiesDropdownOpen ? 1 : 0,
                        visibility: propertiesDropdownOpen ? 'visible' : 'hidden',
                      }}
                    >
                      <Box sx={{ p: 4 }}>
                        <Box sx={{ mb: 4 }}>
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: darkTheme.textSecondary,
                              textTransform: 'uppercase',
                              letterSpacing: '2px',
                              mb: 1,
                            }}
                          >
                            Our Properties
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: '1.8rem',
                              color: darkTheme.text,
                              textTransform: 'uppercase',
                              letterSpacing: '-0.02em',
                              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                            }}
                          >
                            Premium Hotels & Resorts
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 3,
                          }}
                        >
                          {businessUnits.map((property) => (
                            <Box
                              key={property.id}
                              onClick={() => handlePropertyClick(property.slug)}
                              sx={{
                                width: 'calc(50% - 12px)',
                                cursor: 'pointer',
                                p: 2,
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: darkTheme.surfaceHover,
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 12px ${darkTheme.selectedBg}`,
                                  '& .property-name': {
                                    color: darkTheme.text,
                                  },
                                  '& .property-location': {
                                    color: darkTheme.textSecondary,
                                  },
                                },
                              }}
                            >
                              <Typography
                                className="property-name"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  color: darkTheme.textSecondary,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  mb: 1,
                                  transition: 'color 0.3s ease',
                                }}
                              >
                                {property.displayName}
                              </Typography>
                              <Typography
                                className="property-location"
                                sx={{
                                  fontSize: '0.875rem',
                                  color: darkTheme.textSecondary,
                                  fontWeight: 500,
                                  transition: 'color 0.3s ease',
                                }}
                              >
                                {formatLocation(property)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                          <Button
                            onClick={handleViewAllProperties}
                            sx={{
                              backgroundColor: darkTheme.primary,
                              color: darkTheme.text,
                              px: 6,
                              py: 2,
                              fontSize: '1rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: darkTheme.primaryHover,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 16px ${darkTheme.selectedBg}`,
                              },
                            }}
                          >
                            View All Properties
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Fade>
                </Box>
                <Button
                  href="/restaurants"
                  sx={{
                    color: darkTheme.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    px: 3,
                    py: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: darkTheme.text,
                      backgroundColor: 'transparent',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        width: '100%',
                        opacity: 1,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: darkTheme.text,
                      transition: 'all 0.3s ease',
                      opacity: 0,
                    },
                  }}
                >
                  Restaurants
                </Button>
                <Button
                  href="/events"
                  sx={{
                    color: darkTheme.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    px: 3,
                    py: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: darkTheme.text,
                      backgroundColor: 'transparent',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        width: '100%',
                        opacity: 1,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: darkTheme.text,
                      transition: 'all 0.3s ease',
                      opacity: 0,
                    },
                  }}
                >
                  Events
                </Button>
                <Button
                  href="/special-offers"
                  sx={{
                    color: darkTheme.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    px: 3,
                    py: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: darkTheme.text,
                      backgroundColor: 'transparent',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        width: '100%',
                        opacity: 1,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: darkTheme.text,
                      transition: 'all 0.3s ease',
                      opacity: 0,
                    },
                  }}
                >
                  Offers
                </Button>
                <Button
                  href="/about"
                  sx={{
                    color: darkTheme.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    px: 3,
                    py: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: darkTheme.text,
                      backgroundColor: 'transparent',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        width: '100%',
                        opacity: 1,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: darkTheme.text,
                      transition: 'all 0.3s ease',
                      opacity: 0,
                    },
                  }}
                >
                  About
                </Button>
                <Button
                  href="/contact"
                  sx={{
                    color: darkTheme.textSecondary,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    px: 3,
                    py: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: darkTheme.text,
                      backgroundColor: 'transparent',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        width: '100%',
                        opacity: 1,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: '2px',
                      backgroundColor: darkTheme.text,
                      transition: 'all 0.3s ease',
                      opacity: 0,
                    },
                  }}
                >
                  Contact
                </Button>
                
                <Button
                  endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                  sx={{
                    backgroundColor: darkTheme.primary,
                    color: darkTheme.text,
                    px: 6,
                    py: 2,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    minWidth: '140px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: darkTheme.primaryHover,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${darkTheme.selectedBg}`,
                    },
                  }}
                >
                  Book Now
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="top"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;
