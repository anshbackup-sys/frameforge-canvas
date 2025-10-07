# Kaiga Admin Panel Guide

## Overview

The Kaiga Admin Panel is a comprehensive management system that allows administrators to manage all aspects of the e-commerce store including products, orders, users, and analytics.

## Accessing the Admin Panel

### Admin Login
- Navigate to `/admin/login` to access the admin login page
- Only users with admin role can access the admin panel
- Non-admin users will be redirected to the home page

### First Time Setup

To create your first admin user, you need to add the admin role to a user in the database:

1. Create a regular user account through the normal signup process
2. Run this SQL query in your Supabase SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

Replace `YOUR_USER_ID_HERE` with the actual user ID from the `auth.users` table.

## Features

### 1. Dashboard
- Overview of key metrics (revenue, orders, products, users)
- Real-time statistics
- Quick access to important information

### 2. Products Management
- **View Products**: Browse all products with filtering and search
- **Add Product**: Create new product listings
- **Edit Product**: Update existing product details
- **Delete Product**: Remove products from the store
- **Product Details**:
  - Name, description, price
  - Category, material, size, color, finish
  - Stock management
  - Featured product toggle
  - Image URL

### 3. Orders Management
- **View Orders**: See all customer orders
- **Filter Orders**: Filter by status (pending, processing, shipped, delivered, cancelled)
- **Search Orders**: Search by order number or customer name
- **Update Status**: Change order status directly from the list
- **Order Details**: View complete order information

### 4. Users Management
- **View Users**: See all registered users
- **Search Users**: Find users by email or name
- **Manage Roles**: Grant or revoke admin privileges
- **User Information**: View registration date and current role

### 5. Analytics (Coming Soon)
- Sales overview
- Top products
- Customer insights
- Revenue trends

### 6. Settings (Coming Soon)
- General store settings
- Payment configuration
- Shipping settings

## Database Structure

### Admin-Specific Tables

#### admin_activity_logs
Tracks all admin actions for audit purposes:
- `id`: UUID (primary key)
- `admin_id`: UUID (references auth.users)
- `action`: Text (type of action)
- `entity_type`: Text (product, order, user, etc.)
- `entity_id`: UUID (ID of affected entity)
- `details`: JSONB (additional details)
- `ip_address`: Text
- `created_at`: Timestamp

#### Enhanced Tables
- `products`: Added `created_by`, `updated_by`, `updated_at`
- `orders`: Added `admin_notes` for internal notes

### Row Level Security (RLS)

All admin operations are protected by RLS policies that check the user's admin role:
- Admins can perform full CRUD operations on products
- Admins can view and manage all orders
- Admins can view all user profiles and manage roles
- All admin actions respect proper security boundaries

## Security Features

1. **Role-Based Access Control**: Only users with admin role can access the panel
2. **Protected Routes**: All admin routes require authentication and admin privileges
3. **Secure Login**: Separate login page with enhanced security
4. **Audit Logging**: All admin actions can be tracked (database ready)
5. **RLS Policies**: Database-level security ensures data protection

## Admin Workflow Examples

### Adding a New Product
1. Navigate to Products → Add Product
2. Fill in product details
3. Set price and stock quantity
4. Toggle "Featured" if needed
5. Click "Create Product"

### Managing Orders
1. Go to Orders section
2. Use filters to find specific orders
3. Click on status badge to change order status
4. View full order details by clicking the eye icon

### Granting Admin Access
1. Navigate to Users section
2. Find the user you want to promote
3. Click "Make Admin" button
4. User will now have admin access

## Technical Details

### Tech Stack
- React with TypeScript
- Supabase for backend and database
- shadcn/ui for UI components
- TailwindCSS for styling
- React Router for navigation

### Key Components
- `AdminContext`: Manages admin authentication state
- `ProtectedAdminRoute`: Wrapper for admin-only routes
- `AdminLayout`: Main layout with sidebar navigation
- Various admin page components for each module

## Troubleshooting

### Cannot Login to Admin Panel
- Ensure your user has the admin role in the `user_roles` table
- Check database connection
- Verify RLS policies are properly configured

### Changes Not Saving
- Check browser console for errors
- Verify database permissions
- Ensure RLS policies allow admin operations

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache with `npm run build` again

## Future Enhancements

Planned features for future releases:
- Order detail view page
- Bulk product operations
- Advanced analytics with charts
- Email notification settings
- Image upload functionality
- Export reports (CSV, PDF)
- Activity log viewer
- Product inventory alerts
- Customer management tools

## Support

For issues or questions:
1. Check this guide first
2. Review the database RLS policies
3. Check browser console for errors
4. Verify Supabase connection

---

**Note**: This admin panel is designed to work seamlessly with the existing Kaiga e-commerce platform while maintaining complete separation of concerns between admin and customer-facing features.
