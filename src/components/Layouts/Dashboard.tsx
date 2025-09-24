"use client"

import React, { ReactNode, useState, useEffect } from 'react'
import { 
  HomeIcon, 
  ClipboardDocumentListIcon, 
  ScaleIcon, 
  DocumentTextIcon, 
  ChatBubbleBottomCenterTextIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

type SidebarState = 'expanded' | 'collapsed' | 'hidden';

const Dashboard = ({children}: {children: ReactNode}) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarState, setSidebarState] = useState<SidebarState>('collapsed');

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_state') as SidebarState;
    if (saved && ['expanded', 'collapsed', 'hidden'].includes(saved)) {
      setSidebarState(saved);
    }
  }, []);

  // Save sidebar state to localStorage
  const updateSidebarState = (state: SidebarState) => {
    setSidebarState(state);
    localStorage.setItem('sidebar_state', state);
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      current: pathname.startsWith("/dashboard"),
    },
    {
      name: "Register",
      href: "/register",
      icon: ClipboardDocumentListIcon,
      current: pathname.startsWith("/register"),
    },
    {
      name: "Judge Panel",
      href: "/judge_panel",
      icon: ScaleIcon,
      current: pathname.startsWith("/judge_panel"),
    },
    {
      name: "Receipts",
      href: "/receipts",
      icon: DocumentTextIcon,
      current: pathname.startsWith("/receipts"),
    },
    {
      name: "SMS",
      href: "/sms",
      icon: ChatBubbleBottomCenterTextIcon,
      current: pathname.startsWith("/sms"),
    },
  ];

  // Mobile bottom navigation (main 5 only)
  const mobileNavigation = navigation;

  const getSidebarWidth = () => {
    switch (sidebarState) {
      case 'expanded': return 'w-72';
      case 'collapsed': return 'w-16';
      case 'hidden': return 'w-0';
      default: return 'w-16';
    }
  };

  const getMainMargin = () => {
    switch (sidebarState) {
      case 'expanded': return 'lg:ml-72';
      case 'collapsed': return 'lg:ml-16';
      case 'hidden': return 'lg:ml-0';
      default: return 'lg:ml-16';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="WokoApp" width={32} height={32} className="h-8 w-8" />
                <span className="font-bold text-blue-600">WokoApp</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 px-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        item.current
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${getSidebarWidth()}`}>
        <div className="flex grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
          {/* Logo section */}
          <div className="flex h-16 shrink-0 items-center px-4">
            {sidebarState === 'expanded' ? (
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="WokoApp" width={32} height={32} className="h-8 w-8" />
                <span className="font-bold text-blue-600">WokoApp</span>
              </div>
            ) : sidebarState === 'collapsed' ? (
              <Image src="/logo.png" alt="WokoApp" width={32} height={32} className="h-8 w-8 mx-auto" />
            ) : null}
          </div>

          {/* Navigation */}
          {sidebarState !== 'hidden' && (
            <nav className="flex-1 px-4 py-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name} className="relative">
                    {item.current && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute inset-y-0 left-0 w-1 bg-blue-600 rounded-r"
                      />
                    )}
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group ${
                        item.current
                          ? (sidebarState === 'expanded' ? 'bg-blue-50 text-blue-600' : 'text-blue-600')
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={sidebarState === 'collapsed' ? item.name : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {sidebarState === 'expanded' && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Sidebar controls */}
          {sidebarState !== 'hidden' && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-center gap-2">
                {sidebarState === 'expanded' ? (
                  <>
                    <button
                      onClick={() => updateSidebarState('collapsed')}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Collapse sidebar"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateSidebarState('hidden')}
                      className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Hide sidebar"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateSidebarState('expanded')}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Expand sidebar"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show sidebar button when hidden */}
      {sidebarState === 'hidden' && (
        <button
          onClick={() => updateSidebarState('collapsed')}
          className="fixed top-4 left-4 z-40 hidden lg:flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Show sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
      )}

      {/* Main content */}
      <div className={`transition-all duration-300 ${getMainMargin()}`}>
        {/* Top bar */}
        <div className="bg-theme-primary sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 p-2.5 text-white lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Sidebar toggle button */}
          <button
            onClick={() => {
              if (sidebarState === 'hidden') updateSidebarState('collapsed');
              else if (sidebarState === 'collapsed') updateSidebarState('expanded');
              else updateSidebarState('collapsed');
            }}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors text-white"
            title="Toggle sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Separator */}
          <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search */}
            <form action="#" method="GET" className="relative flex flex-1">
              <label htmlFor="search-field" className="sr-only">Search</label>
              <MagnifyingGlassIcon
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-200"
              />
              <input
                id="search-field"
                name="search"
                type="search"
                placeholder="Search..."
                className="bg-theme-primary block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-200 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              />
            </form>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="text-white h-6 w-6" />
              </button>

              {/* Separator */}
              <div
                aria-hidden="true"
                className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
              />

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="-m-1.5 flex items-center p-1.5">
                  <span className="sr-only">Open user menu</span>
                  <Image
                    width={32}
                    height={32}
                    alt="User Profile"
                    src="/images.png"
                    className="h-8 w-8 rounded-full bg-gray-50 object-cover"
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      aria-hidden="true"
                      className="ml-4 text-sm font-semibold leading-6 text-white"
                    >
                      Staff
                    </span>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="ml-2 h-5 w-5 text-gray-400"
                    />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                >
                  <MenuItem>
                    <Link
                      href="/settings/profile"
                      className="block px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                    >
                      My profile
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <button
                      type="button"
                      className="block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900 data-[focus]:bg-gray-50"
                    >
                      Logout
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 pb-20 lg:pb-6 bg-white">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <nav className="flex">
          {mobileNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${
                item.current
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Dashboard
