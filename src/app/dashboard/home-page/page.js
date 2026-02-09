'use client';

import Link from 'next/link';
import { Image, FileText, Layout, BookOpen, Target, Video, Shield } from 'lucide-react';

const sections = [
  { name: 'Before After', href: '/dashboard/home-page/before-after', icon: Image, description: 'Before/after image pairs on home' },
  { name: 'Hero & CTA', href: '/dashboard/home-page/hero', icon: Layout, description: 'Hero title, CTAs, and carousel images' },
  { name: 'Home Content', href: '/dashboard/home-page/home-content', icon: FileText, description: 'Chapters, features, showcase, how it works, footer' },
  { name: 'About', href: '/dashboard/home-page/about', icon: BookOpen, description: 'About page content and images' },
  { name: 'Blog', href: '/dashboard/home-page/blog', icon: FileText, description: 'Blog posts list and editor' },
  { name: 'Vision & Mission', href: '/dashboard/home-page/vision-mission', icon: Target, description: 'Vision & mission page content' },
  { name: 'Tutorials', href: '/dashboard/home-page/tutorials', icon: Video, description: 'Tutorials page and videos' },
  { name: 'Security', href: '/dashboard/home-page/security', icon: Shield, description: 'Security page content' },
];

export default function HomePageDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Home Page Content</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all public-facing content: home, about, blog, vision & mission, tutorials, and security.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ name, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
          >
            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
