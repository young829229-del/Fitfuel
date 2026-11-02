import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLogin from './AdminLogin';
import { 
  LayoutDashboard, 
  Package, 
  Image as ImageIcon, 
  Sliders, 
  ShoppingCart, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-500">Authenticating Administrator...</p>
      </div>
    );
  }

  // Not authenticated as admin -> Show dedicated Admin Login Portal
  if (!isAdmin) {
    return <AdminLogin />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', end: false, label: 'Products', icon: Package },
    { to: '/admin/banners', end: false, label: 'Banners', icon: ImageIcon },
    { to: '/admin/homepage', end: false, label: 'Homepage Sections', icon: Sliders },
    { to: '/admin/orders', end: false, label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row font-sans text-neutral-900">
      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-black text-white px-5 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <img 
            src="/public/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg" 
            alt="FitFul Nepal" 
            className="w-8 h-8 rounded-full border border-neutral-700 object-cover" 
          />
          <span className="font-extrabold text-sm uppercase tracking-wider">FitFul Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-neutral-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-64 bg-black text-white flex flex-col justify-between p-6 z-50 transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0">
              <img 
                src="/public/assets/aistudio/tiktok_video_dt6Np_d66a1b63.jpeg" 
                alt="FitFul Nepal Logo" 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight uppercase leading-none">FitFul Nepal</div>
              <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin Studio
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all
                    ${isActive 
                      ? 'bg-neutral-800 text-white shadow-inner font-black border-l-4 border-yellow-500' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer with User info & logout */}
        <div className="pt-6 border-t border-neutral-800 space-y-4">
          <div className="px-2">
            <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="truncate">{user?.email || 'young829229@gmail.com'}</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Role: Super Administrator</div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              target="_blank"
              className="w-full py-2 px-3 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Storefront
            </Link>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-red-400 hover:text-red-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
