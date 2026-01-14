import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link } from 'react-router-dom';
import { MapPin, Clock, List, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/delivery/my-orders');
        setOrders(response.data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error('Failed to load your deliveries.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [api]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_acceptance':
        return 'border-blue-500';
      case 'assigned':
        return 'border-indigo-500';
      case 'out_for_delivery':
        return 'border-orange-500';
      case 'delivered':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">My Deliveries</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Active Deliveries ({activeOrders.length})</h2>
          {loading ? (
            <p>Loading deliveries...</p>
          ) : activeOrders.length === 0 ? (
            <p className="text-secondary-600">You have no active deliveries.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map(order => (
                <Link to={`/orders/${order._id}`} key={order._id} className={`block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 ${getStatusColor(order.status)}`}>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-secondary-900">Order #{order._id.substring(0, 8)}</h3>
                    <span className="text-sm font-semibold text-white px-2 py-1 rounded-full bg-gray-700">{order.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="mt-4 space-y-3 text-secondary-700">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary-500" />
                      <span>From: <strong>{order.pharmacy.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-500" />
                      <span>To: <strong>{order.patient.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-orange-500" />
                      <span>Assigned: {new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Completed Deliveries ({completedOrders.length})</h2>
          {loading ? (
            <p>Loading history...</p>
          ) : completedOrders.length === 0 ? (
            <p className="text-secondary-600">You have no completed deliveries.</p>
          ) : (
            <ul className="bg-white rounded-lg shadow-md divide-y divide-secondary-200">
              {completedOrders.map(order => (
                <li key={order._id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Order #{order._id.substring(0, 8)}</p>
                    <p className="text-sm text-secondary-600">Delivered on {new Date(order.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span>Completed</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
