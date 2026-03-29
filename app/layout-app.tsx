'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  BookOpen, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Onboarding', href: '/onboarding', icon: BookOpen },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = pathname?.includes('/auth');
  if (isAuthPage) return <>{children}</>;

  return (
    <div className="flex h-screen bg-background">

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-6">
          <h1 className="text-xl font-bold">Onboarding AI</h1>

          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden hover:bg-sidebar-accent rounded p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)} // auto close on click (mobile)
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'hover:bg-sidebar-accent/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/20 w-full transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="bg-background border-b border-border px-6 py-4 flex items-center gap-3">
          
          {/* Menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden hover:bg-muted rounded p-2"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h2 className="text-lg font-bold">OnboardAI</h2>
            <p className="text-xs text-muted-foreground">
              Intelligent Employee Onboarding
            </p>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}