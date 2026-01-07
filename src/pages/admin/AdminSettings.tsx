import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, CreditCard, Truck, Store } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your store settings and configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">General settings coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Configure store name, logo, and contact info</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">Payment configuration coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Set up Razorpay, COD, and other payment methods</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              Shipping Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-600">Shipping configuration coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Manage shipping zones, rates, and carriers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
