"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material"
import {
  Building2,
  Users,
  FileText,
  BedDouble,
  CreditCard,
  BarChart3,
  Settings,
  Receipt,
  Banknote,
  SprayCan,
  Wrench,
  CalendarCheck,
  Globe,
  LayoutDashboard,
  Hotel,
  ChevronDown,
  ChevronRight,
  UserStar,
  CircleQuestionMarkIcon,
  ImagePlay,
  ChartLine,
  CassetteTape,
} from "lucide-react"

import type { BusinessUnitItem } from "@/types/business-unit-types"
import BusinessUnitSwitcher from "./business-unit-swticher"
import UserProfileLogout from "./user-profile-logout"

// Dark theme colors
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
  treeLines: '#374151', // Color for the tree structure lines
}

// 1. UPDATED DATA STRUCTURE FOR HOTEL MANAGEMENT
// =================================================================
export interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ size?: number; color?: string }>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Front Desk",
    icon: Building2,
    children: [
      { title: "Reservations", href: "/admin/operations/reservations", icon: CalendarCheck },
      { title: "Guests", href: "/admin/operations/guests", icon: Users },
      { title: "Rooms", href: "/admin/operations/rooms", icon: BedDouble },
      { title: "Room Types", href: "/admin/operations/room-types", icon: CassetteTape },
      { title: "Room Rates", href: "/admin/operations/room-rates", icon: ChartLine },
    ],
  },
  {
    title: "Payments & Billing",
    icon: Banknote,
    children: [
      { title: "Payments", href: "/admin/operations/payments", icon: CreditCard },
      { title: "Incidental Charges", href: "/admin/operations/incidental-charges", icon: Receipt },
      { title: "Room Rates", href: "/admin/operations/rates", icon: Banknote },
    ],
  },
  {
    title: "Operations",
    icon: Wrench,
    children: [
      { title: "Tasks", href: "/admin/operations/tasks", icon: Wrench },
      { title: "Service Requests", href: "/admin/operations/service-requests", icon: Receipt },
      { title: "Maintenance", href: "/admin/operations/maintenance", icon: SprayCan },
    ],
  },
  {
    title: "Guest Experience",
    icon: Users,
    children: [
      { title: "Interactions", href: "/admin/operations/guest-experience/interactions", icon: Users },
      { title: "Amenities", href: "/admin/operations/guest-experience/amenities", icon: FileText },
      { title: "Feedback", href: "/admin/operations/guest-experience/feedback", icon: Receipt },
    ],
  },
  {
    title: "Dining & Events",
    icon: Hotel,
    children: [
      { title: "Restaurants", href: "/admin/operations/restaurants", icon: Hotel },
      { title: "Events", href: "/admin/operations/events", icon: CalendarCheck },
      { title: "Special Offers", href: "/admin/operations/special-offers", icon: Banknote },
    ],
  },
  {
    title: "Website CMS",
    icon: Globe,
    children: [
      { title: "Hero Slides", href: "/admin/cms/hero", icon: ImagePlay },
      { title: "FAQs", href: "/admin/cms/faqs", icon: CircleQuestionMarkIcon },
      { title: "Testimonials", href: "/admin/cms/testimonials", icon: UserStar },
      { title: "Announcements", href: "/admin/cms/announcements", icon: FileText },
    ],
  },
]

