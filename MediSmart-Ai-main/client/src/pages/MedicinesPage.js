import React from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import MedicineCard from '../components/medicines/MedicineCard';
import Spinner from '../components/common/Spinner';
import { History, Pill, Package, RefreshCcw, ExternalLink } from 'lucide-react';

const fetchMyMedicines = async (api) => {
  const { data } = await api.get('/medicines/my-medicines');
  return data;
};

const MedicinesPage = () => {
  const { api } = useAuth();
  const navigate = useNavigate();

  const { data: medicines, isLoading, isError, error } = useQuery(
    'myMedicines',
    () => fetchMyMedicines(api)
  );

  // Fetch recent orders to build a fallback "Recently Purchased" section
  const { data: ordersData } = useQuery(
    ['ordersForHistoryFallback'],
    async () => {
      const { data } = await api.get('/orders?limit=5');
      return data.orders || [];
    },
    { staleTime: 60_000 }
  );

  const mostRecentOrder = Array.isArray(ordersData) && ordersData.length > 0 ? ordersData[0] : null;
  const recentItems = mostRecentOrder?.items?.slice(0, 4) || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-secondary-900 flex items-center justify-center gap-3">
          <History size={32} /> My Medicine History
        </h1>
        <p className="text-secondary-600 mt-2">A list of medicines you have purchased previously.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
          <p className="font-bold">Error loading your medicines</p>
          <p>{error.message}</p>
        </div>
      ) : !medicines || medicines.length === 0 ? (
        <div className="space-y-6">
          <div className="text-center bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-6 rounded-lg shadow-md">
            <Pill size={48} className="mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-semibold mb-2">No Past Medicines Found</h2>
            <p className="mb-4">Start a new order or reorder from your recent purchase.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/upload-prescription"
                className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCcw size={16} /> Start a New Order
              </Link>
              <Link 
                to="/orders"
                className="inline-flex items-center gap-2 bg-secondary-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-secondary-900 transition-colors"
              >
                <Package size={16} /> View My Orders
              </Link>
            </div>
          </div>

          {mostRecentOrder && recentItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recently Purchased</h3>
                <Link to={`/orders/${mostRecentOrder._id}`} className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1">
                  Order #{mostRecentOrder._id.substring(0,8)} <ExternalLink size={14} />
                </Link>
              </div>
              <ul className="divide-y divide-secondary-200">
                {recentItems.map((it, idx) => (
                  <li key={idx} className="py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-secondary-900 truncate">
                        {it?.medicine?.name || it?.name || 'Medicine'}
                      </p>
                      <p className="text-sm text-secondary-500">Qty: {it.quantity} • ₹{(it.finalPrice ?? it.price ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const id = (it?.medicine?._id || it.medicine);
                          if (id) navigate(`/order/now/${id}`);
                        }}
                        className="text-sm px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700"
                      >
                        Order Again
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medicines.map(medicine => (
            <MedicineCard key={medicine._id} medicine={medicine} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicinesPage;
