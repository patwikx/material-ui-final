"use client"

import * as React from "react"
import {
  Box,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  Button,
} from "@mui/material"
import {
  Store as StoreIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  ChevronRightTwoTone,
} from "@mui/icons-material"
import { useParams, useRouter } from "next/navigation"
import type { BusinessUnitItem } from "../types/business-unit-types"
import { useBusinessUnitModal } from "@/hooks/use-bu-modal"

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
}

interface BusinessUnitSwitcherProps {
  items: BusinessUnitItem[]
  className?: string
}

// Mock data to simulate different app types like in the image
const getAppTypeIcon = (displayName?: string) => {
  if (!displayName) return MonitorIcon
  
  const lowerName = displayName.toLowerCase()
  if (lowerName.includes('mobile') || lowerName.includes('app')) {
    return SmartphoneIcon
  }
  if (lowerName.includes('admin') || lowerName.includes('settings')) {
    return SettingsIcon
  }
  if (lowerName.includes('store') || lowerName.includes('shop')) {
    return StoreIcon
  }
  if (lowerName.includes('dev') || lowerName.includes('code')) {
    return CodeIcon
  }
  return MonitorIcon
}

const getAppTypeLabel = (displayName?: string) => {
  if (!displayName) return 'Business Unit'
  
  const lowerName = displayName.toLowerCase()
  if (lowerName.includes('mobile') || lowerName.includes('app')) {
    return 'Mobile application'
  }
  if (lowerName.includes('admin')) {
    return 'Business Unit'
  }
  if (lowerName.includes('dev')) {
    return 'Business Unit'
  }
  return 'Business Unit'
}

