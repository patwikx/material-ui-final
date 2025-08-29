"use client"

import * as z from "zod"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"


// --- MATERIAL UI COMPONENTS ---
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Container,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  BarChart,
  Google,
  Business,
} from '@mui/icons-material'
import { LoginSchema } from "../../lib/validations/login-schema"
import { login } from "../../lib/auth-actions/login"

// Custom styled alert components for errors and success
const FormError = ({ message }: { message?: string }) => {
  if (!message) return null
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {message}
    </Alert>
  )
}

const FormSuccess = ({ message }: { message?: string }) => {
  if (!message) return null
  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      {message}
    </Alert>
  )
}

// Social login button component
const SocialButton = ({ 
  children, 
  onClick,
  startIcon 
}: { 
  children: React.ReactNode
  onClick: () => void
  startIcon?: React.ReactNode
}) => (
  <Button
    variant="outlined"
    fullWidth
    onClick={onClick}
    startIcon={startIcon}
    sx={{
      height: 48,
      textTransform: 'none',
      fontSize: '0.95rem',
      fontWeight: 500,
    }}
  >
    {children}
  </Button>
)

export const LoginForm = () => {
  const searchParams = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const callbackUrl = searchParams.get("callbackUrl")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      passwordHash: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")
    setIsLoading(true)
    try {
      const data = await login(values)
      if (data?.error) {
        setError(data.error)
      } else if (data.success) {
        // On successful login, redirect to the dashboard or home page
        window.location.assign("/setup")
      }
    } catch (error) {
      setError(`An unexpected error occurred. Please try again. ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        padding: 2,
      }}
    >
      <Card
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 450,
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Company Logo and Name */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
              <BarChart sx={{ fontSize: 32, color: '#1976d2' }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                PLM Accounting Solutions
              </Typography>
            </Box>
            
            <Typography variant="h4" component="h2" fontWeight="600" gutterBottom>
              {showTwoFactor ? "Two-Factor Authentication" : "Welcome Back!"}
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              {showTwoFactor 
                ? "Enter the code from your authenticator app." 
                : "Securely access your financial dashboard."}
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            {showTwoFactor ? (
              // --- 2FA Code Field ---
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Verification Code"
                    placeholder="123456"
                    disabled={isLoading}
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    sx={{
                      mb: 3,
                      '& .MuiInputBase-input': {
                        fontSize: '1.25rem',
                        letterSpacing: '0.2em',
                        textAlign: 'center',
                      },
                    }}
                    InputProps={{
                      style: { height: 56 }
                    }}
                  />
                )}
              />
            ) : (
              <>
                {/* --- Username Field --- */}
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Username"
                      placeholder="e.g., j.doe"
                      disabled={isLoading}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                        style: { height: 56 }
                      }}
                    />
                  )}
                />

                {/* --- Password Field --- */}
                <Controller
                  name="passwordHash"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      disabled={isLoading}
                      error={!!errors.passwordHash}
                      helperText={errors.passwordHash?.message}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        style: { height: 56 }
                      }}
                    />
                  )}
                />

                {/* --- Remember Me & Forgot Password --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label="Remember me"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.9rem' } }}
                  />
                  <Button
                    component={Link}
                    href="/auth/reset"
                    variant="text"
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
              </>
            )}

            {/* Error and Success Messages */}
            <FormError message={error} />
            <FormSuccess message={success} />

            {/* --- Submit Button --- */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                height: 56,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                mb: 3,
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>{showTwoFactor ? "Confirming..." : "Logging in..."}</span>
                </Box>
              ) : (
                <span>{showTwoFactor ? "Confirm & Sign In" : "Sign In"}</span>
              )}
            </Button>

            {/* --- Social Logins (Optional) --- */}
            {!showTwoFactor && (
              <>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Divider sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                      OR CONTINUE WITH
                    </Typography>
                  </Divider>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <SocialButton 
                    onClick={() => { /* Handle Google Login */ }}
                    startIcon={<Google />}
                  >
                    Google
                  </SocialButton>
                  <SocialButton 
                    onClick={() => { /* Handle Microsoft Login */ }}
                    startIcon={<Business />}
                  >
                    Microsoft
                  </SocialButton>
                </Box>
              </>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Button
                component={Link}
                href="/auth/register"
                variant="text"
                size="small"
                sx={{ textTransform: 'none', p: 0.5 }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}