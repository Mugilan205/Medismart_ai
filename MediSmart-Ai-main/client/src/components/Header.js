import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Pill, User, LogOut, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get('tab');
  const [isOpen, setIsOpen] = useState(false);

  // We no longer render a generic Dashboard link. Pharmacy gets explicit links.

  const getNavLinks = () => {
    // Default links for non-logged-in users
    if (!user) {
      return [{ to: '/medicines', text: 'Medicines' }];
    }

    // Links for different user roles
    switch (user.role) {
      case 'pharmacy':
        return [
          { to: '/dashboard?tab=medicines', text: 'Medicines' },
          { to: '/dashboard?tab=orders', text: 'Orders' },
          { to: '/dashboard?tab=analytics', text: 'Analytics' },
        ];
      case 'delivery_boy':
        return [
          { to: '/my-deliveries', text: 'My Deliveries' },
        ]; 
      
      // Regular users see the full set of links
      default:
        return [
          { to: '/medicines', text: 'Medicines' },
          { to: '/upload-prescription', text: 'Upload Prescription' },
          { to: '/orders', text: 'My Orders' },
        ];
    }
  };

  const navLinks = getNavLinks();

  const renderNavLinks = (isMobile = false) => (
    navLinks.map(link => {
      const isDashboardTabLink = link.to.startsWith('/dashboard?tab=');
      const linkTab = isDashboardTabLink ? link.to.split('=')[1] : null;
      return (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={() => setIsOpen(false)}
          className={({ isActive }) => {
            const active = isDashboardTabLink
              ? location.pathname === '/dashboard' && currentTab === linkTab
              : isActive;
            return `px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent focus:outline-none focus:ring-0 bg-transparent hover:bg-transparent ${
              active
                ? 'text-white font-semibold bg-transparent'
                : isMobile
                  ? 'text-primary-100 hover:border-primary-300'
                  : 'text-white hover:border-white/40'
            }`;
          }}
        >
          {link.text}
        </NavLink>
      );
    })
  );

  return (
    <header className="bg-primary-600 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold">
            <Pill size={28} />
            <span>MediSmart-AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {renderNavLinks()}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <NavLink to="/profile" className="flex items-center gap-2 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium">
                  <User size={18} />
                  <span>{user.name}</span>
                </NavLink>
                <button 
                  onClick={logout} 
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  title="Logout"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-white text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-md text-sm font-medium">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-primary-200 hover:text-white hover:bg-primary-700">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLinks(true)}
          </nav>
          <div className="pt-4 pb-3 border-t border-primary-700">
            {user ? (
              <div className="px-2 space-y-2">
                <NavLink to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-700">Profile</NavLink>
                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-700">Logout</button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-700">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-700">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