export default function BusinessUnitSwitcher({ 
  className, 
  items = [] 
}: BusinessUnitSwitcherProps) {
  const businessUnitModal = useBusinessUnitModal()
  const params = useParams()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const isSwitcherActive = items.length > 1
  const currentBusinessUnit = items.find((item) => item.id === params.businessUnitId)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isSwitcherActive) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const onBusinessUnitSelect = (businessUnitId: string) => {
    handleClose()
    router.push(`/${businessUnitId}`)
    router.refresh()
  }

  const handleAddProduct = () => {
    handleClose()
    businessUnitModal.onOpen()
  }

  // Static display for single unit users
  if (!isSwitcherActive) {
    const IconComponent = getAppTypeIcon(currentBusinessUnit?.displayName || '')
    
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 2,
          py: 1.5,
          backgroundColor: darkTheme.surface,
          borderRadius: '8px',
          border: `1px solid ${darkTheme.border}`,
        }}
      >
        <IconComponent sx={{ 
          mr: 1.5, 
          fontSize: '18px', 
          color: darkTheme.textSecondary 
        }} />
        <Box>
          <Typography 
            sx={{ 
              fontSize: '14px',
              fontWeight: 600,
              color: darkTheme.text,
              lineHeight: 1.2,
            }}
          >
            {currentBusinessUnit?.displayName || "No Unit Assigned"}
          </Typography>
          <Typography 
            sx={{ 
              fontSize: '12px',
              color: darkTheme.textSecondary,
              lineHeight: 1.2,
            }}
          >
            {getAppTypeLabel(currentBusinessUnit?.displayName || '')}
          </Typography>
        </Box>
      </Box>
    )
  }

  // Interactive dropdown for multi-unit users
  const CurrentIcon = getAppTypeIcon(currentBusinessUnit?.displayName || '')

  return (
    <Box className={className}>
      <Button
        onClick={handleClick}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 2,
          py: 1.5,
          backgroundColor: darkTheme.surface,
          borderRadius: '8px',
          border: `1px solid ${darkTheme.border}`,
          textTransform: 'none',
          color: darkTheme.text,
          '&:hover': {
            backgroundColor: darkTheme.surfaceHover,
            borderColor: darkTheme.primary,
          },
        }}
      >
        <CurrentIcon sx={{ 
          mr: 1.5, 
          fontSize: '18px', 
          color: darkTheme.textSecondary 
        }} />
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
            {currentBusinessUnit?.displayName || "Select Unit"}
          </Typography>
          <Typography 
            sx={{ 
              fontSize: '12px',
              color: darkTheme.textSecondary,
              lineHeight: 1.2,
            }}
          >
            {getAppTypeLabel(currentBusinessUnit?.displayName || '')}
          </Typography>
        </Box>
        <ChevronRightTwoTone 
          sx={{ 
            ml: 1,
            fontSize: '16px',
            color: darkTheme.textSecondary,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }} 
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
            minWidth: 280,
            maxHeight: 400,
            overflow: 'visible',
            mt: 0.5,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
        }}
        MenuListProps={{
          sx: { py: 1 },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {/* Group by environment */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography 
            sx={{ 
              fontSize: '12px',
              fontWeight: 600,
              color: darkTheme.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Production
          </Typography>
        </Box>

        {/* Current/Selected item */}
        {currentBusinessUnit && (
          <MenuItem
            onClick={() => onBusinessUnitSelect(currentBusinessUnit.id)}
            sx={{
              mx: 1,
              borderRadius: '6px',
              backgroundColor: darkTheme.selectedBg,
              border: `1px solid ${darkTheme.primary}`,
              mb: 1,
              '&:hover': {
                backgroundColor: darkTheme.selectedBg,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: '32px' }}>
              <CurrentIcon sx={{ fontSize: '18px', color: darkTheme.primary }} />
            </ListItemIcon>
            <ListItemText>
              <Typography 
                sx={{ 
                  fontSize: '14px',
                  fontWeight: 600,
                  color: darkTheme.text,
                  lineHeight: 1.2,
                }}
              >
                {currentBusinessUnit.displayName}
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: '12px',
                  color: darkTheme.textSecondary,
                  lineHeight: 1.2,
                }}
              >
                {getAppTypeLabel(currentBusinessUnit.displayName)}
              </Typography>
            </ListItemText>
            <CheckIcon sx={{ 
              fontSize: '16px', 
              color: darkTheme.primary,
              ml: 1,
            }} />
          </MenuItem>
        )}

        {/* Other business units */}
        {items
          .filter(item => item.id !== currentBusinessUnit?.id)
          .slice(0, 3)
          .map((item) => {
            const IconComponent = getAppTypeIcon(item.displayName)
            return (
              <MenuItem
                key={item.id}
                onClick={() => onBusinessUnitSelect(item.id)}
                sx={{
                  mx: 1,
                  borderRadius: '6px',
                  '&:hover': {
                    backgroundColor: darkTheme.surfaceHover,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: '32px' }}>
                  <IconComponent sx={{ fontSize: '18px', color: darkTheme.textSecondary }} />
                </ListItemIcon>
                <ListItemText>
                  <Typography 
                    sx={{ 
                      fontSize: '14px',
                      fontWeight: 500,
                      color: darkTheme.text,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.displayName}
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: '12px',
                      color: darkTheme.textSecondary,
                      lineHeight: 1.2,
                    }}
                  >
                    {getAppTypeLabel(item.displayName)}
                  </Typography>
                </ListItemText>
              </MenuItem>
            )
          })}

        {/* Development Section (if more items) */}
        {items.length > 4 && (
          <>
            <Box sx={{ px: 2, py: 1, mt: 1 }}>
              <Typography 
                sx={{ 
                  fontSize: '12px',
                  fontWeight: 600,
                  color: darkTheme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Development
              </Typography>
            </Box>

            {items
              .filter(item => item.id !== currentBusinessUnit?.id)
              .slice(3)
              .map((item) => {
                const IconComponent = getAppTypeIcon(item.displayName)
                return (
                  <MenuItem
                    key={item.id}
                    onClick={() => onBusinessUnitSelect(item.id)}
                    sx={{
                      mx: 1,
                      borderRadius: '6px',
                      '&:hover': {
                        backgroundColor: darkTheme.surfaceHover,
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      <IconComponent sx={{ fontSize: '18px', color: darkTheme.textSecondary }} />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography 
                        sx={{ 
                          fontSize: '14px',
                          fontWeight: 500,
                          color: darkTheme.text,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.displayName}
                      </Typography>
                      <Typography 
                        sx={{ 
                          fontSize: '12px',
                          color: darkTheme.textSecondary,
                          lineHeight: 1.2,
                        }}
                      >
                        {getAppTypeLabel(item.displayName)}
                      </Typography>
                    </ListItemText>
                  </MenuItem>
                )
              })}
          </>
        )}

        <Divider sx={{ 
          my: 1, 
          mx: 1,
          borderColor: darkTheme.border,
        }} />

        {/* Add Product Option */}
        <MenuItem
          onClick={handleAddProduct}
          sx={{
            mx: 1,
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: darkTheme.surfaceHover,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: '32px' }}>
            <AddIcon sx={{ fontSize: '18px', color: darkTheme.textSecondary }} />
          </ListItemIcon>
          <ListItemText>
            <Typography 
              sx={{ 
                fontSize: '14px',
                fontWeight: 500,
                color: darkTheme.text,
                lineHeight: 1.2,
              }}
            >
              Add Business Unit
            </Typography>
            <Typography 
              sx={{ 
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
              }}
            >
              Business Unit
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}