import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Building2, Mail, Lock, Pill } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const PharmacyLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Pharmacy login form submitted!', { email, password });
    
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting pharmacy login...');
      const response = await login(email, password);
      
      // Check if user is a pharmacy
      if (response.user.role !== 'pharmacy') {
        alert('Access denied. This login is only for pharmacy accounts.');
        return;
      }
      
      console.log('Pharmacy login successful, navigating to dashboard...');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Pharmacy login error:', error);
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Pharmacy Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Building2 className="text-primary-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">Pharmacy Portal</h2>
          <p className="text-center text-secondary-600">Sign in to manage your pharmacy</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Pharmacy Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="pharmacy@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </div>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-secondary-600">
            Don't have a pharmacy account?{' '}
            <Link to="/pharmacy/register" className="font-medium text-primary-600 hover:text-primary-500">
              Register your pharmacy
            </Link>
          </p>
          
          <div className="border-t border-secondary-200 pt-4">
            <p className="text-sm text-secondary-600">
              Are you a customer?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Customer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PharmacyLoginPage;
