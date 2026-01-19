import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { User, Mail, Lock, Phone, Briefcase } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const role = watch('role');

  const onSubmit = async (data) => {
    console.log('Register form submitted with data:', data);
    try {
      console.log('Attempting registration...');
      await registerUser(data);
      console.log('Registration successful, navigating...');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      // Error toast is handled in AuthProvider
    }
  };

  const renderRoleSpecificFields = () => {
    if (role === 'pharmacy') {
      return (
        <div>
          <label htmlFor="pharmacyName" className="text-sm font-medium text-secondary-700">Pharmacy Name</label>
          <input id="pharmacyName" {...register('pharmacyDetails.name', { required: 'Pharmacy name is required' })} className="w-full mt-1 p-2 border rounded" />
          {errors.pharmacyDetails?.name && <p className="mt-1 text-xs text-red-500">{errors.pharmacyDetails.name.message}</p>}
        </div>
      );
    }
    if (role === 'delivery_boy') {
      return (
        <div>
          <label htmlFor="vehicleType" className="text-sm font-medium text-secondary-700">Vehicle Type</label>
          <select id="vehicleType" {...register('deliveryDetails.vehicleType', { required: 'Vehicle type is required' })} className="w-full mt-1 p-2 border rounded">
            <option value="bike">Bike</option>
            <option value="car">Car</option>
            <option value="bicycle">Bicycle</option>
          </select>
          {errors.deliveryDetails?.vehicleType && <p className="mt-1 text-xs text-red-500">{errors.deliveryDetails.vehicleType.message}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <AuthLayout>
      <div className="w-full p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-secondary-900">Create Your Account</h2>
        <p className="text-center text-secondary-600">Join MediSmart-AI today. It's free!</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative mt-1">
                <User className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input {...register('name', { required: 'Full name is required' })} className="w-full pl-10 p-2 border rounded" placeholder="John Doe" />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1">
                <Mail className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" {...register('email', { required: 'Email is required' })} className="w-full pl-10 p-2 border rounded" placeholder="you@example.com" />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Lock className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} className="w-full pl-10 p-2 border rounded" placeholder="••••••••" />
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="tel" {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })} className="w-full pl-10 p-2 border rounded" placeholder="1234567890" />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-sm font-medium">I am a...</label>
            <div className="relative mt-1">
              <Briefcase className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select {...register('role', { required: 'Please select a role' })} className="w-full pl-10 p-2 border rounded appearance-none">
                <option value="">Select a role</option>
                <option value="patient">Patient</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="delivery_boy">Delivery Boy</option>
              </select>
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>

          {/* Role-Specific Fields */}
          {renderRoleSpecificFields()}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-secondary-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
