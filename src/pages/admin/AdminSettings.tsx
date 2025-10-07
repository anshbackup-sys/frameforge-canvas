import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your store settings and configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-12">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>General settings coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-12">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Payment configuration coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Shipping Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-400 text-center py-12">
              <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Shipping configuration coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