const bottomNavigation: NavItem[] = [
  {
    title: "Admin & Settings",
    icon: Settings,
    children: [
      { title: "Business Units", href: "/admin/operations/properties", icon: Building2 },
      { title: "Users & Roles", href: "/admin/users", icon: Users },
      { title: "System", href: "/admin/system", icon: Settings },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    children: [
      { title: "Payment Summaries", href: "/analytics/payments", icon: BarChart3 },
      { title: "Page Analytics", href: "/analytics/pages", icon: BarChart3 },
      { title: "Search Queries", href: "/analytics/search", icon: BarChart3 },
    ],
  },
]

// 2. PROP TYPE DEFINITIONS
// =================================================================
interface SidebarProps {
  businessUnitId: string
  businessUnits: BusinessUnitItem[]
}

interface SidebarLinkProps {
  item: NavItem
  businessUnitId: string
  isLast?: boolean
  depth?: number
}

// 3. SIDEBAR LINK SUB-COMPONENT
// =================================================================
function SidebarLink({ item, businessUnitId, isLast = false, depth = 0 }: SidebarLinkProps) {
  const pathname = usePathname()
  const href = item.href ? `/${businessUnitId}${item.href}` : ""
  const isActive = pathname === href
  
  const [open, setOpen] = useState(() => {
    if (item.children) {
      return item.children.some((child) => {
        const childHref = child.href ? `/${businessUnitId}${child.href}` : ""
        return pathname.startsWith(childHref)
      })
    }
    return false
  })

  const handleClick = () => {
    setOpen(!open)
  }

  if (item.children) {
    const isAnyChildActive = item.children.some((child) => {
      const childHref = child.href ? `/${businessUnitId}${child.href}` : ""
      return pathname.startsWith(childHref)
    })

    return (
      <Box sx={{ position: 'relative' }}>
        {/* Vertical line for parent items */}
        {depth > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: depth * 20 - 10,
              top: 0,
              bottom: isLast ? 22 : 0,
              width: '1px',
              backgroundColor: darkTheme.treeLines,
              zIndex: 1,
            }}
          />
        )}
        
        {/* Horizontal line for parent items */}
        {depth > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: depth * 20 - 10,
              top: 22,
              width: 20,
              height: '1px',
              backgroundColor: darkTheme.treeLines,
              zIndex: 1,
            }}
          />
        )}

        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleClick}
            sx={{
              borderRadius: '8px',
              mx: 1,
              mb: 0.5,
              minHeight: 44,
              pl: depth * 2.5 + 1,
              color: isAnyChildActive ? darkTheme.primary : darkTheme.text,
              backgroundColor: isAnyChildActive ? darkTheme.selectedBg : 'transparent',
              '&:hover': {
                backgroundColor: darkTheme.surfaceHover,
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 36, 
              color: isAnyChildActive ? darkTheme.primary : darkTheme.textSecondary 
            }}>
              <item.icon size={18} />
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: isAnyChildActive ? 600 : 500,
              }}
            />
            <Box sx={{ ml: 1, color: darkTheme.textSecondary }}>
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Box>
          </ListItemButton>
        </ListItem>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child, index) => (
              <Box key={child.title} sx={{ position: 'relative' }}>
                <SidebarLink 
                  item={child} 
                  businessUnitId={businessUnitId}
                  isLast={index === item.children!.length - 1}
                  depth={depth + 1}
                />
              </Box>
            ))}
          </List>
        </Collapse>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Tree structure lines for child items */}
      {depth > 0 && (
        <>
          {/* Vertical line */}
          <Box
            sx={{
              position: 'absolute',
              left: depth * 20 - 10,
              top: 0,
              bottom: isLast ? 22 : 0,
              width: '1px',
              backgroundColor: darkTheme.treeLines,
              zIndex: 1,
            }}
          />
          
          {/* Horizontal line */}
          <Box
            sx={{
              position: 'absolute',
              left: depth * 20 - 10,
              top: 22,
              width: 20,
              height: '1px',
              backgroundColor: darkTheme.treeLines,
              zIndex: 1,
            }}
          />
          
          {/* Corner connector */}
          {isLast && (
            <Box
              sx={{
                position: 'absolute',
                left: depth * 20 - 10,
                top: 22,
                width: '1px',
                height: '1px',
                backgroundColor: darkTheme.treeLines,
                borderTopRightRadius: '1px',
                zIndex: 1,
              }}
            />
          )}
        </>
      )}

      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          href={href}
          sx={{
            borderRadius: '8px',
            mx: 1,
            mb: 0.5,
            minHeight: 44,
            pl: depth * 2.5 + 1,
            color: isActive ? darkTheme.primary : darkTheme.text,
            backgroundColor: isActive ? darkTheme.selectedBg : 'transparent',
            '&:hover': {
              backgroundColor: isActive ? darkTheme.selectedBg : darkTheme.surfaceHover,
            },
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 36, 
            color: isActive ? darkTheme.primary : darkTheme.textSecondary 
          }}>
            <item.icon size={18} />
          </ListItemIcon>
          <ListItemText 
            primary={item.title}
            primaryTypographyProps={{
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
            }}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  )
}

// 4. MAIN SIDEBAR COMPONENT
// =================================================================
export function Sidebar({ businessUnitId, businessUnits }: SidebarProps) {
  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: darkTheme.background,
        borderRight: `1px solid ${darkTheme.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header Section - Business Unit Switcher */}
      <Box sx={{ p: 3, pb: 2 }}>
        <BusinessUnitSwitcher items={businessUnits} />
      </Box>

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List component="nav" disablePadding>
          {navigation.map((item) => (
            <SidebarLink key={item.title} item={item} businessUnitId={businessUnitId} /> 
          )) } 
        </List>

        {/* Bottom Navigation */}
        <Box sx={{ mt: 4 }}>
          <List component="nav" disablePadding>
            {bottomNavigation.map((item) => (
              <SidebarLink key={item.title} item={item} businessUnitId={businessUnitId} />
            ))}
          </List>
        </Box>
      </Box>

      {/* User Profile */}
      <div className="mb-4 ml-4 mr-4">
        <UserProfileLogout />
      </div>
    </Box>
  )
}