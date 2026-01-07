import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  inStockProducts: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  image_url: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    inStockProducts: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        productsResult,
        ordersResult,
        profilesResult,
        inStockResult,
        pendingOrdersResult,
        lowStockResult,
        recentOrdersResult,
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).gt('stock', 0),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id, name, stock, image_url').gt('stock', 0).lte('stock', 5).order('stock'),
        supabase.from('orders').select('id, order_number, total, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalUsers: profilesResult.count || 0,
        totalRevenue,
        pendingOrders: pendingOrdersResult.count || 0,
        inStockProducts: inStockResult.count || 0,
        lowStockProducts: lowStockResult.data?.length || 0,
      });

      setRecentOrders(recentOrdersResult.data || []);
      setLowStockProducts(lowStockResult.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      onClick: () => navigate('/admin/orders'),
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      subtext: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/admin/orders'),
    },
    {
      title: 'Products',
      value: stats.totalProducts.toString(),
      subtext: `${stats.lowStockProducts} low stock`,
      icon: Package,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      onClick: () => navigate('/admin/products'),
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      onClick: () => navigate('/admin/users'),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="bg-white border-gray-200 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              onClick={card.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
                  {card.subtext && (
                    <p className="text-xs text-gray-400">{card.subtext}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Recent Orders
            </CardTitle>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </CardHeader>
          <CardContent className="p-4">
            {recentOrders.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/orders`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number || 'N/A'}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{Number(order.total).toLocaleString()}</p>
                      <Badge className={`${getStatusColor(order.status)} text-xs font-medium`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alert
            </CardTitle>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </CardHeader>
          <CardContent className="p-4">
            {lowStockProducts.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                  >
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-amber-600">Only {product.stock} left</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Low
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;