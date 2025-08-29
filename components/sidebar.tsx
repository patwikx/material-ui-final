'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Badge,
  IconButton,
  alpha,
  SvgIcon,
} from '@mui/material';
import {
  Dashboard,
  Hotel,
  People,
  Person,
  Bed,
  EventSeat,
  Payment,
  Receipt,
  LocalOffer,
  Restaurant,
  RateReview,
  Settings,
  Security,
  Analytics,
  Notifications,
  ContactMail,
  Email,
  Help,
  Assignment,
  CleaningServices,
  Build,
  FeedbackOutlined,
  BusinessCenter,
  AccountBalance,
  CreditCard,
  MonetizationOn,
  TrendingUp,
  Groups,
  PersonAdd,
  BookOnline,
  CheckCircle,
  Schedule,
  RoomService,
  HomeWork,
  Category,
  Inventory,
  CampaignOutlined,
  LocalDining,
  CalendarMonth,
  Star,
  QuestionAnswer,
  Web,
  PublicOutlined,
  SearchOutlined,
  AnnouncementOutlined,
  KeyboardArrowLeft,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { BusinessUnitItem } from '../types/business-unit-types';
import BusinessUnitSwitcher from './business-unit-swticher';
 // Import your BusinessUnitSwitcher

const DRAWER_WIDTH = 350;
const COLLAPSED_WIDTH = 80;

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  // Badge counts
  totalReservationsBadge: number;
  checkInsBadge: number;
  checkOutsBadge: number;
  // Business unit props
  businessUnitId: string;
  businessUnits: BusinessUnitItem[];
  isAdmin: boolean;
  userRole: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: typeof SvgIcon;
  badge?: number;
  children?: MenuItem[];
  path?: string;
  requiredRoles?: string[]; // Roles that can access this menu item
  adminOnly?: boolean; // Only super admins can access
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  requiredRoles?: string[];
  adminOnly?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  activeSection = 'dashboard',
  onSectionChange,
  totalReservationsBadge,
  checkInsBadge,
  checkOutsBadge,
  businessUnitId,
  businessUnits,
  isAdmin,
  userRole,
}) => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([])
  );

  const toggleExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Check if user has required role or is admin
  const hasPermission = (item: MenuItem): boolean => {
    if (item.adminOnly && !isAdmin) return false;
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    return isAdmin || item.requiredRoles.includes(userRole);
  };

  const hasSectionPermission = (section: MenuSection): boolean => {
    if (section.adminOnly && !isAdmin) return false;
    if (!section.requiredRoles || section.requiredRoles.length === 0) return true;
    return isAdmin || section.requiredRoles.includes(userRole);
  };

  // Menu sections with role-based access
  const menuSections: MenuSection[] = [
    {
      id: 'overview',
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Dashboard,
          path: `/admin/${businessUnitId}`
        },
      ]
    },
    {
      id: 'operations',
      title: 'OPERATIONS',
      items: [
        {
          id: 'properties',
          label: 'Properties & Rooms',
          icon: Hotel,
          requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'FRONT_DESK'],
          children: [
            { id: 'business-units', label: 'Business Units', icon: BusinessCenter, path: `/admin/${businessUnitId}/operations/properties`, adminOnly: true },
            { id: 'room-types', label: 'Room Types', icon: Category, path: `/admin/${businessUnitId}/operations/room-types`, requiredRoles: ['SUPER_ADMIN', 'MANAGER'] },
            { id: 'rooms', label: 'Rooms', icon: Bed, path: `/admin/${businessUnitId}/operations/rooms`, requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'FRONT_DESK'] },
            { id: 'amenities', label: 'Amenities', icon: EventSeat, path: `/admin/${businessUnitId}/operations/amenities`, requiredRoles: ['SUPER_ADMIN', 'MANAGER'] },
          ]
        },
        {
          id: 'reservations',
          label: 'Reservations',
          icon: BookOnline,
          badge: totalReservationsBadge,
          requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'FRONT_DESK'],
          children: [
            { id: 'reservation-list', label: 'All Reservations', icon: Assignment, path: `/admin/${businessUnitId}/operations/reservations` },
            { id: 'check-ins', label: 'Check-ins Today', icon: CheckCircle, badge: checkInsBadge, path: `/admin/${businessUnitId}/operations/check-ins` },
            { id: 'check-outs', label: 'Check-outs Today', icon: Schedule, badge: checkOutsBadge, path: `/admin/${businessUnitId}/operations/check-outs` },
            { id: 'stays', label: 'Current Stays', icon: HomeWork, path: `/admin/${businessUnitId}/operations/stays` },
          ]
        },
        {
          id: 'guests',
          label: 'Guest Management',
          icon: People,
          requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'FRONT_DESK'],
          children: [
            { id: 'guest-list', label: 'Guest Directory', icon: Person, path: `/admin/${businessUnitId}/operations/guests` },
            { id: 'guest-interactions', label: 'Guest Interactions', icon: RateReview, path: `/admin/${businessUnitId}/operations/guest-interactions` },
          ]
        },
        {
          id: 'payments',
          label: 'Payments & Billing',
          icon: Payment,
          requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'FRONT_DESK'],
          children: [
            { id: 'payments-list', label: 'All Payments', icon: CreditCard, path: `/admin/${businessUnitId}/operations/payments` },
            { id: 'payment-summaries', label: 'Payment Analytics', icon: TrendingUp, path: `/admin/${businessUnitId}/operations/payment-analytics`, requiredRoles: ['SUPER_ADMIN', 'MANAGER'] },
            { id: 'incidental-charges', label: 'Incidental Charges', icon: Receipt, path: `/admin/${businessUnitId}/operations/incidental-charges` },
            { id: 'paymongo-integration', label: 'PayMongo Integration', icon: AccountBalance, path: `/admin/${businessUnitId}/operations/paymongo`, requiredRoles: ['SUPER_ADMIN', 'MANAGER'] },
            { id: 'charges-folios', label: 'Charges & Folios', icon: MonetizationOn, path: `/admin/${businessUnitId}/operations/charges` },
          ]
        },
        {
          id: 'operations-hotel',
          label: 'Hotel Operations',
          icon: RoomService,
          requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'HOUSEKEEPING', 'MAINTENANCE'],
          children: [
            { id: 'service-requests', label: 'Service Requests', icon: Assignment, badge: 3, path: `/admin/${businessUnitId}/operations/service-requests` },
            { id: 'tasks', label: 'Tasks & Assignments', icon: Assignment, path: `/admin/${businessUnitId}/operations/tasks` },
            { id: 'housekeeping', label: 'Housekeeping', icon: CleaningServices, path: `/admin/${businessUnitId}/operations/housekeeping`, requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'HOUSEKEEPING'] },
            { id: 'maintenance', label: 'Maintenance', icon: Build, path: `/admin/${businessUnitId}/operations/maintenance`, requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'MAINTENANCE'] },
            { id: 'departments', label: 'Departments', icon: Groups, path: `/admin/${businessUnitId}/operations/departments`, requiredRoles: ['SUPER_ADMIN', 'MANAGER'] },
          ]
        },
        {
          id: 'dining',
          label: 'Restaurants & Dining',
          icon: Restaurant,
          requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'RESTAURANT'],
          children: [
            { id: 'restaurants', label: 'Restaurants', icon: LocalDining, path: `/admin/${businessUnitId}/operations/restaurants` },
            { id: 'menu-management', label: 'Menu Management', icon: Inventory, path: `/admin/${businessUnitId}/operations/menus` },
            { id: 'restaurant-reservations', label: 'Dining Reservations', icon: EventSeat, path: `/admin/${businessUnitId}/operations/dining-reservations` },
          ]
        },
      ]
    },
    {
      id: 'content',
      title: 'CONTENT & MARKETING',
      requiredRoles: ['SUPER_ADMIN', 'MANAGER', 'MARKETING'],
      items: [
        {
          id: 'marketing',
          label: 'Marketing & Offers',
          icon: LocalOffer,
          children: [
            { id: 'event-bookings', label: 'Event Bookings', icon: BookOnline, path: `/admin/${businessUnitId}/event-bookings` },
            { id: 'promos-vouchers', label: 'Promos & Vouchers', icon: CampaignOutlined, path: `/admin/${businessUnitId}/promos` },
          ]
        },
        {
          id: 'cms',
          label: 'Content Management',
          icon: Web,
          children: [
            { id: 'heroes', label: 'Hero Sections', icon: PublicOutlined, path: `/admin/${businessUnitId}/cms/hero` },
            { id: 'special-offers', label: 'Special Offers', icon: LocalOffer, path: `/admin/${businessUnitId}/cms/special-offers` },
            { id: 'events-list', label: 'Events', icon: CalendarMonth, path: `/admin/${businessUnitId}/cms/events` },
            { id: 'testimonials', label: 'Testimonials', icon: Star, path: `/admin/${businessUnitId}/cms/testimonials` },
            { id: 'faqs', label: 'FAQs', icon: QuestionAnswer, path: `/admin/${businessUnitId}/cms/faqs` },
            { id: 'seo-settings', label: 'SEO Settings', icon: SearchOutlined, path: `/admin/${businessUnitId}/cms/seo` },
          ]
        },
        {
          id: 'communications',
          label: 'Communications',
          icon: ContactMail,
          children: [
            { id: 'contact-forms', label: 'Contact Forms', icon: ContactMail, badge: 2, path: `/admin/${businessUnitId}/contact-forms` },
            { id: 'newsletter', label: 'Newsletter', icon: Email, path: `/admin/${businessUnitId}/newsletter` },
            { id: 'notifications', label: 'Notifications', icon: Notifications, path: `/admin/${businessUnitId}/notifications` },
            { id: 'email-templates', label: 'Email Templates', icon: Email, path: `/admin/${businessUnitId}/email-templates` },
            { id: 'announcements', label: 'Announcements', icon: AnnouncementOutlined, path: `/admin/${businessUnitId}/announcements` },
          ]
        },
      ]
    },
    {
      id: 'management',
      title: 'MANAGEMENT',
      requiredRoles: ['SUPER_ADMIN', 'MANAGER'],
      items: [
        {
          id: 'user-management',
          label: 'User Management',
          icon: People,
          children: [
            { id: 'users', label: 'Users', icon: Person, path: `/admin/${businessUnitId}/users` },
            { id: 'roles-permissions', label: 'Roles & Permissions', icon: Security, path: `/admin/${businessUnitId}/roles`, adminOnly: true },
            { id: 'user-sessions', label: 'User Sessions', icon: PersonAdd, path: `/admin/${businessUnitId}/sessions` },
          ]
        },
        {
          id: 'analytics',
          label: 'Analytics & Reports',
          icon: Analytics,
          children: [
            { id: 'page-analytics', label: 'Page Analytics', icon: TrendingUp, path: `/admin/${businessUnitId}/page-analytics` },
            { id: 'search-analytics', label: 'Search Analytics', icon: SearchOutlined, path: `/admin/${businessUnitId}/search-analytics` },
            { id: 'feedback', label: 'User Feedback', icon: FeedbackOutlined, path: `/admin/${businessUnitId}/feedback` },
          ]
        },
        {
          id: 'system',
          label: 'System Settings',
          icon: Settings,
          children: [
            { id: 'website-config', label: 'Website Configuration', icon: Settings, path: `/admin/${businessUnitId}/website-config`, requiredRoles: ['SUPER_ADMIN', 'MANAGER'] },
            { id: 'system-settings', label: 'System Settings', icon: Settings, path: `/admin/${businessUnitId}/system-settings`, adminOnly: true },
            { id: 'audit-logs', label: 'Audit Logs', icon: Assignment, path: `/admin/${businessUnitId}/audit-logs` },
            { id: 'help-support', label: 'Help & Support', icon: Help, path: `/admin/${businessUnitId}/help` },
          ]
        },
      ]
    },
  ];

  const handleNavigation = (path: string, itemId: string) => {
    onSectionChange?.(itemId);
    router.push(path);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    // Check if user has permission to see this item
    if (!hasPermission(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    const handleClick = () => {
      if (hasChildren) {
        toggleExpanded(item.id);
      } else if (item.path) {
        handleNavigation(item.path, item.id);
      } else {
        onSectionChange?.(item.id);
      }
    };

    // Filter children based on permissions
    const visibleChildren = hasChildren ? item.children?.filter(child => hasPermission(child)) : [];
    const hasVisibleChildren = visibleChildren && visibleChildren.length > 0;

    // Don't render if no visible children
    if (hasChildren && !hasVisibleChildren) {
      return null;
    }

    return (
      <Box key={item.id}>
        <ListItem
          disablePadding
          sx={{
            pl: open ? level * 2 : 0,
            mb: 0.3,
          }}
        >
          <ListItemButton
            onClick={handleClick}
            sx={{
              borderRadius: '12px',
              mx: open ? 1.5 : 'auto',
              minHeight: 44,
              justifyContent: open ? 'initial' : 'center',
              backgroundColor: isActive ? '#e8f5e8' : 'transparent',
              '&:hover': {
                backgroundColor: isActive ? '#e8f5e8' : alpha('#000', 0.04),
              },
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: open ? 36 : 'auto',
                color: isActive ? '#4ade80' : '#64748b',
                justifyContent: 'center',
                transition: 'color 0.2s ease',
              }}
            >
              <Badge
                badgeContent={item.badge}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    minWidth: '16px',
                    height: '16px',
                    fontWeight: 600,
                  }
                }}
              >
                <Icon fontSize="small" />
              </Badge>
            </ListItemIcon>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  style={{ flex: 1 }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.875rem',
                        color: isActive ? '#4ade80' : '#374151',
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {hasVisibleChildren && open && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <KeyboardArrowLeft
                  sx={{
                    fontSize: '1.1rem',
                    color: '#94a3b8'
                  }}
                />
              </motion.div>
            )}
          </ListItemButton>
        </ListItem>

        {hasVisibleChildren && (
          <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {visibleChildren?.map((childItem) => renderMenuItem(childItem, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const renderMenuSection = (section: MenuSection) => {
    // Check if user has permission to see this section
    if (!hasSectionPermission(section)) {
      return null;
    }

    // Filter items based on permissions
    const visibleItems = section.items.filter(item => hasPermission(item));
    
    // Don't render section if no visible items
    if (visibleItems.length === 0) {
      return null;
    }

    return (
      <Box key={section.id} sx={{ mb: 3 }}>
        {open && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#9ca3af',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              px: 3,
              mb: 1.5,
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {section.title}
          </Typography>
        )}

        <List component="div" disablePadding>
          {visibleItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>
    );
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: 72,
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1 }}
            >
              <div className='flex'>
                <Image src="https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx" height={32} width={32} alt="Dolores Hotels Logo" />
                <span className='text-md font-black sans-serf ml-4 mt-1'>Dolores Hotels</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <IconButton
          onClick={onToggle}
          sx={{
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: alpha('#000', 0.04),
            },
            transition: 'all 0.2s ease',
            width: 32,
            height: 32,
          }}
        >
          <KeyboardArrowLeft
            sx={{
              fontSize: 20,
              color: '#64748b',
              transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </IconButton>
      </Box>

      {/* Business Unit Switcher */}
      {open && (
        <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
          <BusinessUnitSwitcher 
            items={businessUnits}
            className="w-full"
          />
        </Box>
      )}

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 2,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha('#cbd5e1', 0.3),
            borderRadius: '2px',
            '&:hover': {
              backgroundColor: alpha('#94a3b8', 0.5),
            },
          },
        }}
      >
        {menuSections.map((section) => renderMenuSection(section))}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          borderRight: '1px solid #f1f5f9',
          boxShadow: 'none',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;