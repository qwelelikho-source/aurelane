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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-gold mb-2">Aurelane</h1>
          <p className="text-muted text-[14px]">Private money tracking, in rand.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-serif text-text mb-6">Create Account</h2>

          {error && (
            <div className="bg-negative/10 border border-negative text-negative px-4 py-3 rounded mb-4 text-[14px]">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all text-[14px]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all text-[14px]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all text-[14px]"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted mb-1 text-[14px]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all text-[14px]"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-gold hover:bg-gold/90 text-background font-medium px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-muted text-[14px]">
            Already have an account?{' '}
            <Link href="/login" className="text-gold hover:text-gold/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
