'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Transactions', href: '/dashboard/transactions', icon: '💳' },
  { name: 'Budgets', href: '/dashboard/budgets', icon: '📋' },
  { name: 'Goals', href: '/dashboard/goals', icon: '🎯' },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut({ redirectTo: '/login' });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-16 bg-surface min-h-screen border-r border-border">
        <div className="p-4">
          <h1 className="text-2xl font-serif text-gold">A</h1>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center px-4 py-3 rounded-l border-l-2 transition-all ${
                      isActive
                        ? 'bg-background/50 border-gold text-text'
                        : 'border-transparent text-muted hover:text-text hover:bg-background/30'
                    }`}
                    title={item.name}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="sr-only">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-4 py-3 text-muted hover:text-text transition-colors"
            title="Sign Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012 2h2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3.5a2.5 2.5 0 0 1 0 5 0 2.5 2.5 0 0 1 0 5 0 2.5 2.5 0 0 1 0 5 0 2.5 2.5 0 0 1 0 5 0" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-4 py-2 text-sm transition-colors ${
                  isActive ? 'text-gold' : 'text-muted'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
