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
import { useNavigate } from 'react-router-dom';
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
  { value: 'pending', label: 'Pending', color: 'bg-yellow-600' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-600' },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-600' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-600' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-violet-600' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-600' },
  { value: 'refund_requested', label: 'Refund Requested', color: 'bg-orange-600' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-600' },
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
  const navigate = useNavigate();

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
    return statusObj?.color || 'bg-slate-600';
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
        <div className="h-8 bg-slate-700 rounded w-48 animate-pulse"></div>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
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
        <h1 className="text-3xl font-bold text-white mb-2">Orders Management</h1>
        <p className="text-slate-400">{orders.length} total orders</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by order number or customer name..."
                className="pl-10 bg-slate-900 border-slate-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                {ORDER_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-slate-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-900/50 hover:bg-slate-900/50 border-slate-700">
                  <TableHead className="text-slate-300">Order Number</TableHead>
                  <TableHead className="text-slate-300">Customer</TableHead>
                  <TableHead className="text-slate-300">Date</TableHead>
                  <TableHead className="text-slate-300">Items</TableHead>
                  <TableHead className="text-slate-300">Total</TableHead>
                  <TableHead className="text-slate-300">Payment</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-slate-700 hover:bg-slate-800/30">
                      <TableCell className="font-medium text-white">
                        {order.order_number || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div>
                          <div className="font-medium">{order.profiles?.full_name || 'Unknown'}</div>
                          {order.profiles?.phone && (
                            <div className="text-xs text-slate-500">{order.profiles.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div>{format(new Date(order.created_at), 'MMM dd, yyyy')}</div>
                        <div className="text-xs text-slate-500">{format(new Date(order.created_at), 'hh:mm a')}</div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {order.order_items_count || 0}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        ₹{order.total?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium text-white">{order.payment_method?.toUpperCase() || 'COD'}</div>
                          <Badge className="mt-1" variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {order.payment_status || 'pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            {ORDER_STATUSES.map(status => (
                              <SelectItem key={status.value} value={status.value}>
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
                          className="text-slate-400 hover:text-blue-400"
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
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Order placed on {selectedOrder && format(new Date(selectedOrder.created_at), 'MMMM dd, yyyy hh:mm a')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-400">Name:</span>
                        <span className="ml-2 text-white">{selectedOrder.profiles?.full_name || 'Unknown'}</span>
                      </div>
                      {selectedOrder.profiles?.phone && (
                        <div>
                          <span className="text-slate-400">Phone:</span>
                          <span className="ml-2 text-white">{selectedOrder.profiles.phone}</span>
                        </div>
                      )}
                      {selectedOrder.shipping_address && (
                        <div>
                          <span className="text-slate-400">Address:</span>
                          <div className="ml-2 text-white">
                            {typeof selectedOrder.shipping_address === 'string'
                              ? selectedOrder.shipping_address
                              : JSON.stringify(selectedOrder.shipping_address)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Shipping & Payment
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-400">Payment Method:</span>
                        <span className="ml-2 text-white">{selectedOrder.payment_method?.toUpperCase() || 'COD'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Payment Status:</span>
                        <Badge className="ml-2" variant={selectedOrder.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {selectedOrder.payment_status || 'pending'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-400">Tracking Number:</span>
                        <span className="ml-2 text-white">{selectedOrder.tracking_number || 'Not assigned'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 text-xs"
                          onClick={() => setTrackingDialogOpen(true)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-900 rounded">
                        <img
                          src={item.products.image_url || '/placeholder.svg'}
                          alt={item.products.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.products.name}</div>
                          <div className="text-sm text-slate-400">
                            Quantity: {item.quantity} × ₹{item.price?.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right font-semibold">
                          ₹{(item.quantity * item.price)?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-700 font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Status History</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_status_history?.map((history: any) => (
                      <div key={history.id} className="flex gap-3 p-3 bg-slate-900 rounded">
                        <Badge className={getStatusColor(history.status)}>
                          {getStatusLabel(history.status)}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-sm text-slate-400">
                            {format(new Date(history.created_at), 'MMM dd, yyyy hh:mm a')}
                          </div>
                          {history.notes && (
                            <div className="text-sm mt-1">{history.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Update Tracking Number</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter the tracking number for this order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-slate-800 border-slate-700"
                placeholder="Enter tracking number"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTrackingUpdate}>
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
