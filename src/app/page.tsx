import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220]">
      {/* Header */}
      <header className="px-6 py-4 border-b border-[#243049]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#C9A24B] font-serif">Aurelane</h1>
          <Link
            href="/login"
            className="text-[#E8E4DA] hover:text-[#C9A24B] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-[#E8E4DA] font-serif mb-6">
            Private money tracking, in rand.
          </h2>
          <p className="text-xl text-[#8B95A8] mb-12 max-w-2xl mx-auto">
            Track your income, expenses, budgets, and savings goals with a clean, private interface designed for South African rand.
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#121B2D] border border-[#243049] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C9A24B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-[#E8E4DA] font-semibold mb-2">Private & Secure</h3>
              <p className="text-[#8B95A8] text-sm">Your data stays yours. All queries are scoped to your account.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#121B2D] border border-[#243049] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C9A24B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-[#E8E4DA] font-semibold mb-2">Visual Insights</h3>
              <p className="text-[#8B95A8] text-sm">Charts and budgets help you understand your spending patterns.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#121B2D] border border-[#243049] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C9A24B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[#E8E4DA] font-semibold mb-2">Built for ZAR</h3>
              <p className="text-[#8B95A8] text-sm">Designed specifically for South African rand with proper formatting.</p>
            </div>
          </div>

          {/* Dashboard Screenshot Placeholder */}
          <div className="mb-12 rounded-lg border border-[#243049] bg-[#121B2D] p-8">
            <div className="aspect-video bg-[#0B1220] rounded flex items-center justify-center">
              <p className="text-[#8B95A8]">Dashboard Preview</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-[#C9A24B] hover:bg-[#B8923E] text-[#0B1220] font-semibold py-3 px-8 rounded transition-colors"
            >
              Try the Demo
            </Link>
            <Link
              href="/login"
              className="bg-[#121B2D] hover:bg-[#1A263D] text-[#E8E4DA] font-semibold py-3 px-8 rounded border border-[#243049] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#243049]">
        <div className="max-w-6xl mx-auto text-center text-[#8B95A8] text-sm">
          <p>© 2026 Aurelane. Private money tracking, in rand.</p>
        </div>
      </footer>
    </div>
  );
}
