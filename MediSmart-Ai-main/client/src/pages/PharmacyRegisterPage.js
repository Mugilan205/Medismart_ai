import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Building2, Mail, Lock, Phone, MapPin, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const PharmacyRegisterPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log('Pharmacy registration form submitted with data:', data);
    try {
      console.log('Attempting pharmacy registration...');
      
      // Structure data for pharmacy registration
      const pharmacyData = {
        name: data.ownerName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'pharmacy',
        pharmacyDetails: {
          name: data.pharmacyName,
          licenseNumber: data.licenseNumber,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode
          }
        }
      };
      
      await registerUser(pharmacyData);
      console.log('Pharmacy registration successful, navigating...');
      navigate('/dashboard');
    } catch (error) {
      console.error('Pharmacy registration error:', error);
      // Error toast is handled in AuthProvider
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        {/* Pharmacy Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Building2 className="text-primary-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">Register Your Pharmacy</h2>
          <p className="text-center text-secondary-600">Join our network of trusted pharmacies</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Pharmacy Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
              Pharmacy Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Pharmacy Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                  <input 
                    {...register('pharmacyName', { required: 'Pharmacy name is required' })} 
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="ABC Pharmacy"
                  />
                </div>
                {errors.pharmacyName && <p className="mt-1 text-xs text-red-500">{errors.pharmacyName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">License Number *</label>
                <input 
                  {...register('licenseNumber', { required: 'License number is required' })} 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="PH123456789"
                />
                {errors.licenseNumber && <p className="mt-1 text-xs text-red-500">{errors.licenseNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
              Owner Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Owner Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                  <input 
                    {...register('ownerName', { required: 'Owner name is required' })} 
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>
                {errors.ownerName && <p className="mt-1 text-xs text-red-500">{errors.ownerName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                  <input 
                    type="email" 
                    {...register('email', { required: 'Email is required' })} 
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="owner@pharmacy.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                  <input 
                    type="tel" 
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit phone number'
                      }
                    })} 
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="1234567890"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
                  <input 
                    type="password" 
                    {...register('password', { 
                      required: 'Password is required', 
                      minLength: { value: 6, message: 'Password must be at least 6 characters' } 
                    })} 
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
              Pharmacy Address
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">Street Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-secondary-400" size={20} />
                  <input 
                    {...register('street', { required: 'Street address is required' })} 
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    placeholder="123 Main Street"
                  />
                </div>
                {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">City *</label>
                <input 
                  {...register('city', { required: 'City is required' })} 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="New York"
                />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">State *</label>
                <input 
                  {...register('state', { required: 'State is required' })} 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="NY"
                />
                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">ZIP Code *</label>
                <input 
                  {...register('zipCode', { required: 'ZIP code is required' })} 
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="10001"
                />
                {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode.message}</p>}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? 'Creating Account...' : 'Register Pharmacy'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-secondary-600">
            Already have a pharmacy account?{' '}
            <Link to="/pharmacy/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
          
          <div className="border-t border-secondary-200 pt-4">
            <p className="text-sm text-secondary-600">
              Are you a customer?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Customer Registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default PharmacyRegisterPage;
