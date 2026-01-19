import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthProvider';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser, api } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || ''
      }
    }
  });

  const onSubmit = async (data) => {
    try {
      // Map payload to profile update endpoint
      const payload = {
        name: data.name,
        phone: data.phone,
        address: data.address
      };
      const res = await api.put('/auth/profile', payload);
      setUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">My Profile</h1>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative mt-1">
              <User className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input {...register('name', { required: 'Name is required' })} className="w-full pl-10 p-2 border rounded" />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="email" {...register('email')} className="w-full pl-10 p-2 border rounded bg-secondary-100" disabled />
            </div>
            <p className="text-xs text-secondary-500 mt-1">Email address cannot be changed.</p>
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <div className="relative mt-1">
              <Phone className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="tel" {...register('phone', { required: 'Phone is required' })} className="w-full pl-10 p-2 border rounded" />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Address (Pharmacy and others can set a general address) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Street</label>
              <input {...register('address.street')} className="w-full mt-1 p-2 border rounded" placeholder="123 Main St" />
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <input {...register('address.city')} className="w-full mt-1 p-2 border rounded" placeholder="City" />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <input {...register('address.state')} className="w-full mt-1 p-2 border rounded" placeholder="State" />
            </div>
            <div>
              <label className="text-sm font-medium">ZIP / Postal Code</label>
              <input {...register('address.zipCode')} className="w-full mt-1 p-2 border rounded" placeholder="ZIP" />
            </div>
          </div>

          {/* Role-specific info display */}
          <div className="p-4 bg-secondary-50 rounded-md">
            <h3 className="font-semibold">Role: <span className="font-normal capitalize">{user.role.replace('_', ' ')}</span></h3>
            {user.role === 'pharmacy' && user.pharmacyDetails && (
              <p className="text-sm mt-2">Pharmacy Name: {user.pharmacyDetails.name}</p>
            )}
            {user.role === 'delivery_boy' && user.deliveryDetails && (
              <p className="text-sm mt-2">Vehicle: {user.deliveryDetails.vehicleType}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300">
            <Save size={18} />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
