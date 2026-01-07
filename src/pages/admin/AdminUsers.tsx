import { useEffect, useState } from 'react';
import { Search, Shield, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
  user_roles?: Array<{
    role: string;
  }>;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');

      if (profilesError) throw profilesError;

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const userIds = profilesData.map(p => p.id);
      
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const usersWithDetails = profilesData.map(profile => {
        return {
          id: profile.id,
          email: 'Email not available',
          created_at: profile.created_at,
          profiles: { full_name: profile.full_name },
          user_roles: rolesData?.filter(r => r.user_id === profile.id).map(r => ({ role: r.role })) || [],
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    try {
      if (currentlyAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
        toast.success('Admin role removed');
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
        toast.success('Admin role granted');
      }

      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = (user: User) => {
    return user.user_roles?.some(r => r.role === 'admin');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
        <p className="text-gray-600">{users.length} total users</p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by email or name..."
                className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-primary focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">User</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Email</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Joined</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const userIsAdmin = isAdmin(user);
                    return (
                      <TableRow key={user.id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            {user.profiles?.full_name || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          {userIsAdmin ? (
                            <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-0">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200">User</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAdmin(user.id, userIsAdmin)}
                            className={`border-gray-300 ${
                              userIsAdmin
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
                            }`}
                          >
                            {userIsAdmin ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
