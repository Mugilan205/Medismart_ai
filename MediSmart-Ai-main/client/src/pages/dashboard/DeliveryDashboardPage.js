import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../context/AuthProvider';
import Spinner from '../../components/common/Spinner';
import { List, Search } from 'lucide-react';

// Map removed; keeping list-only view

const fetchAssignedOrders = async (api) => {
  // Prefer delivery endpoint which includes populated pharmacy address
  const { data } = await api.get('/orders/delivery/my-orders');
  // This endpoint returns an array
  return Array.isArray(data) ? data : data.orders;
};

const DeliveryDashboardPage = () => {
  const { api, user } = useAuth();
  const [tab, setTab] = useState('active'); // active | all | completed
  const [query, setQuery] = useState('');
  const { data: orders, isLoading, isError, error } = useQuery('assignedOrders', () => fetchAssignedOrders(api));

  // Show all orders line by line (no map, no split)
  const listOrders = orders || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = listOrders;
    if (tab === 'active') {
      base = listOrders.filter(o => ['assigned', 'pending_acceptance', 'picked_up', 'out_for_delivery'].includes(o.status));
    } else if (tab === 'completed') {
      base = listOrders.filter(o => o.status === 'delivered');
    }
    if (!q) return base;
    return base.filter(o => (
      (o.pharmacy?.name || '').toLowerCase().includes(q) ||
      (o.deliveryAddress?.city || '').toLowerCase().includes(q) ||
      (o.deliveryAddress?.street || '').toLowerCase().includes(q)
    ));
  }, [listOrders, tab, query]);

  const statusClass = (status) => {
    const map = {
      pending_acceptance: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Delivery Dashboard</h1>
        <p className="text-secondary-600">Welcome, {user?.name}! Here are your assigned deliveries.</p>
      </div>

      <div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><List /> My Deliveries</h2>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm cursor-pointer ${tab==='active'?'bg-primary-600 text-white':'bg-secondary-100 text-secondary-700'}`} onClick={() => setTab('active')}>Active</div>
              <div className={`px-3 py-1 rounded-full text-sm cursor-pointer ${tab==='all'?'bg-primary-600 text-white':'bg-secondary-100 text-secondary-700'}`} onClick={() => setTab('all')}>All</div>
              <div className={`px-3 py-1 rounded-full text-sm cursor-pointer ${tab==='completed'?'bg-primary-600 text-white':'bg-secondary-100 text-secondary-700'}`} onClick={() => setTab('completed')}>Completed</div>
            </div>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by pharmacy or address..."
              className="w-full pl-9 pr-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <p className="text-red-500">{error.message}</p>
          ) : (filtered.length > 0) ? (
            <ul className="space-y-4">
              {filtered.map(order => (
                <li key={order._id} className="p-4 border rounded-lg hover:shadow transition">
                  <p className="font-semibold">
                    {(order.pharmacy?.name || 'Pharmacy')} 
                    <span className="text-secondary-500 font-normal">• {(() => {
                      const d = order.createdAt || order.updatedAt;
                      return d ? new Date(d).toLocaleDateString() : '';
                    })()}</span>
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-secondary-500">To</div>
                      <div className="text-secondary-800">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</div>
                    </div>
                    <div>
                      <div className="text-secondary-500">From</div>
                      <div className="text-secondary-800">{order.pharmacy?.address?.street ?? 'N/A'}, {order.pharmacy?.address?.city ?? 'N/A'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(order.status)}`}>
                        {order.status.replace(/_/g,' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-secondary-700">
                      Items: {(order.items?.map(i=>i?.name).filter(Boolean).slice(0,3).join(', ')) || `${order.items?.length||0} item(s)`}
                    </div>
                    <Link to={`/delivery/orders/${order._id}`} className="inline-flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">View Details</Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active deliveries.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
