import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import Spinner from '../components/common/Spinner';
import { ListOrdered, Calendar, DollarSign, Package, MapPin } from 'lucide-react';

const fetchOrders = async (api) => {
  const { data } = await api.get('/orders');
  return data.orders;
};

const OrdersPage = () => {
  const { api, user } = useAuth();
  const { data: orders, isLoading, isError, error } = useQuery('orders', () => fetchOrders(api), {
    enabled: !!user, // Only run query if user is logged in
  });

  // Map backend statuses to patient-friendly labels
  const mapStatusForPatient = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
      case 'ready':
      case 'ready_for_pickup':
        return 'Processing';
      case 'pending_acceptance':
        return 'Awaiting Acceptance';
      case 'assigned':
        return 'Assigned';
      case 'picked_up':
        return 'Picked Up';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Processing';
    }
  };

  const getStatusColor = (label) => {
    switch (label) {
      case 'Processing':
        return 'text-blue-600 bg-blue-100';
      case 'Awaiting Acceptance':
        return 'text-purple-600 bg-purple-100';
      case 'Assigned':
        return 'text-indigo-600 bg-indigo-100';
      case 'Picked Up':
        return 'text-teal-600 bg-teal-100';
      case 'Out for Delivery':
        return 'text-orange-600 bg-orange-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
      case 'Rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-secondary-600 bg-secondary-100';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 flex items-center gap-2"><ListOrdered /> My Orders</h1>
        <p className="text-secondary-600 mt-1">View your order history and track current deliveries.</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-secondary-200">
            {orders.map(order => (
              <li key={order._id}>
                <Link to={`/orders/${order._id}`} className="block p-4 hover:bg-secondary-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <p className="font-semibold text-primary-600">Order #{order._id.substring(0, 8)}</p>
                      <div className="flex flex-col gap-1 text-sm text-secondary-600 mt-1">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><DollarSign size={14} />
                            {((order.pricing?.total ?? order.totalPrice) || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-secondary-500">
                          <MapPin size={14} className="mt-0.5" />
                          <span>
                            {order.pharmacy?.name || 'Unknown Pharmacy'}
                            {': '}
                            {(() => {
                              const addr = order.pharmacy?.address || {};
                              const street = addr.street ?? 'null';
                              const city = addr.city ?? 'null';
                              const state = addr.state ?? 'null';
                              const zip = addr.zipCode ?? 'null';
                              return `${street}, ${city}, ${state} ${zip}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 text-right">
                      {(() => {
                        const label = mapStatusForPatient(order.status);
                        return (
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(label)}`}>
                            {label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <Package size={48} className="mx-auto text-secondary-400" />
          <h3 className="mt-4 text-xl font-semibold text-secondary-800">No Orders Yet</h3>
          <p className="mt-2 text-secondary-600">You haven't placed any orders. Start by searching for medicines.</p>
          <Link to="/medicines" className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">
            Browse Medicines
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
