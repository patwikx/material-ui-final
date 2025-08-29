'use client'

import React, { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { 
  LogOut, 
  Bell, 
  MoreHorizontal,
} from 'lucide-react'
import { useCurrentUser } from '@/lib/current-user'


// Dark theme colors matching the sidebar
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
  danger: '#ef4444',
  dangerHover: '#dc2626',
}

export function UserProfileLogout() {
  const user = useCurrentUser()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleClose()
    await signOut({ callbackUrl: '/' })
    router.push('/')
  }

  const handleNotifications = () => {
    handleClose()
    router.push('/notifications')
  }

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ')
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`
      }
      return user.name.charAt(0)
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.name || 'User'
  }

  const getUserEmail = () => {
    return user?.email || user?.firstName || 'user@example.com'
  }

  return (
    <>
      <Button
        onClick={handleClick}
        fullWidth
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: '8px',
          backgroundColor: 'transparent',
          border: `1px solid ${darkTheme.border}`,
          color: darkTheme.text,
          textTransform: 'none',
          justifyContent: 'flex-start',
          minHeight: 48,
          '&:hover': {
            backgroundColor: darkTheme.surfaceHover,
            borderColor: darkTheme.border,
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '14px',
            backgroundColor: darkTheme.primary,
            color: 'white',
          }}
          src={user?.image || undefined}
        >
          {getUserInitials()}
        </Avatar>
        
        <Box sx={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: darkTheme.text,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getUserDisplayName()}
          </Typography>
          <Typography
            sx={{
              fontSize: '12px',
              color: darkTheme.textSecondary,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getUserEmail()}
          </Typography>
        </Box>

        <MoreHorizontal 
          size={16} 
          color={darkTheme.textSecondary}
        />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: darkTheme.surface,
            border: `1px solid ${darkTheme.border}`,
            borderRadius: '8px',
            minWidth: 200,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            '& .MuiList-root': {
              py: 1,
            },
          },
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={handleNotifications}
          sx={{
            mx: 1,
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: darkTheme.surfaceHover,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: '32px' }}>
            <Bell size={16} color={darkTheme.textSecondary} />
          </ListItemIcon>
          <ListItemText>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: darkTheme.text,
              }}
            >
              Notifications
            </Typography>
          </ListItemText>
        </MenuItem>

        <Divider sx={{ 
          my: 1, 
          mx: 1,
          borderColor: darkTheme.border,
        }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            mx: 1,
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: '32px' }}>
            <LogOut size={16} color={darkTheme.danger} />
          </ListItemIcon>
          <ListItemText>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: darkTheme.danger,
              }}
            >
              Log out
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserProfileLogout