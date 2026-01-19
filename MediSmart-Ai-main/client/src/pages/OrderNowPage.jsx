import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from '../context/AuthProvider';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { Pill, Building, Package, DollarSign, MapPin } from 'lucide-react';

const fetchMedicineById = async (api, id) => {
  const { data } = await api.get(`/medicines/${id}`);
  return data;
};

const OrderNowPage = () => {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const { data: medicine, isLoading, isError, error } = useQuery(
    ['order-now-medicine', medicineId],
    () => fetchMedicineById(api, medicineId),
    { enabled: !!medicineId }
  );

  const formatAddress = (addr) => {
    if (!addr) return '—';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      const { street, city, state, zipCode, postalCode, country } = addr || {};
      const parts = [street, city, state, postalCode || zipCode, country].filter(Boolean);
      return parts.join(', ') || '—';
    }
    return '—';
  };

  const defaultAddress = useMemo(() => {
    // Map user.address (if present) to order deliveryAddress schema
    const addr = user?.address || {};
    return {
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || addr.zipCode || '',
      country: addr.country || 'India',
    };
  }, [user]);

  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const placeOrder = useMutation(
    async (payload) => {
      const { data } = await api.post('/orders', payload);
      return data;
    },
    {
      onSuccess: (order) => {
        toast.success('Order placed successfully');
        navigate(`/orders/${order._id}`);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || err.message || 'Failed to place order';
        toast.error(msg);
      }
    }
  );

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError || !medicine) {
    return <div className="container mx-auto py-10 text-center text-red-600">{error?.message || 'Unable to load medicine'}</div>;
  }

  const pharmacy = medicine.pharmacy; // populated in /medicines/:id route
  const canOrder = pharmacy && (typeof medicine.stock === 'number' ? medicine.stock > 0 : true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canOrder) {
      toast.error('This medicine is currently unavailable');
      return;
    }

    // Basic validation for address
    const { street, city, state, postalCode, country } = deliveryAddress;
    if (!street || !city || !state || !postalCode || !country) {
      toast.error('Please fill in your delivery address');
      return;
    }

    const payload = {
      items: [
        {
          medicine: medicineId,
          quantity: Number(quantity) || 1,
        }
      ],
      pharmacy: pharmacy?._id,
      deliveryAddress,
      prescription: 'direct-order',
      paymentMethod,
    };

    placeOrder.mutate(payload);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-6">Order Now</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medicine Summary */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
          <div className="flex gap-5">
            <img
              src={
                (typeof medicine.imageUrl === 'string' && /^https?:\/\//i.test(medicine.imageUrl))
                  ? medicine.imageUrl
                  : `https://source.unsplash.com/600x400/?medicine,pharmacy,${encodeURIComponent(medicine.name || 'medicine')}`
              }
              alt={medicine.name}
              className="w-40 h-28 object-cover rounded"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-secondary-900">{medicine.name}</h2>
              <p className="text-sm text-secondary-600 mt-1">by {medicine.brand || 'N/A'}</p>
              <p className="text-sm text-secondary-600 mt-2 flex items-center gap-2">
                <Pill size={16} /> {medicine.dosage?.form || '—'} • {medicine.dosage?.strength || '—'}
              </p>
              {typeof medicine.price === 'number' && (
                <p className="text-lg font-bold text-primary-600 mt-2 flex items-center gap-1">
                  <DollarSign size={18} /> {medicine.price.toFixed(2)}
                </p>
              )}
              <p className={`text-sm mt-1 flex items-center gap-2 ${medicine.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                <Package size={14} /> {typeof medicine.stock === 'number' ? (medicine.stock > 0 ? `${medicine.stock} in stock` : 'Out of stock') : 'Availability may vary'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-32 border border-secondary-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Delivery Address</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="Street"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress(a => ({ ...a, street: e.target.value }))}
                  className="border border-secondary-300 rounded px-3 py-2"
                />
                <input
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={(e) => setDeliveryAddress(a => ({ ...a, city: e.target.value }))}
                  className="border border-secondary-300 rounded px-3 py-2"
                />
                <input
                  placeholder="State"
                  value={deliveryAddress.state}
                  onChange={(e) => setDeliveryAddress(a => ({ ...a, state: e.target.value }))}
                  className="border border-secondary-300 rounded px-3 py-2"
                />
                <input
                  placeholder="Postal Code"
                  value={deliveryAddress.postalCode}
                  onChange={(e) => setDeliveryAddress(a => ({ ...a, postalCode: e.target.value }))}
                  className="border border-secondary-300 rounded px-3 py-2"
                />
                <input
                  placeholder="Country"
                  value={deliveryAddress.country}
                  onChange={(e) => setDeliveryAddress(a => ({ ...a, country: e.target.value }))}
                  className="border border-secondary-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="border border-secondary-300 rounded px-3 py-2"
              >
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>

            {!canOrder && (
              <div className="text-red-600 text-sm">This medicine is currently unavailable at the selected pharmacy.</div>
            )}

            <button
              type="submit"
              disabled={placeOrder.isLoading || !canOrder}
              className="px-6 py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700 disabled:bg-primary-300"
            >
              {placeOrder.isLoading ? 'Placing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Pharmacy Widget */}
        <div className="bg-white rounded-lg shadow p-5 h-fit">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Building size={18} /> Pharmacy</h3>
          {pharmacy ? (
            <div>
              <p className="font-medium">{pharmacy.name}</p>
              <p className="text-sm text-secondary-600 mt-1 flex items-center gap-2"><MapPin size={14} /> {formatAddress(pharmacy.address)}</p>
            </div>
          ) : (
            <p className="text-sm text-secondary-600">No linked pharmacy found for this medicine. You may need to use Upload Prescription flow.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderNowPage;
