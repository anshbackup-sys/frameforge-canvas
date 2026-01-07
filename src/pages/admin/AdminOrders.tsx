import { useEffect, useState } from 'react';
import { Search, Eye, Package, Truck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  user_id: string;
  payment_method: string;
  payment_status: string;
  tracking_number: string | null;
  shipping_address: any;
  profiles?: {
    full_name: string;
    phone: string;
  };
  order_items_count?: number;
}

interface OrderDetail extends Order {
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    products: {
      name: string;
      image_url: string;
    };
  }>;
  order_status_history: Array<{
    id: string;
    status: string;
    notes: string | null;
    created_at: string;
  }>;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'processing', label: 'Processing', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'refund_requested', label: 'Refund Requested', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData) {
        setOrders([]);
        return;
      }

      const userIds = ordersData.map(o => o.user_id).filter(Boolean);

      const { data: profilesData } = userIds.length > 0 ? await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds) : { data: [] };

      const orderIds = ordersData.map(o => o.id);
      const { data: orderItemsCounts } = orderIds.length > 0 ? await supabase
        .from('order_items')
        .select('order_id')
        .in('order_id', orderIds) : { data: [] };

      const itemCountMap = (orderItemsCounts || []).reduce((acc: any, item: any) => {
        acc[item.order_id] = (acc[item.order_id] || 0) + 1;
        return acc;
      }, {});

      const ordersWithProfiles = ordersData.map(order => ({
        ...order,
        profiles: profilesData?.find(p => p.id === order.user_id),
        order_items_count: itemCountMap[order.id] || 0
      }));

      setOrders(ordersWithProfiles);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              name,
              image_url
            )
          ),
          order_status_history (
            id,
            status,
            notes,
            created_at
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', orderData.user_id)
        .maybeSingle();

      setSelectedOrder({
        ...orderData,
        profiles: profileData || undefined
      } as OrderDetail);
      setTrackingNumber(orderData.tracking_number || '');
      setDetailDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert([{
          order_id: orderId,
          status: newStatus,
          notes: notes || null
        }]);

      if (historyError) throw historyError;

      toast.success('Order status updated successfully');
      fetchOrders();

      if (selectedOrder?.id === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleTrackingUpdate = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success('Tracking number updated');
      setTrackingDialogOpen(false);
      fetchOrders();
      fetchOrderDetails(selectedOrder.id);
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking number');
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj?.label || status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">{orders.length} total orders</p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number or customer name..."
                className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-primary focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 shadow-lg">
                <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All Status</SelectItem>
                {ORDER_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value} className="text-gray-900 hover:bg-gray-100">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">Order Number</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Customer</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Items</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Total</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Payment</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-gray-200 hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {order.order_number || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div>
                          <div className="font-medium">{order.profiles?.full_name || 'Unknown'}</div>
                          {order.profiles?.phone && (
                            <div className="text-xs text-gray-500">{order.profiles.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div>{format(new Date(order.created_at), 'MMM dd, yyyy')}</div>
                        <div className="text-xs text-gray-500">{format(new Date(order.created_at), 'hh:mm a')}</div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {order.order_items_count || 0}
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        ₹{order.total?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">{order.payment_method?.toUpperCase() || 'COD'}</div>
                          <Badge className={`mt-1 ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                            {order.payment_status || 'pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-44 bg-white border-gray-300">
                            <Badge className={`${getStatusColor(order.status)} border`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 shadow-lg">
                            {ORDER_STATUSES.map(status => (
                              <SelectItem key={status.value} value={status.value} className="text-gray-900 hover:bg-gray-100">
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-primary hover:bg-primary/10"
                          onClick={() => fetchOrderDetails(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Order Details - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription className="text-gray-600">
              Order placed on {selectedOrder && format(new Date(selectedOrder.created_at), 'MMMM dd, yyyy hh:mm a')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                      <FileText className="h-4 w-4" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 text-gray-900 font-medium">{selectedOrder.profiles?.full_name || 'Unknown'}</span>
                      </div>
                      {selectedOrder.profiles?.phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          <span className="ml-2 text-gray-900">{selectedOrder.profiles.phone}</span>
                        </div>
                      )}
                      {selectedOrder.shipping_address && (
                        <div>
                          <span className="text-gray-500">Address:</span>
                          <div className="ml-2 text-gray-900">
                            {typeof selectedOrder.shipping_address === 'string'
                              ? selectedOrder.shipping_address
                              : JSON.stringify(selectedOrder.shipping_address)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                      <Truck className="h-4 w-4" />
                      Shipping & Payment
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="ml-2 text-gray-900 font-medium">{selectedOrder.payment_method?.toUpperCase() || 'COD'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Payment Status:</span>
                        <Badge className={`ml-2 ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedOrder.payment_status || 'pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Tracking:</span>
                        <span className="text-gray-900">{selectedOrder.tracking_number || 'Not added'}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTrackingDialogOpen(true)}
                          className="ml-auto text-xs border-gray-300 hover:bg-gray-100"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 text-gray-900">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <img
                          src={item.products?.image_url || '/placeholder.svg'}
                          alt={item.products?.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.products?.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900">₹{item.price?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">₹{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Status History */}
              {selectedOrder.order_status_history?.length > 0 && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-gray-900">Status History</h3>
                    <div className="space-y-2">
                      {selectedOrder.order_status_history
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((history) => (
                          <div key={history.id} className="flex items-center gap-3 text-sm">
                            <Badge className={getStatusColor(history.status)}>
                              {getStatusLabel(history.status)}
                            </Badge>
                            <span className="text-gray-500">
                              {format(new Date(history.created_at), 'MMM dd, yyyy hh:mm a')}
                            </span>
                            {history.notes && (
                              <span className="text-gray-600">- {history.notes}</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking Number Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Update Tracking Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking" className="text-gray-700">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter tracking number"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTrackingDialogOpen(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button onClick={handleTrackingUpdate} className="bg-primary hover:bg-primary/90">
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
