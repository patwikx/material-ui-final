"use client"

import * as z from "zod"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Eye, EyeOff, BarChart3, Zap, Shield, Star, Lightbulb } from "lucide-react"

// Keep your original imports and schema
import { LoginSchema } from "../../lib/validations/login-schema"
import { login } from "../../lib/auth-actions/login"

// Custom styled alert components for errors and success
const FormError = ({ message }: { message?: string }) => {
  if (!message) return null
  return (
    <div className="bg-red-900/20 border border-red-800/50 text-red-200 px-4 py-3 rounded-lg mb-4">
      {message}
    </div>
  )
}

const FormSuccess = ({ message }: { message?: string }) => {
  if (!message) return null
  return (
    <div className="bg-green-900/20 border border-green-800/50 text-green-200 px-4 py-3 rounded-lg mb-4">
      {message}
    </div>
  )
}

// Feature item component for the left panel
const FeatureItem = ({ icon: Icon, title, description }: { 
  icon: React.ComponentType<{ className?: string }>, 
  title: string, 
  description: string 
}) => (
  <div className="flex gap-4 mb-8">
    <div className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-center min-w-[48px] h-12">
      <Icon className="text-blue-400 w-6 h-6" />
    </div>
    <div>
      <h3 className="text-slate-100 font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
)

export const LoginForm = () => {
  const searchParams = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const callbackUrl = searchParams?.get("callbackUrl")
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
    <div className="min-h-screen bg-slate-900 flex relative">
      {/* Subtle background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 opacity-80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-7/12 bg-transparent p-8 xl:p-16 flex-col justify-center relative z-10">
        {/* Logo and Brand */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-blue-500 w-8 h-8" />
            <h1 className="text-slate-100 text-2xl font-bold">PLM Accounting Solutions</h1>
          </div>
        </div>

        {/* Features List */}
        <div className="max-w-lg">
          <FeatureItem
            icon={Zap}
            title="Adaptable performance"
            description="Our product effortlessly adjusts to your needs, boosting efficiency and simplifying your tasks."
          />
          
          <FeatureItem
            icon={Shield}
            title="Built to last"
            description="Experience unmatched durability that goes above and beyond with lasting investment."
          />
          
          <FeatureItem
            icon={Star}
            title="Great user experience"
            description="Integrate our product into your routine with an intuitive and easy-to-use interface."
          />
          
          <FeatureItem
            icon={Lightbulb}
            title="Innovative functionality"
            description="Stay ahead with features that set new standards, addressing your evolving needs better than the rest."
          />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-5/12 bg-slate-800/90 backdrop-blur-sm flex items-center justify-center p-6 lg:p-8 relative z-10 shadow-2xl">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <BarChart3 className="text-blue-500 w-8 h-8" />
            <h1 className="text-slate-100 text-xl font-bold">PLM Solutions</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-slate-100 text-3xl font-semibold mb-2">
              {showTwoFactor ? "Two-Factor Authentication" : "Sign in"}
            </h2>
            {!showTwoFactor && (
              <p className="text-slate-400">Securely access your financial dashboard</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {showTwoFactor ? (
              // --- 2FA Code Field ---
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Verification Code
                </label>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="123456"
                      disabled={isLoading}
                      className="w-full h-14 bg-slate-900 border border-gray-600 rounded-lg px-4 text-slate-100 text-xl tracking-wider text-center focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  )}
                />
                {errors.code && (
                  <p className="text-red-400 text-sm mt-1">{errors.code.message}</p>
                )}
              </div>
            ) : (
              <>
                {/* --- Username Field --- */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Username
                  </label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="e.g., j.doe"
                        disabled={isLoading}
                        className="w-full h-14 bg-slate-900 border border-gray-600 rounded-lg px-4 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    )}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                {/* --- Password Field --- */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-slate-300 text-sm font-medium">
                      Password
                    </label>
                    <Link 
                      href="/auth/reset" 
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Controller
                      name="passwordHash"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="w-full h-14 bg-slate-900 border border-gray-600 rounded-lg px-4 pr-12 text-slate-100 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.passwordHash && (
                    <p className="text-red-400 text-sm mt-1">{errors.passwordHash.message}</p>
                  )}
                </div>

                {/* --- Remember Me --- */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-blue-600 bg-slate-900 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="remember" className="ml-2 text-slate-400 text-sm">
                    Remember me
                  </label>
                </div>
              </>
            )}

            {/* Error and Success Messages */}
            <FormError message={error} />
            <FormSuccess message={success} />

            {/* --- Submit Button --- */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-600 disabled:text-slate-400 text-slate-900 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                  <span>{showTwoFactor ? "Confirming..." : "Signing in..."}</span>
                </>
              ) : (
                <span>{showTwoFactor ? "Confirm & Sign In" : "Sign in"}</span>
              )}
            </button>

            {/* Footer Links */}
            {!showTwoFactor && (
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/auth/register" 
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}