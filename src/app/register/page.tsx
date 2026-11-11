'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError('');
    setLoading(true);

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0B1220]">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#121B2D] flex-col justify-center items-center px-12 border-r border-[#243049]">
        <div className="max-w-md text-center">
          <h1 className="text-5xl font-bold text-[#C9A24B] font-serif mb-4">Aurelane</h1>
          <p className="text-2xl text-[#E8E4DA] mb-8">Private money tracking, in rand.</p>
          <svg className="w-full h-32 text-[#C9A24B]" viewBox="0 0 400 100" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M0 80 L50 60 L100 70 L150 40 L200 50 L250 30 L300 45 L350 20 L400 35" />
            <path d="M0 80 L50 60 L100 70 L150 40 L200 50 L250 30 L300 45 L350 20 L400 35" strokeDasharray="4 4" opacity={0.5} />
          </svg>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-[#C9A24B] font-serif mb-2">Aurelane</h1>
            <p className="text-[#8B95A8] text-[14px]">Private money tracking, in rand.</p>
          </div>

          <div className="bg-[#121B2D] border border-[#243049] rounded-2xl p-8">
            <h2 className="text-2xl font-serif text-[#E8E4DA] mb-6">Create Account</h2>

            {error && (
              <div className="bg-[#D9746B]/10 border border-[#D9746B] text-[#D9746B] px-4 py-3 rounded mb-4 text-[14px]">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px]"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#8B95A8] mb-1 text-[14px]">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  className="w-full h-10 px-4 py-2 bg-[#0B1220] border border-[#243049] rounded text-[#E8E4DA] placeholder-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent transition-all text-[14px]"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#C9A24B] hover:bg-[#B8923E] text-[#0B1220] font-medium px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-[#8B95A8] text-[14px]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#C9A24B] hover:text-[#B8923E]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
