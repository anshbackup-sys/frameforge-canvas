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
import { User, Package, MapPin, Edit, Plus, Trash2 } from "lucide-react";

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
  order_items: Array<{
    quantity: number;
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

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total,
          created_at,
          order_items (quantity)
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
      // First, set all addresses to not default
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Then set the selected address as default
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="w-4 h-4 mr-2" />
              Addresses
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Details</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editMode ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editMode ? editingProfile.full_name : profile?.full_name || ""}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, full_name: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editMode ? editingProfile.phone : profile?.phone || ""}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, phone: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <Button onClick={handleUpdateProfile} className="w-full">
                    Save Changes
                  </Button>
                )}

                <div className="border-t pt-4 mt-4">
                  <Button variant="destructive" onClick={signOut} className="w-full">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Link to="/shop">
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link key={order.id} to={`/orders/${order.id}`}>
                        <div className="p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold">#{order.order_number}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                              {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </div>
                            <div className="font-semibold">₹{order.total.toFixed(2)}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Saved Addresses</CardTitle>
                  <Dialog open={showAddAddress} onOpenChange={setShowAddAddress}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Label (e.g., Home, Office)</Label>
                          <Input
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Street Address</Label>
                          <Input
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>City</Label>
                            <Input
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>State</Label>
                            <Input
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Postal Code</Label>
                            <Input
                              value={newAddress.postal_code}
                              onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Country</Label>
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
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {address.label}
                              {address.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {address.street}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.postal_code}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {address.country}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!address.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultAddress(address.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileNew;
