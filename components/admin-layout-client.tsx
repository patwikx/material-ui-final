'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Settings,
  ExitToApp,
  Home,
  NavigateNext,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import { BusinessUnitItem } from '../types/business-unit-types';


interface AdminLayoutProps {
  children: React.ReactNode;
  totalReservationsBadge: number;
  checkInsBadge: number;
  checkOutsBadge: number;
  // New props for business unit logic
  businessUnitId: string;
  businessUnits: BusinessUnitItem[];
  isAdmin: boolean;
  userRole: string;
}

// Use the new, wider dimensions for the sidebar
const DRAWER_WIDTH = 350;
const COLLAPSED_WIDTH = 80;

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const AdminLayoutClient: React.FC<AdminLayoutProps> = ({
  children,
  totalReservationsBadge,
  checkInsBadge,
  checkOutsBadge,
  businessUnitId,
  businessUnits,
  isAdmin,
  userRole,
}) => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 2) { // Skip 'admin' and businessUnitId
      setActiveSection(pathSegments[2]);
    } else {
      setActiveSection('dashboard');
    }
  }, [pathname]);

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Admin', href: `/admin/${businessUnitId}`, icon: <Home sx={{ fontSize: 16 }} /> }
    ];

    // Skip the business unit ID in the URL path for breadcrumbs
    for (let i = 2; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const href = '/' + pathSegments.slice(0, i + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({ label, href });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const currentBusinessUnit = businessUnits.find(unit => unit.id === businessUnitId);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    router.push('/auth/sign-out');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

    <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        totalReservationsBadge={totalReservationsBadge}
        checkInsBadge={checkInsBadge}
        checkOutsBadge={checkOutsBadge}
        businessUnitId={businessUnitId}
        businessUnits={businessUnits}
        isAdmin={isAdmin}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 0,
          width: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
              {/* Top App Bar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px)`,
            ml: `${sidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              py: 1,
            }}
          >
            {/* Breadcrumbs */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Business Unit Name */}
              {currentBusinessUnit && (
                <Box sx={{ mr: 3 }}>
                  <Typography
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#111827',
                      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {currentBusinessUnit.name}
                  </Typography>
                  {isAdmin && (
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        fontWeight: 500,
                      }}
                    >
                      Super Admin
                    </Typography>
                  )}
                </Box>
              )}
              
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" sx={{ color: '#6b7280' }} />}
                sx={{
                  '& .MuiBreadcrumbs-ol': {
                    alignItems: 'center',
                  },
                }}
              >
                {breadcrumbs.map((crumb, index) => (
                  <Link
                    key={crumb.href}
                    href={crumb.href}
                    underline="hover"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: index === breadcrumbs.length - 1 ? '#111827' : '#6b7280',
                      fontSize: '0.875rem',
                      fontWeight: index === breadcrumbs.length - 1 ? 600 : 500,
                      textDecoration: 'none',
                      '&:hover': {
                        color: '#111827',
                      },
                    }}
                  >
                    {crumb.icon}
                    {crumb.label}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  onClick={handleNotificationsOpen}
                  sx={{
                    color: '#6b7280',
                    '&:hover': {
                      backgroundColor: alpha('#111827', 0.05),
                    },
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Settings */}
              <Tooltip title="Settings">
                <IconButton
                  sx={{
                    color: '#6b7280',
                    '&:hover': {
                      backgroundColor: alpha('#111827', 0.05),
                    },
                  }}
                  onClick={() => router.push(`/admin/${businessUnitId}/settings`)}
                >
                  <Settings />
                </IconButton>
              </Tooltip>

              {/* User Menu */}
              <Tooltip title="Account">
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{
                    ml: 1,
                    '&:hover': {
                      backgroundColor: alpha('#111827', 0.05),
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: '#111827',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    JD
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            pt: 1, // Account for AppBar height
            p: 10,
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            marginTop: '64px', // Add margin-top to avoid content hiding behind fixed AppBar
          }}
        >
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#111827',
            }}
          >
            John Doe
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#6b7280',
            }}
          >
            admin@tropicana.com
          </Typography>
        </Box>

        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            router.push('/admin/profile');
          }}
          sx={{
            py: 1.5,
            fontSize: '0.875rem',
          }}
        >
          <AccountCircle sx={{ mr: 2, fontSize: 20 }} />
          Profile Settings
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            router.push('/admin/preferences');
          }}
          sx={{
            py: 1.5,
            fontSize: '0.875rem',
          }}
        >
          <Settings sx={{ mr: 2, fontSize: 20 }} />
          Preferences
        </MenuItem>

        <Box sx={{ borderTop: '1px solid #e5e7eb' }}>
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              fontSize: '0.875rem',
              color: '#dc2626',
              '&:hover': {
                backgroundColor: alpha('#dc2626', 0.05),
              },
            }}
          >
            <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
            Sign Out
          </MenuItem>
        </Box>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb' }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#111827',
            }}
          >
            Notifications
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
          <MenuItem sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
                New reservation received
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.5 }}>
                John Smith booked Deluxe Suite for 3 nights
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', mt: 0.5 }}>
                2 minutes ago
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem sx={{ py: 2, borderBottom: '1px solid #f3f4f6' }}>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
                Payment received
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.5 }}>
                ₱15,000 payment confirmed for booking #TR001234
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', mt: 0.5 }}>
                5 minutes ago
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem sx={{ py: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
                Maintenance request
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.5 }}>
                Room 301 - Air conditioning issue reported
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af', mt: 0.5 }}>
                10 minutes ago
              </Typography>
            </Box>
          </MenuItem>
        </Box>

        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <Link
            href="/admin/notifications"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#111827',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={handleNotificationsClose}
          >
            View all notifications
          </Link>
        </Box>
      </Menu>
    </Box>
  );
};

export default AdminLayoutClient;