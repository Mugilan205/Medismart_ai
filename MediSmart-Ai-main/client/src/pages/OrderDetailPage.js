import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthProvider';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';

const fetchOrderById = async (api, id) => {
  const { data } = await api.get(`/orders/${id}`);
  // Support both { order } and raw order payloads
  return data?.order || data;
};

const DeliveryAddress = ({ address }) => {
  if (!address || !address.street) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin size={20} className="mr-2" />
          Delivery Address
        </h3>
        <p className="text-gray-500">Address not provided for this order.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
        <MapPin size={20} className="mr-2" />
        Delivery Address
      </h3>
      <p className="text-gray-600">{address.street}</p>
      <p className="text-gray-600">{`${address.city}, ${address.state} ${address.postalCode}`}</p>
      <p className="text-gray-600">{address.country}</p>
    </div>
  );
};

const OrderDetailPage = () => {
  const { api, user } = useAuth();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: order, isLoading, isError, error } = useQuery(['order', id], () => fetchOrderById(api, id), {
    onError: (err) => toast.error(err?.message || 'Failed to fetch order details.')
  });

  const respondToOrder = useMutation(
    async ({ response }) => {
      const { data } = await api.put(`/orders/${id}/respond`, { response });
      return { payload: data, response };
    },
    {
      onSuccess: ({ payload, response }) => {
        toast.success(`Order ${payload.status || payload.order?.status}`);
        queryClient.setQueryData(['order', id], payload.order || payload);
        if (response === 'accepted') {
          navigate('/my-deliveries');
        }
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update order')
    }
  );

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div></div>;
  if (isError) return <div className="text-center mt-10 text-red-500">Error loading order details.</div>;
  if (!order) return <div className="text-center mt-10">Order not found.</div>;

  const deliveryAddress = order.deliveryAddress;
  const isDeliveryBoy = user?.role === 'delivery_boy';
  const pharmacyAddress = order.pharmacy?.address || {};

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-primary-600 text-white">
            <h1 className="text-3xl font-bold">Order #{(order.orderNumber) || order._id?.substring(0, 8)}</h1>
            <p className="text-primary-200">Status: <span className="font-semibold uppercase">{order.status?.replace('_', ' ')}</span></p>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-secondary-800">Delivery Details</h3>
                <div className="space-y-4">
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-secondary-700 flex items-center gap-2"><MapPin size={20} className="text-blue-500"/> Pickup Pharmacy</h4>
                    <p className="text-secondary-900 font-bold mt-1">{order.pharmacy?.name || 'Pharmacy'}</p>
                    <p className="text-secondary-600">
                      {(pharmacyAddress.street ?? 'null')}, {(pharmacyAddress.city ?? 'null')}
                    </p>
                  </div>
                  <DeliveryAddress address={deliveryAddress} />
                </div>
              </div>

              {/* Delivery Boy Actions */}
              {isDeliveryBoy && order.status === 'pending_acceptance' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-secondary-800">Actions</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        if (window.confirm('Accept this delivery?')) {
                          respondToOrder.mutate({ response: 'accepted' });
                        }
                      }}
                      disabled={respondToOrder.isLoading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Reject this delivery?')) {
                          respondToOrder.mutate({ response: 'rejected' });
                        }
                      }}
                      disabled={respondToOrder.isLoading}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-secondary-800">Order Items</h3>
                <ul className="space-y-3">
                  {order.items?.map(item => (
                    <li key={item.medicine} className="flex justify-between items-center text-secondary-700">
                      <span>{item.name || 'Item'} <span className="text-sm text-secondary-500">x {item.quantity}</span></span>
                      <span className="font-semibold">₹{Number(item.finalPrice || item.price || 0).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-bold text-lg text-secondary-800">
                    <span>Total</span>
                    <span>₹{Number(order.pricing?.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4 text-secondary-800">Status History</h3>
                <ul className="space-y-4">
                  {order.statusHistory?.map((entry, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-4 h-4 bg-primary-500 rounded-full mt-1.5 mr-4"></div>
                      <div>
                        <p className="font-semibold capitalize text-secondary-800">{entry.status.replace('_', ' ')}</p>
                        <p className="text-sm text-secondary-500">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
