'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError('');
    setLoading(true);

    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-gold mb-2">Aurelane</h1>
          <p className="text-muted">Private money tracking, in rand.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-serif text-text mb-6">Sign In</h2>

          {registered && (
            <div className="bg-positive/10 border border-positive text-positive px-4 py-3 rounded mb-4">
              Account created successfully! Please sign in.
            </div>
          )}

          {error && (
            <div className="bg-negative/10 border border-negative text-negative px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full h-10 px-4 py-2 bg-background border border-border rounded text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-gold hover:bg-gold/90 text-background font-medium px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-gold hover:text-gold/80">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background px-4"><p className="text-muted">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
