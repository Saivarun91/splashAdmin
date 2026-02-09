'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  History,
  Coins,
  Image as ImageIcon,
  FileText,
  Mail,
  Settings,
  Menu,
  X,
  Home,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const allMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Organization', href: '/dashboard/organization', icon: Building2 },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
  { name: 'Payment History', href: '/dashboard/payment-history', icon: History },
  { name: 'Credits Usage', href: '/dashboard/credits-usage', icon: Coins },
  // { name: 'Image Generation History', href: '/dashboard/image-generation-history', icon: ImageIcon },
  { name: 'Prompt Master', href: '/dashboard/prompt-master', icon: FileText },
  { name: 'Mail Templates', href: '/dashboard/mail-templates', icon: Mail },
  { name: 'Home Page', href: '/dashboard/home-page', icon: Home, hasSubmenu: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Legal Compliance', href: '/dashboard/legal-compliance', icon: FileText },
  { name: 'Support & Contact', href: '/dashboard/support', icon: MessageSquare },
  { name: 'Lead Generation', href: '/dashboard/lead-generation', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Start with subscriptions hidden by default (safer - will show if user has no organization)
  const [menuItems, setMenuItems] = useState(allMenuItems.filter(item => item.name !== 'Subscriptions'));
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(() => {
    // Auto-expand Home Page menu if we're on a home page route
    const initial = {};
    if (typeof window !== 'undefined' && window.location.pathname?.startsWith('/dashboard/home-page')) {
      initial['/dashboard/home-page'] = true;
    }
    return initial;
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        console.log('User profile response:', response);

        if (response.success && response.user) {
          const user = response.user;
          console.log('User data:', user);
          console.log('User organization:', user.organization);
          console.log('User organization_id:', user.organization_id);

          // Check if user belongs to any organization - handle all possible formats
          let belongsToOrganization = false;

          // Check organization_id first (most reliable)
          if (user.organization_id && user.organization_id !== null && user.organization_id !== 'null' && user.organization_id !== 'undefined') {
            belongsToOrganization = true;
          }
          // Check organization object
          else if (user.organization && user.organization !== null && user.organization !== undefined) {
            // If organization is an object with id
            if (typeof user.organization === 'object' && user.organization.id) {
              belongsToOrganization = true;
            }
            // If organization is a string/ObjectId (non-empty)
            else if (typeof user.organization === 'string' && user.organization.trim() !== '') {
              belongsToOrganization = true;
            }
            // If organization exists as an object with properties (not empty object)
            else if (typeof user.organization === 'object' && Object.keys(user.organization).length > 0) {
              belongsToOrganization = true;
            }
          }

          console.log('Belongs to organization:', belongsToOrganization);

          // Filter menu items based on user role
          // Rule: Hide Subscriptions if user belongs to ANY organization (owner or member)
          // Show Subscriptions ONLY if user does NOT belong to any organization
          const filteredItems = allMenuItems.filter(item => {
            if (item.name === 'Subscriptions') {
              // Hide if user belongs to any organization (regardless of role)
              if (belongsToOrganization) {
                console.log('Hiding Subscriptions - user belongs to organization');
                return false;
              }
              // Show only if user doesn't belong to any organization
              console.log('Showing Subscriptions - user does not belong to organization');
              return true;
            }
            return true;
          });

          console.log('Filtered menu items:', filteredItems);
          setMenuItems(filteredItems);
        } else {
          console.log('Profile fetch failed or no user data');
          // If profile fetch fails, hide subscriptions by default (safer)
          const filteredItems = allMenuItems.filter(item => item.name !== 'Subscriptions');
          setMenuItems(filteredItems);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // On error, hide subscriptions by default (safer approach)
        const filteredItems = allMenuItems.filter(item => item.name !== 'Subscriptions');
        setMenuItems(filteredItems);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Auto-expand Home Page menu if we're on a home page route
    if (pathname?.startsWith('/dashboard/home-page')) {
      setExpandedMenus(prev => ({ ...prev, '/dashboard/home-page': true }));
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Admin Portal
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.hasSubmenu && pathname?.startsWith(item.href));
              const isExpanded = expandedMenus[item.href] || false;

              if (item.hasSubmenu && item.name === 'Home Page') {
                return (
                  <div key={item.href}>
                    <button
                      onClick={() => {
                        setExpandedMenus(prev => ({ ...prev, [item.href]: !prev[item.href] }));
                      }}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm border-l-4 border-blue-600 dark:border-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span>{item.name}</span>
                      </div>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link
                          href="/dashboard/home-page/before-after"
                          onClick={() => setIsMobileOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                            ${pathname === '/dashboard/home-page/before-after'
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <span className="ml-4">Before After</span>
                        </Link>
                        <Link href="/dashboard/home-page/hero" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${pathname === '/dashboard/home-page/hero' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <span className="ml-4">Hero & CTA</span>
                        </Link>
                        <Link href="/dashboard/home-page/home-content" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${pathname === '/dashboard/home-page/home-content' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <span className="ml-4">Home Content</span>
                        </Link>
                        <Link href="/dashboard/home-page/about" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${pathname === '/dashboard/home-page/about' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <span className="ml-4">About</span>
                        </Link>
                        <Link href="/dashboard/home-page/blog" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${pathname === '/dashboard/home-page/blog' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <span className="ml-4">Blog</span>
                        </Link>
                        <Link href="/dashboard/home-page/vision-mission" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${pathname === '/dashboard/home-page/vision-mission' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <span className="ml-4">Vision & Mission</span>
                        </Link>
                        <Link href="/dashboard/home-page/tutorials" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${pathname === '/dashboard/home-page/tutorials' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <span className="ml-4">Tutorials</span>
                        </Link>
                        <Link href="/dashboard/home-page/security" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${pathname === '/dashboard/home-page/security' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <span className="ml-4">Security</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 font-semibold shadow-sm border-l-4 border-blue-600 dark:border-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:translate-x-1'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
              © 2024 Admin Portal
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              Powered by Splash Backend
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

