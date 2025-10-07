# Admin Panel Routes Reference

## Public Routes (No Authentication Required)

### Admin Login
- **Path**: `/admin/login`
- **Description**: Secure login page for administrators
- **Features**:
  - Email/password authentication
  - Admin role verification
  - Automatic redirect if already logged in

## Protected Admin Routes (Require Admin Role)

All routes below require:
1. User must be authenticated
2. User must have 'admin' role in user_roles table
3. Non-admin users are automatically redirected to home page

### Dashboard
- **Path**: `/admin`
- **Description**: Main admin dashboard with key metrics
- **Features**:
  - Total revenue display
  - Order statistics
  - Product count
  - User count
  - Recent activity overview

### Products Management
- **Path**: `/admin/products`
- **Description**: List and manage all products
- **Features**:
  - Search products
  - View product details
  - Edit products
  - Delete products
  - Stock status indicators

### Add New Product
- **Path**: `/admin/products/new`
- **Description**: Create a new product listing
- **Features**:
  - Product information form
  - Price and stock management
  - Category and material selection
  - Featured product toggle

### Edit Product
- **Path**: `/admin/products/edit/:id`
- **Description**: Edit existing product details
- **Features**:
  - Pre-populated product form
  - Update all product fields
  - Save changes

### Orders Management
- **Path**: `/admin/orders`
- **Description**: View and manage customer orders
- **Features**:
  - Order list with status
  - Search by order number or customer
  - Filter by order status
  - Update order status
  - View order details

### Users Management
- **Path**: `/admin/users`
- **Description**: Manage user accounts and roles
- **Features**:
  - View all registered users
  - Search users by email or name
  - Grant/revoke admin privileges
  - View user registration date

### Analytics
- **Path**: `/admin/analytics`
- **Description**: View store analytics and reports
- **Status**: Coming Soon
- **Planned Features**:
  - Sales trends
  - Top products
  - Customer insights
  - Revenue analysis

### Settings
- **Path**: `/admin/settings`
- **Description**: Configure store settings
- **Status**: Coming Soon
- **Planned Features**:
  - General settings
  - Payment configuration
  - Shipping settings
  - Email templates

## Navigation

### Sidebar Menu
The admin panel includes a persistent sidebar with:
- Dashboard
- Products
- Orders
- Users
- Analytics
- Settings

### Header
- Toggle sidebar button
- Page title and description
- Notification bell (placeholder)
- User profile with sign out option

## Access Control Flow

```
User visits /admin/*
  → Check if authenticated
    → No: Redirect to /admin/login
    → Yes: Check if admin role
      → No: Redirect to / (home)
      → Yes: Show admin content
```

## Quick Start

1. Create a user account via `/login`
2. Grant admin role via SQL (see CREATE_ADMIN_USER.sql)
3. Navigate to `/admin/login`
4. Enter credentials
5. Access granted to `/admin` dashboard

## Security Notes

- All admin routes use `ProtectedAdminRoute` wrapper
- Database operations are protected by RLS policies
- Admin status is verified on every route access
- Unauthorized access attempts are blocked automatically
