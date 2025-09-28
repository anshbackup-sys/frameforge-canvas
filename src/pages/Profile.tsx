import { useState } from "react";
import { User, Settings, Package, Heart, CreditCard, MapPin, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Profile = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    avatar: "",
    joinedDate: "March 2024",
    totalOrders: 12,
    totalSpent: 45680
  });

  const recentOrders = [
    {
      id: "KGA-001",
      date: "2024-03-15",
      status: "Delivered",
      total: 2499,
      items: 2
    },
    {
      id: "KGA-002", 
      date: "2024-03-10",
      status: "In Transit",
      total: 1299,
      items: 1
    },
    {
      id: "KGA-003",
      date: "2024-03-05",
      status: "Processing",
      total: 3999,
      items: 3
    }
  ];

  const wishlistItems = [
    {
      id: 1,
      name: "Cosmic Black Frame",
      price: 1999,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Starfield Collection Set",
      price: 4999,
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-cosmic-gray">
      <Header />
      
      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Member since:</span>
                    <span className="font-medium">{user.joinedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-medium">{user.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="font-medium">₹{user.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">Order #{order.id}</h3>
                              <Badge 
                                variant={
                                  order.status === "Delivered" ? "default" :
                                  order.status === "In Transit" ? "secondary" :
                                  "outline"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.date} • {order.items} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{order.total.toLocaleString()}</p>
                            <Button variant="outline" size="sm" className="mt-2" asChild>
                              <Link to={`/orders/${order.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Wishlist ({wishlistItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{item.name}</h3>
                            <p className="text-lg font-bold mb-2">₹{item.price.toLocaleString()}</p>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1">Add to Cart</Button>
                              <Button variant="outline" size="sm">Remove</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Saved Addresses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Home</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              123 Cosmic Street<br />
                              Starfield City, Universe 400001<br />
                              Maharashtra, India
                            </p>
                          </div>
                          <Badge>Default</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Add New Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue={user.phone} />
                    </div>
                    
                    <Button className="w-full">Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;