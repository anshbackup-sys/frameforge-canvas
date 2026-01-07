import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
        <p className="text-gray-600">View detailed insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">Sales analytics coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Track revenue trends and growth</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
              </div>
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">Product analytics coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Discover your best sellers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              Customer Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">Customer analytics coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Understand your audience</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">Revenue analytics coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Monitor financial performance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
