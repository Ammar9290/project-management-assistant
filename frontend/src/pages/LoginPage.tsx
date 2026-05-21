import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { BotMessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError('');
      const response = await apiClient.post('/auth/login', data);
      login(response.data.access_token);
      navigate('/');
    } catch (error: any) {
      console.error('Login Error:', error);
      setServerError(error.response?.data?.message || 'Failed to login. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-soft" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 shadow-lg shadow-primary-500/30 mb-6 relative">
              <Sparkles className="absolute top-2 right-2 w-4 h-4 text-white/70 animate-pulse" />
              <BotMessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
            <p className="text-slate-300 text-sm">Sign in to manage your AI-powered projects</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-200 animate-fade-in">
                {serverError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-primary-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary-400 transition-colors"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-primary-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary-400 transition-colors"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>}
              </div>
            </div>

            <Button type="submit" variant="premium" className="w-full mt-6 py-3" isLoading={isSubmitting}>
              Sign In
            </Button>

            <div className="text-center mt-6">
              <span className="text-slate-400 text-sm">Don't have an account? </span>
              <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors text-sm">
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
