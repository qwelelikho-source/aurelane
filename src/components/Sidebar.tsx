'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, CreditCard, ClipboardList, Target, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { name: 'Budgets', href: '/dashboard/budgets', icon: ClipboardList },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut({ redirectTo: '/login' });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-surface min-h-screen border-r border-border">
        <div className="p-6">
          <h1 className="text-2xl font-serif text-gold">Aurelane</h1>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-6 py-3 rounded-l border-l-2 transition-all ${
                      isActive
                        ? 'bg-background/50 border-gold text-gold'
                        : 'border-transparent text-muted hover:text-text hover:bg-background/30'
                    }`}
                    aria-label={item.name}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[14px]">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-6 py-3 text-muted hover:text-text transition-colors"
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[14px]">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-4 py-2 text-sm transition-colors ${
                  isActive ? 'text-gold' : 'text-muted'
                }`}
                aria-label={item.name}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-gold' : 'text-muted'}`} />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
