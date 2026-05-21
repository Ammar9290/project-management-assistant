import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { BotMessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError('');
      const response = await apiClient.post('/auth/register', data);
      login(response.data.access_token);
      navigate('/');
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 right-10 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse-soft"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 shadow-lg shadow-primary-500/30 mb-6 relative">
              <Sparkles className="absolute top-2 right-2 w-4 h-4 text-white/70 animate-pulse" />
              <BotMessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
            <p className="text-slate-300 text-sm">Join the AI-powered project revolution</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/50 p-4 text-sm text-red-200 animate-fade-in">
                {serverError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  {...register('name')}
                  type="text"
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-400 focus:border-primary-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary-400 transition-colors"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>}
              </div>
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
              Create Account
            </Button>

            <div className="text-center mt-6">
              <span className="text-slate-400 text-sm">Already have an account? </span>
              <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors text-sm">
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
