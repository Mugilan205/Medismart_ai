import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { TrendingUp, DollarSign, Package, Users, Calendar, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { api } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalMedicines: 0,
    totalCustomers: 0,
    recentOrders: [],
    topMedicines: [],
    monthlyRevenue: [],
    lowStockItems: []
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const computeFromOrders = (orders) => {
    const days = parseInt(dateRange || '30', 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const inRange = orders.filter(o => {
      const d = new Date(o.createdAt || o.updatedAt || Date.now());
      return d >= since;
    });

    const totalOrders = inRange.length;
    const delivered = inRange.filter(o => o.status === 'delivered');
    const totalRevenue = delivered.reduce((sum, o) => sum + Number(o?.pricing?.total ?? o?.totalAmount ?? 0), 0);

    const customersSet = new Set();
    inRange.forEach(o => {
      const id = o?.patient?._id || o?.patientId || o?.patient?.email;
      if (id) customersSet.add(id);
    });

    // Top medicines by quantity and revenue
    const medMap = new Map();
    inRange.forEach(o => {
      (o.items || []).forEach(it => {
        const name = it?.medicine?.name || it?.name || 'Medicine';
        const qty = Number(it?.quantity || 0);
        const price = Number(it?.finalPrice ?? it?.price ?? 0);
        if (!medMap.has(name)) medMap.set(name, { _id: name, name, totalSold: 0, revenue: 0 });
        const rec = medMap.get(name);
        rec.totalSold += qty;
        rec.revenue += price;
      });
    });
    const topMedicines = Array.from(medMap.values()).sort((a,b)=> b.totalSold - a.totalSold);

    // Monthly revenue buckets (by YYYY-MM)
    const monthMap = new Map();
    inRange.forEach(o => {
      const d = new Date(o.createdAt || o.updatedAt || Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const amt = Number(o?.pricing?.total ?? o?.totalAmount ?? 0);
      if (!monthMap.has(key)) monthMap.set(key, 0);
      if (o.status === 'delivered') monthMap.set(key, monthMap.get(key) + amt);
    });
    const monthlyRevenue = Array.from(monthMap.entries())
      .sort((a,b)=> a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({ month, revenue }));

    const recentOrders = inRange
      .sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0))
      .slice(0, 10)
      .map(o => ({
        _id: o._id,
        orderNumber: o.orderNumber || o._id?.slice(-6) || '',
        customer: { name: o?.patient?.name || 'N/A' },
        createdAt: o.createdAt,
        totalAmount: Number(o?.pricing?.total ?? o?.totalAmount ?? 0),
        status: o.status,
      }));

    return {
      totalRevenue,
      totalOrders,
      totalMedicines: undefined, // left for inventory endpoint if available
      totalCustomers: customersSet.size,
      recentOrders,
      topMedicines,
      monthlyRevenue,
      lowStockItems: [],
    };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Try backend analytics first
      try {
        const response = await api.get(`/pharmacy/analytics?days=${dateRange}`);
        const server = response.data.analytics;
        if (server && Object.keys(server).length) {
          setAnalytics(server);
          return;
        }
      } catch (e) {
        // Fall through to computing from orders
      }

      // Fallback: compute from orders so it's always in sync
      const ordersRes = await api.get('/pharmacy/orders');
      const orders = ordersRes.data?.orders || [];
      const computed = computeFromOrders(orders);
      setAnalytics(prev => ({ ...prev, ...computed }));
    } catch (error) {
      console.error('Failed to load analytics, computing from orders failed:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="text-3xl font-bold text-secondary-900">{value}</p>
          {change && (
            <p className={`text-sm flex items-center gap-1 mt-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={14} />
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Analytics & Reports</h2>
          <p className="text-secondary-600">Track your pharmacy performance</p>
        </div>
        <div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-secondary-500">Loading analytics...</div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`₹${analytics.totalRevenue?.toLocaleString() || 0}`}
              icon={<DollarSign className="text-green-600" size={24} />}
              color="bg-green-100"
              change={analytics.revenueChange}
            />
            <StatCard
              title="Total Orders"
              value={analytics.totalOrders || 0}
              icon={<Package className="text-blue-600" size={24} />}
              color="bg-blue-100"
              change={analytics.ordersChange}
            />
            <StatCard
              title="Average Order Value"
              value={`₹${(analytics.totalOrders ? Math.round((analytics.totalRevenue || 0) / analytics.totalOrders) : 0).toLocaleString()}`}
              icon={<BarChart3 className="text-purple-600" size={24} />}
              color="bg-purple-100"
            />
            <StatCard
              title="Active Customers"
              value={analytics.totalCustomers || 0}
              icon={<Users className="text-orange-600" size={24} />}
              color="bg-orange-100"
              change={analytics.customersChange}
            />
          </div>

          {/* Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Medicines */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Top Selling Medicines</h3>
              <div className="space-y-3">
                {analytics.topMedicines?.length > 0 ? (
                  analytics.topMedicines.slice(0, 5).map((medicine, index) => (
                    <div key={medicine._id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{medicine.name}</p>
                          <p className="text-sm text-secondary-600">{medicine.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-900">{medicine.totalSold} sold</p>
                        <p className="text-sm text-secondary-600">₹{medicine.revenue}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary-500 text-center py-4">No sales data available</p>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Low Stock Alert</h3>
              <div className="space-y-3">
                {analytics.lowStockItems?.length > 0 ? (
                  analytics.lowStockItems.slice(0, 5).map((medicine) => (
                    <div key={medicine._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-secondary-900">{medicine.name}</p>
                        <p className="text-sm text-secondary-600">{medicine.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{medicine.stock} left</p>
                        <p className="text-sm text-secondary-600">Min: {medicine.minStock}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary-500 text-center py-4">No low stock alerts available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Order</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {analytics.recentOrders?.length > 0 ? (
                    analytics.recentOrders.slice(0, 10).map((order) => (
                      <tr key={order._id} className="hover:bg-secondary-50">
                        <td className="px-4 py-2 text-sm font-medium text-secondary-900">
                          {order.orderNumber ? `#${order.orderNumber}` : `#${String(order._id).slice(-6)}`}
                        </td>
                        <td className="px-4 py-2 text-sm text-secondary-900">
                          {order.customer?.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-secondary-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-secondary-900">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' 
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-secondary-500">
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Line Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyRevenue || []} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v)=>`₹${v}`} width={60} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v)=>[`₹${v}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Medicines Revenue Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Top Medicines by Revenue</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(analytics.topMedicines || []).slice(0,8)} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(v)=>`₹${v}`} width={60} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v)=>[`₹${v}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
