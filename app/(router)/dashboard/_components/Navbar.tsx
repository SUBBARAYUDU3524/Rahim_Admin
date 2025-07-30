"use client"
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {  FiLogOut, FiMenu, FiX, FiUsers, FiFileText } from 'react-icons/fi';
import Link from 'next/link';
import { auth } from '@/FirebaseConfig';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/90 shadow-sm backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with subtle hover effect */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent
                         hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              AdminPanel
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <NavLink href="/dashboard/form" icon={<FiUsers />} isActive={isActive('/dashboard/form')}>
              Client Form
            </NavLink>
            <NavLink href="/dashboard/clientData" icon={<FiFileText />} isActive={isActive('/dashboard/clientData')}>
              Client Data
            </NavLink>
          </nav>

          {/* Desktop Logout with animated icon */}
          <div className="hidden md:flex items-center ml-4">
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 
                         transition-all duration-300 group hover:shadow-sm hover:-translate-y-0.5"
            >
              <FiLogOut className="mr-2 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-red-600 after:transition-all after:duration-300 group-hover:after:w-full">
                Logout
              </span>
            </button>
          </div>

          {/* Mobile Menu Button with rotation effect */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 
                         hover:bg-gray-100 focus:outline-none transition-all duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6 transform transition-all duration-300 rotate-90 opacity-80 hover:rotate-0 hover:opacity-100" />
              ) : (
                <FiMenu className="h-6 w-6 transform transition-all duration-300 hover:rotate-90 hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with slide-down effect */}
      <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white shadow-xl border-t border-gray-100 px-2 pt-2 pb-4 space-y-1">
          <MobileNavLink 
            href="/dashboard/form" 
            icon={<FiUsers />} 
            isActive={isActive('/dashboard/form')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Client Form
          </MobileNavLink>
          <MobileNavLink 
            href="/dashboard/clientData" 
            icon={<FiFileText />} 
            isActive={isActive('/dashboard/clientData')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Client Data
          </MobileNavLink>
          
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center px-3 py-3 rounded-md text-base font-medium text-red-600 
                       hover:bg-red-50 transition-all duration-300 hover:shadow-inner hover:scale-[1.01]"
          >
            <FiLogOut className="mr-3 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full">
              Logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, icon, children, isActive }: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
        isActive 
          ? 'text-indigo-700 bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-inner' 
          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
      } group`}
    >
      <span className={`mr-2 transition-all duration-300 ${isActive ? 'scale-110 text-indigo-600' : 'text-gray-500 group-hover:scale-110 group-hover:text-indigo-600'}`}>
        {icon}
      </span>
      <span className="relative">
        {children}
        {isActive && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 rounded-full animate-pulse"></span>
        )}
        {!isActive && (
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
        )}
      </span>
      {isActive && (
        <span className="absolute -inset-1 rounded-lg border border-indigo-200 opacity-50 pointer-events-none animate-pulse"></span>
      )}
    </Link>
  );
}

function MobileNavLink({ href, icon, children, isActive, onClick }: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 shadow-inner' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-l-4 hover:border-indigo-200'
      } group transform hover:translate-x-1`}
    >
      <span className={`mr-3 transition-all duration-300 ${
        isActive 
          ? 'text-indigo-600 scale-110' 
          : 'text-gray-500 group-hover:text-indigo-600 group-hover:scale-110'
      }`}>
        {icon}
      </span>
      <span className="relative">
        {children}
        {isActive && (
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 rounded-full animate-pulse"></span>
        )}
      </span>
      <span className={`ml-auto text-xs font-light transition-opacity duration-300 ${
        isActive ? 'opacity-100 text-indigo-400' : 'opacity-0 group-hover:opacity-70'
      }`}>
        →
      </span>
    </Link>
  );
}