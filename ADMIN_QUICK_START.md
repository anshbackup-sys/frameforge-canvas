# Admin Panel Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Create Your Admin Account

First, create a regular user account:
1. Go to `/login` on your website
2. Click "Sign Up"
3. Enter your email and password
4. Complete registration

### Step 2: Grant Admin Privileges

Run this SQL query in your Supabase SQL Editor:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then, grant admin role (replace YOUR_USER_ID with actual ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify it worked
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

### Step 3: Access Admin Panel

1. Navigate to `/admin/login`
2. Enter your credentials
3. You're in! 🎉

---

## 🎯 Common Tasks

### Add a New Product
1. Go to **Products** → Click **Add Product**
2. Fill in the form:
   - Product Name (required)
   - Category (required)
   - Price (required)
   - Stock quantity (required)
   - Description, material, size, color, finish (optional)
3. Toggle "Featured" if needed
4. Click **Create Product**

### Update Order Status
1. Go to **Orders**
2. Find the order (use search if needed)
3. Click the status badge dropdown
4. Select new status
5. Done! Status updated automatically

### Make Someone an Admin
1. Go to **Users**
2. Find the user (use search bar)
3. Click **Make Admin** button
4. Confirm - they now have admin access

### View Store Statistics
1. Go to **Dashboard** (home page)
2. See all key metrics:
   - Total revenue
   - Order count
   - Product count
   - User count

---

## 📍 Admin Panel Routes

| Page | URL | What You Can Do |
|------|-----|-----------------|
| **Dashboard** | `/admin` | View stats and overview |
| **Products** | `/admin/products` | Manage all products |
| **Orders** | `/admin/orders` | View and update orders |
| **Users** | `/admin/users` | Manage users and roles |
| **Analytics** | `/admin/analytics` | View analytics (coming soon) |
| **Settings** | `/admin/settings` | Configure store (coming soon) |

---

## 🔐 Security Notes

### Important
- Only users with admin role can access `/admin/*` routes
- Regular users are automatically blocked
- Admin role is stored securely in the database
- All admin actions respect database security policies

### To Remove Admin Access
```sql
DELETE FROM public.user_roles
WHERE user_id = 'USER_ID_HERE' AND role = 'admin';
```

---

## 💡 Pro Tips

### Search Like a Pro
- **Products**: Search by name or category
- **Orders**: Search by order number or customer name
- **Users**: Search by email or full name

### Keyboard Shortcuts
- Press the **menu icon** to collapse/expand sidebar
- Use **Tab** to navigate through forms quickly

### Status Indicators
- 🟢 Green = Good (delivered, in stock)
- 🟡 Yellow = Warning (low stock, pending)
- 🔵 Blue = Processing
- 🔴 Red = Issue (out of stock, cancelled)

---

## 🐛 Troubleshooting

### Can't Login to Admin?
✅ Check: Do you have the admin role in the database?
```sql
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
```

### Don't See Any Products?
✅ Check: Are there products in the database?
```sql
SELECT COUNT(*) FROM products;
```

### Changes Not Saving?
✅ Check: Browser console for errors (F12 → Console tab)
✅ Check: Database connection in Supabase dashboard

---

## 📚 Need More Help?

Detailed documentation available:
- **ADMIN_PANEL_GUIDE.md** - Complete user guide
- **ADMIN_ROUTES.md** - All routes explained
- **ADMIN_IMPLEMENTATION_SUMMARY.md** - Technical details
- **CREATE_ADMIN_USER.sql** - SQL helper script

---

## 🎓 Learning Path

### Beginner (Week 1)
1. Create admin account
2. Add 5-10 products
3. Update product details
4. Practice searching

### Intermediate (Week 2)
1. Manage orders
2. Update order statuses
3. Manage users
4. Grant admin access to team member

### Advanced (Week 3+)
1. Monitor dashboard metrics
2. Analyze product performance
3. Manage user roles effectively
4. Customize settings (when available)

---

## ✨ What's Next?

The admin panel currently supports:
- ✅ Product management
- ✅ Order management
- ✅ User management
- ✅ Basic dashboard

Coming soon:
- 📊 Advanced analytics with charts
- 📧 Email notifications
- 📤 Export reports
- 📁 Bulk operations
- 🖼️ Image upload

---

## 🎉 Success!

You now have a fully functional admin panel. Start managing your store with confidence!

**Remember**: With great power comes great responsibility. Always double-check before deleting products or modifying orders.

---

**Questions?** Check the detailed documentation files included in the project.

**Happy Administrating! 🚀**
