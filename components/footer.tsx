'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  ArrowForward,
  Send,
  Star,
  Shield,
  CheckCircle,
  StarBorder,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerSections = {
    'Our Properties': [
      'Anchor Hotel Manila',
      'Dolores Farm Resort',
      'Dolores Lake Resort',
      'Dolores Tropicana Resort',
      'View All Properties',
    ],
    'Guest Services': [
      'Luxury Accommodation',
      'Fine Dining',
      'Event Planning',
      'Spa & Wellness',
      'Concierge Services',
    ],
    'Company': [
      'About Tropicana',
      'Leadership Team',
      'Careers',
      'Press Center',
      'Sustainability',
    ],
    'Resources': [
      'Contact Support',
      'FAQs',
      'Booking Guide',
      'Travel Blog',
      'Gift Cards',
    ],
  };

  const awards = [
    { icon: <StarBorder />, text: 'World Luxury Hotel Awards 2024' },
    { icon: <Star />, text: '5-Star Rating Certified' },
    { icon: <Shield />, text: 'Safe Travel Certified' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#111827',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Newsletter Section */}
      <Box
        sx={{
          backgroundColor: '#1f2937',
          py: { xs: 6, md: 8 },
          position: 'relative',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '3rem' },
                color: 'white',
                mb: 3,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 0.9,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Stay in the loop
            </Typography>
            <Typography
              sx={{
                color: '#9ca3af',
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                lineHeight: 1.6,
                mb: 6,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Get exclusive offers, luxury travel tips, and be the first to know
              about new property openings and special events.
            </Typography>

            {!subscribed ? (
              <Box
                component="form"
                onSubmit={handleNewsletterSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  maxWidth: '500px',
                  mx: 'auto',
                }}
              >
                <TextField
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 0,
                      height: 56,
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6b7280',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#111827',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      color: '#111827',
                      '&::placeholder': {
                        color: '#6b7280',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  endIcon={<Send sx={{ fontSize: 18 }} />}
                  sx={{
                    backgroundColor: 'white',
                    color: '#111827',
                    px: 6,
                    py: 2,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRadius: 0,
                    minWidth: { xs: '100%', sm: '180px' },
                    height: 56,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '2px solid #22c55e',
                  p: 3,
                  maxWidth: '400px',
                  mx: 'auto',
                }}
              >
                <CheckCircle sx={{ color: '#22c55e', fontSize: 28 }} />
                <Typography
                  sx={{
                    color: '#22c55e',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                  }}
                >
                  Successfully subscribed!
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Footer Content */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: { xs: 8, md: 10 },
              mb: { xs: 8, md: 12 },
            }}
          >
            {/* Company Info */}
            <Box sx={{ flex: { xs: '1', lg: '0 0 350px' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <HotelIcon sx={{ fontSize: 40, mr: 2, color: 'white' }} />
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: '1.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Tropicana Worldwide
                </Typography>
              </Box>
              
              <Typography
                sx={{
                  color: '#9ca3af',
                  fontSize: '1.1rem',
                  lineHeight: 1.7,
                  mb: 5,
                }}
              >
                Experience luxury hospitality at its finest across our premium properties.
                Creating unforgettable memories and exceptional experiences since 1995.
              </Typography>

              {/* Contact Info */}
              <Stack spacing={3} sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 3, fontSize: 20, color: '#6b7280' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      +1 (555) 123-4567
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      24/7 Reservations
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 3, fontSize: 20, color: '#6b7280' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      reservations@tropicana.com
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Customer Service
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 3, fontSize: 20, color: '#6b7280' }} />
                  <Box>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                      Global Headquarters
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Metro Manila, Philippines
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* Awards */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#6b7280',
                    mb: 3,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}
                >
                  Awards & Certifications
                </Typography>
                <Stack spacing={2}>
                  {awards.map((award, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ color: '#6b7280', mr: 2 }}>
                        {award.icon}
                      </Box>
                      <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        {award.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* Links Grid */}
            <Box
              sx={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: { xs: 6, md: 8 },
              }}
            >
              {Object.entries(footerSections).map(([category, links]) => (
                <Box key={category}>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#6b7280',
                      mb: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }}
                  >
                    {category}
                  </Typography>
                  <Stack spacing={2.5}>
                    {links.map((link, index) => (
                      <Link
                        key={link}
                        href="#"
                        sx={{
                          color: index === links.length - 1 ? 'white' : '#9ca3af',
                          textDecoration: 'none',
                          fontSize: '0.95rem',
                          fontWeight: index === links.length - 1 ? 600 : 400,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          '&:hover': {
                            color: 'white',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        {link}
                        {index === links.length - 1 && (
                          <ArrowForward sx={{ ml: 1, fontSize: 16 }} />
                        )}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 6 }} />

          {/* Bottom Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 4,
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                sx={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  mb: 2,
                }}
              >
                © {currentYear} Tropicana Worldwide Corporation. All rights reserved.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
              >
                <Link
                  href="#"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Terms of Service
                </Link>
                <Link
                  href="#"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Cookie Policy
                </Link>
              </Stack>
            </Box>

            {/* Social Media */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  mb: 3,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                Follow Us
              </Typography>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                {[
                  { icon: <Facebook />, label: 'Facebook', color: '#1877f2' },
                  { icon: <Twitter />, label: 'Twitter', color: '#1da1f2' },
                  { icon: <Instagram />, label: 'Instagram', color: '#e4405f' },
                  { icon: <LinkedIn />, label: 'LinkedIn', color: '#0077b5' },
                  { icon: <YouTube />, label: 'YouTube', color: '#ff0000' },
                ].map((social) => (
                  <IconButton
                    key={social.label}
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#9ca3af',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: social.color,
                        borderColor: social.color,
                        color: 'white',
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 16px ${social.color}40`,
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;