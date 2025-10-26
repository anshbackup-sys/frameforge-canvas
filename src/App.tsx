import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import CustomBuilder from "./pages/CustomBuilder";
import Cart from "./pages/CartNew";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetail from "./pages/OrderDetail";
import ProfileNew from "./pages/ProfileNew";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import About from "./pages/About";
import Bundles from "./pages/Bundles";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductEditor from "./pages/admin/AdminProductEditor";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCollections from "./pages/admin/AdminCollections";
import AdminBundles from "./pages/admin/AdminBundles";
import AdminFrameBuilder from "./pages/admin/AdminFrameBuilder";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/custom-builder" element={<CustomBuilder />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/orders/:orderId" element={<OrderDetail />} />
                  <Route path="/profile" element={<ProfileNew />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/bundles" element={<Bundles />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collection/:id" element={<CollectionDetail />} />

                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminDashboard />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminProducts />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/new"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminProductEditor />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products/edit/:id"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminProductEditor />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminOrders />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminUsers />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminAnalytics />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminSettings />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/collections"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminCollections />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/bundles"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminBundles />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/frame-builder"
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <AdminFrameBuilder />
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
