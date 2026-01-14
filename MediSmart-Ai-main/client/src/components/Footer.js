import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { href: 'https://github.com', icon: Github },
    { href: 'https://linkedin.com', icon: Linkedin },
    { href: 'https://twitter.com', icon: Twitter },
  ];

  const footerLinks = [
    { to: '/about', text: 'About Us' },
    { to: '/contact', text: 'Contact' },
    { to: '/privacy-policy', text: 'Privacy Policy' },
    { to: '/terms-of-service', text: 'Terms of Service' },
  ];

  return (
    <footer className="bg-white border-t border-secondary-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Social */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600">
              <Pill size={28} />
              <span>MediSmart-AI</span>
            </Link>
            <p className="text-secondary-600 text-sm">
              Your AI-powered health companion.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="text-secondary-500 hover:text-primary-600">
                  <link.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-secondary-600 hover:text-primary-600 text-sm">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Stay Updated</h3>
            <p className="text-secondary-600 text-sm mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-3 py-2 border border-secondary-300 rounded-l-md focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-r-md hover:bg-primary-700 text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-secondary-200 pt-6 text-center text-sm text-secondary-500">
          <p>&copy; {new Date().getFullYear()} MediSmart-AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
