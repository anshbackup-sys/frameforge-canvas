# Kaiga - Premium Frame E-Commerce Platform

A modern e-commerce platform for premium photo frames with a comprehensive admin panel.

## Project info

**URL**: https://lovable.dev/projects/3d61e044-0635-42b9-ba99-4eccb49342ba

## Admin Panel

This project includes a fully functional admin panel for managing products, orders, and users.

### Quick Access
- **Admin Login**: Navigate to `/admin/login`
- **Documentation**: See [ADMIN_QUICK_START.md](./ADMIN_QUICK_START.md) for setup guide

### Admin Features
- Dashboard with real-time statistics
- Complete product management (CRUD operations)
- Order management with status updates
- User management with role assignment
- Secure authentication with role-based access control

### Getting Started with Admin
1. Create a user account via the signup page
2. Grant admin role using the SQL script in [CREATE_ADMIN_USER.sql](./CREATE_ADMIN_USER.sql)
3. Login at `/admin/login`
4. Start managing your store!

### Admin Documentation
- [ADMIN_QUICK_START.md](./ADMIN_QUICK_START.md) - Quick start guide
- [ADMIN_PANEL_GUIDE.md](./ADMIN_PANEL_GUIDE.md) - Complete user guide
- [ADMIN_ROUTES.md](./ADMIN_ROUTES.md) - Route reference
- [ADMIN_IMPLEMENTATION_SUMMARY.md](./ADMIN_IMPLEMENTATION_SUMMARY.md) - Technical details

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3d61e044-0635-42b9-ba99-4eccb49342ba) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3d61e044-0635-42b9-ba99-4eccb49342ba) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
