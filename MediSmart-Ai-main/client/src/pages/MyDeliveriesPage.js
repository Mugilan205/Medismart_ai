import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthProvider';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { List, Search } from 'lucide-react';

const fetchMyDeliveries = async (api) => {
  const { data } = await api.get('/orders/delivery/my-orders');
  return Array.isArray(data) ? data : data.orders;
};

const MyDeliveriesPage = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('active'); // active | all | completed
  const [query, setQuery] = useState('');

  const { data: orders = [], isLoading, isError, error } = useQuery('myDeliveries', () => fetchMyDeliveries(api));

  const updateStatus = useMutation(
    async ({ id, status }) => {
      const { data } = await api.put(`/orders/${id}/update-delivery-status`, { status });
      return data;
    },
    {
      onSuccess: () => {
        toast.success('Status updated');
        queryClient.invalidateQueries('myDeliveries');
        queryClient.invalidateQueries('assignedOrders');
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update status')
    }
  );

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

  const filtered = useMemo(() => {
    const list = orders || [];
    let base = list;
    if (tab === 'active') {
      base = list.filter(o => ['assigned', 'pending_acceptance', 'picked_up', 'out_for_delivery'].includes(o.status));
    } else if (tab === 'completed') {
      base = list.filter(o => o.status === 'delivered');
    }
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(o => (
      (o.pharmacy?.name || '').toLowerCase().includes(q) ||
      (o.deliveryAddress?.city || '').toLowerCase().includes(q) ||
      (o.deliveryAddress?.street || '').toLowerCase().includes(q)
    ));
  }, [orders, tab, query]);

  const renderActions = (order) => {
    if (order.status === 'assigned') {
      return (
        <button
          onClick={() => updateStatus.mutate({ id: order._id, status: 'picked_up' })}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >Picked Up</button>
      );
    }
    if (order.status === 'picked_up') {
      return (
        <button
          onClick={() => updateStatus.mutate({ id: order._id, status: 'out_for_delivery' })}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
        >Arriving</button>
      );
    }
    if (order.status === 'out_for_delivery') {
      return (
        <button
          onClick={() => updateStatus.mutate({ id: order._id, status: 'delivered' })}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >Delivered</button>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">My Deliveries</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm cursor-pointer ${tab==='active'?'bg-primary-600 text-white':'bg-secondary-100 text-secondary-700'}`} onClick={() => setTab('active')}>Active</div>
            <div className={`px-3 py-1 rounded-full text-sm cursor-pointer ${tab==='all'?'bg-primary-600 text-white':'bg-secondary-100 text-secondary-700'}`} onClick={() => setTab('all')}>All</div>
            <div className={`px-3 py-1 rounded-full text-sm cursor-pointer ${tab==='completed'?'bg-primary-600 text-white':'bg-secondary-100 text-secondary-700'}`} onClick={() => setTab('completed')}>Completed</div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by pharmacy or address..."
              className="w-full md:w-80 pl-9 pr-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p className="text-red-500">{error?.message || 'Failed to load'}</p>
        ) : filtered.length > 0 ? (
          <ul className="space-y-4">
            {filtered.map(order => (
              <li key={order._id} className="p-4 border rounded-lg hover:shadow transition">
                <p className="font-semibold">
                  {(order.pharmacy?.name || 'Pharmacy')}
                  <span className="text-secondary-500 font-normal"> • {(() => {
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
                  <div className="flex gap-2">
                    {renderActions(order)}
                    <Link to={`/delivery/orders/${order._id}`} className="inline-flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">Details</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-secondary-600">No deliveries found.</p>
        )}
      </div>
    </div>
  );
};

export default MyDeliveriesPage;
