import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Reports</h1>
        <p className="text-slate-400">View detailed insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Sales analytics coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Product analytics coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Customer Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Customer analytics coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Revenue analytics coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
