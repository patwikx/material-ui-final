'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { UserData, deleteUser, toggleUserStatus } from '@/lib/actions/user-management';

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
};

interface UserListPageProps {
  initialUsers: UserData[];
  businessUnitId: string;
}

const UserListPage: React.FC<UserListPageProps> = ({ initialUsers, businessUnitId }) => {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: UserData | null }>({
    open: false,
    user: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteDialog.user) return;

    setLoading('delete');
    try {
      const result = await deleteUser(deleteDialog.user.id);
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== deleteDialog.user!.id));
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to delete user',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while deleting user: ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setLoading(userId);
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const result = await toggleUserStatus(userId, newStatus);
      if (result.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: newStatus as 'ACTIVE' | 'INACTIVE' } : u
        ));
        setSnackbar({
          open: true,
          message: `User ${newStatus.toLowerCase()} successfully`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Failed to update user status',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `An error occurred while updating user status: ${error}`,
        severity: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (status: string): keyof typeof darkTheme => {
    return status === 'ACTIVE' ? 'success' : 'error';
  };

  const getStatusBg = (status: string): keyof typeof darkTheme => {
    return status === 'ACTIVE' ? 'successBg' : 'errorBg';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: darkTheme.background,
        color: darkTheme.text,
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: darkTheme.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mb: 1,
                }}
              >
                User Management
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' },
                  color: darkTheme.text,
                  lineHeight: 1.2,
                  mb: 2,
                }}
              >
                System Users
              </Typography>
              <Typography
                sx={{
                  color: darkTheme.textSecondary,
                  fontSize: '1rem',
                  maxWidth: '600px',
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Manage system users, their roles, and access permissions across all business units.
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/users/new`)}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                minWidth: 'auto',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: darkTheme.primaryHover,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Create User
            </Button>
          </Box>
        </Box>

        {/* User Cards */}
        {users.length === 0 ? (
          <Box
            sx={{
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
              p: 6,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                backgroundColor: darkTheme.selectedBg,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <PersonIcon sx={{ fontSize: 32, color: darkTheme.primary }} />
            </Box>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: darkTheme.text,
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              No users found
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.2,
                mb: 4,
              }}
            >
              Create your first user to get started
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => router.push(`/${businessUnitId}/admin/users/new`)}
              sx={{
                backgroundColor: darkTheme.primary,
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { backgroundColor: darkTheme.primaryHover },
              }}
            >
              Create User
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {users.map((user) => (
              <Card
                key={user.id}
                sx={{
                  backgroundColor: darkTheme.surface,
                  borderRadius: '8px',
                  border: `1px solid ${darkTheme.border}`,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: darkTheme.surfaceHover,
                    borderColor: darkTheme.primary,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                  {/* Avatar Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        backgroundColor: user.status === 'ACTIVE' ? darkTheme.primary : darkTheme.textSecondary,
                        color: 'white'
                      }}
                    >
                      {getUserInitials(user.firstName, user.lastName)}
                    </Avatar>
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: darkTheme.text,
                          fontSize: '1.1rem',
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Chip
                        label={user.status}
                        size="small"
                        icon={user.status === 'ACTIVE' ? <ActiveIcon sx={{ fontSize: 12 }} /> : <BlockIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          height: 24,
                          fontSize: '11px',
                          backgroundColor: darkTheme[getStatusBg(user.status)],
                          color: darkTheme[getStatusColor(user.status)],
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: darkTheme[getStatusColor(user.status)],
                          },
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: darkTheme.textSecondary, mb: 1 }}>
                      {user.email}
                    </Typography>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem', mb: 1 }}>
                      Username: {user.username}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem' }}>
                        Roles:
                      </Typography>
                      {user.assignments.map((assignment) => (
                        <Chip
                          key={`${assignment.businessUnitId}-${assignment.roleId}`}
                          label={`${assignment.role.displayName} @ ${assignment.businessUnit.displayName}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '10px',
                            backgroundColor: darkTheme.selectedBg,
                            color: darkTheme.primary,
                            fontWeight: 500,
                          }}
                        />
                      ))}
                      {user.assignments.length === 0 && (
                        <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.875rem', fontStyle: 'italic' }}>
                          No assignments
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ color: darkTheme.textSecondary, fontSize: '0.75rem', mt: 1 }}>
                      Created: {formatDate(user.createdAt)} • Last updated: {formatDate(user.updatedAt)}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, flexShrink: 0 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.status === 'ACTIVE'}
                          onChange={() => handleToggleStatus(user.id, user.status)}
                          disabled={loading === user.id}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: darkTheme.success,
                              '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.04)' },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: darkTheme.success,
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: darkTheme.border,
                            },
                          }}
                        />
                      }
                      label=""
                      sx={{ mr: 0 }}
                    />
                    
                    <Tooltip title="Edit user">
                      <IconButton
                        onClick={() => router.push(`/${businessUnitId}/admin/users/${user.id}`)}
                        sx={{
                          color: darkTheme.textSecondary,
                          '&:hover': {
                            backgroundColor: darkTheme.selectedBg,
                            color: darkTheme.primary,
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete user">
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, user })}
                        sx={{
                          color: darkTheme.textSecondary,
                          '&:hover': {
                            backgroundColor: darkTheme.errorBg,
                            color: darkTheme.error,
                          },
                          width: 32,
                          height: 32,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, user: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: darkTheme.surface,
              borderRadius: '8px',
              border: `1px solid ${darkTheme.border}`,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: darkTheme.text,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Delete User
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: '12px',
                color: darkTheme.textSecondary,
                lineHeight: 1.6
              }}
            >
              Are you sure you want to delete this user? This action cannot be undone and will remove all their assignments and access.
            </Typography>
            {deleteDialog.user && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: darkTheme.background, borderRadius: '8px', border: `1px solid ${darkTheme.border}` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: darkTheme.text }}>
                  {deleteDialog.user.firstName} {deleteDialog.user.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: darkTheme.textSecondary }}>
                  {deleteDialog.user.email}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, user: null })}
              sx={{
                color: darkTheme.textSecondary,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: darkTheme.surfaceHover,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading === 'delete'}
              sx={{
                backgroundColor: darkTheme.error,
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#dc2626',
                },
                '&:disabled': {
                  backgroundColor: darkTheme.textSecondary,
                },
              }}
            >
              {loading === 'delete' ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              backgroundColor: snackbar.severity === 'success' ? darkTheme.successBg : darkTheme.errorBg,
              borderColor: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
              border: `1px solid`,
              borderRadius: '8px',
              color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error,
              fontSize: '12px',
              fontWeight: 600,
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'success' ? darkTheme.success : darkTheme.error
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default UserListPage;