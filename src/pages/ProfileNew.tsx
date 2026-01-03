import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  User, Package, MapPin, Edit, Plus, Trash2, ChevronRight, 
  Clock, CheckCircle, Truck, PackageCheck, XCircle, Calendar,
  CreditCard, Copy
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  tracking_number: string | null;
  payment_method: string;
  order_items: Array<{
    quantity: number;
    price: number;
    products: {
      name: string;
      image_url: string;
    };
  }>;
}

const ProfileNew = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    full_name: "",
    phone: "",
  });
  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      setEditingProfile({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
      });

      // Fetch addresses
      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (addressError) throw addressError;
      setAddresses(addressData || []);

      // Fetch orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          tracking_number,
          payment_method,
          order_items (
            quantity,
            price,
            products (
              name,
              image_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingProfile.full_name,
          phone: editingProfile.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setEditMode(false);
      fetchProfileData();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleAddAddress = async () => {
    if (!user) return;
    if (!newAddress.label || !newAddress.street || !newAddress.city || 
        !newAddress.state || !newAddress.postal_code) {
      toast.error("Please fill all address fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("addresses")
        .insert([{ ...newAddress, user_id: user.id }]);

      if (error) throw error;

      toast.success("Address added successfully");
      setShowAddAddress(false);
      setNewAddress({
        label: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
      });
      fetchProfileData();
    } catch (error: any) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Address deleted successfully");
      fetchProfileData();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;

    try {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Default address updated");
      fetchProfileData();
    } catch (error: any) {
      console.error("Error setting default address:", error);
      toast.error("Failed to update default address");
    }
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success("Tracking number copied!");
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
      pending: { 
        color: "text-amber-700", 
        bgColor: "bg-amber-50 border-amber-200", 
        icon: <Clock className="w-4 h-4" />,
        label: "Order Placed"
      },
      processing: { 
        color: "text-blue-700", 
        bgColor: "bg-blue-50 border-blue-200", 
        icon: <Package className="w-4 h-4" />,
        label: "Processing"
      },
      shipped: { 
        color: "text-purple-700", 
        bgColor: "bg-purple-50 border-purple-200", 
        icon: <Truck className="w-4 h-4" />,
        label: "Shipped"
      },
      out_for_delivery: { 
        color: "text-indigo-700", 
        bgColor: "bg-indigo-50 border-indigo-200", 
        icon: <Truck className="w-4 h-4" />,
        label: "Out for Delivery"
      },
      delivered: { 
        color: "text-green-700", 
        bgColor: "bg-green-50 border-green-200", 
        icon: <PackageCheck className="w-4 h-4" />,
        label: "Delivered"
      },
      cancelled: { 
        color: "text-red-700", 
        bgColor: "bg-red-50 border-red-200", 
        icon: <XCircle className="w-4 h-4" />,
        label: "Cancelled"
      },
    };
    return configs[status] || configs.pending;
  };

  const getOrderProgress = (status: string) => {
    const steps = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    if (status === 'cancelled') return -1;
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-8 text-foreground">My Account</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Package className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="addresses" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Addresses
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-border shadow-sm">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Profile Details</CardTitle>
                    <Button
                      variant={editMode ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {editMode ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Email Address</Label>
                      <Input value={user?.email || ""} disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Full Name</Label>
                      <Input
                        value={editMode ? editingProfile.full_name : profile?.full_name || ""}
                        onChange={(e) =>
                          setEditingProfile({ ...editingProfile, full_name: e.target.value })
                        }
                        disabled={!editMode}
                        className={!editMode ? "bg-muted/50" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Phone Number</Label>
                      <Input
                        value={editMode ? editingProfile.phone : profile?.phone || ""}
                        onChange={(e) =>
                          setEditingProfile({ ...editingProfile, phone: e.target.value })
                        }
                        disabled={!editMode}
                        className={!editMode ? "bg-muted/50" : ""}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  {editMode && (
                    <Button onClick={handleUpdateProfile} className="w-full md:w-auto">
                      Save Changes
                    </Button>
                  )}

                  <div className="border-t border-border pt-6 mt-6">
                    <Button variant="destructive" onClick={signOut}>
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-border shadow-sm">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-xl">Order History</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Package className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                      <Link to="/shop">
                        <Button>Browse Products</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const progress = getOrderProgress(order.status);
                        const totalItems = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
                        
                        return (
                          <Link key={order.id} to={`/orders/${order.id}`}>
                            <div className="group p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200">
                              {/* Order Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                  {/* Product Preview */}
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    {order.order_items[0]?.products?.image_url ? (
                                      <img 
                                        src={order.order_items[0].products.image_url} 
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-8 h-8 m-auto text-muted-foreground" />
                                    )}
                                    {order.order_items.length > 1 && (
                                      <div className="absolute bottom-0 right-0 bg-background/90 text-xs font-medium px-1.5 py-0.5 rounded-tl">
                                        +{order.order_items.length - 1}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <div className="font-semibold text-foreground">#{order.order_number}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border gap-1.5 px-3 py-1`}>
                                    {statusConfig.icon}
                                    {statusConfig.label}
                                  </Badge>
                                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              </div>

                              {/* Progress Bar */}
                              {order.status !== 'cancelled' && (
                                <div className="mb-4">
                                  <div className="flex justify-between mb-2">
                                    {['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, index) => (
                                      <div 
                                        key={step} 
                                        className={`text-xs font-medium ${index <= progress ? 'text-primary' : 'text-muted-foreground'}`}
                                      >
                                        {index === 0 || index === 4 ? step : ''}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all duration-500"
                                      style={{ width: `${((progress + 1) / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Order Footer */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="capitalize">{order.payment_method || 'COD'}</span>
                                  </div>
                                  {order.tracking_number && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        copyTrackingNumber(order.tracking_number!);
                                      }}
                                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      Track Order
                                    </button>
                                  )}
                                </div>
                                <div className="text-lg font-bold text-foreground">
                                  ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card className="border-border shadow-sm">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Saved Addresses</CardTitle>
                    <Dialog open={showAddAddress} onOpenChange={setShowAddAddress}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <Label className="text-sm">Label</Label>
                            <Input
                              value={newAddress.label}
                              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                              placeholder="Home, Office, etc."
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Street Address</Label>
                            <Input
                              value={newAddress.street}
                              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                              placeholder="123 Main Street, Apt 4B"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">City</Label>
                              <Input
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                placeholder="Mumbai"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">State</Label>
                              <Input
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                placeholder="Maharashtra"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">Postal Code</Label>
                              <Input
                                value={newAddress.postal_code}
                                onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                placeholder="400001"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Country</Label>
                              <Input
                                value={newAddress.country}
                                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button onClick={handleAddAddress} className="w-full">
                            Save Address
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {addresses.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                      <p className="text-muted-foreground">Add an address for faster checkout</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {addresses.map((address) => (
                        <div 
                          key={address.id} 
                          className={`p-5 rounded-xl border transition-colors ${
                            address.is_default 
                              ? 'border-primary/30 bg-primary/5' 
                              : 'border-border hover:border-primary/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{address.label}</span>
                              {address.is_default && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1 mb-4">
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.postal_code}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="flex gap-2">
                            {!address.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-xs"
                              >
                                Set as Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileNew;