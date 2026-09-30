import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Home, 
  Users, 
  UserPlus, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  HandCoins
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/slices/authApiSlice';
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation } from '../store/slices/notificationsApiSlice';
import { VisitorCount } from '../components/VisitorCount';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    skip: !userInfo,
    pollingInterval: 15000,
  });
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Groups', path: '/groups', icon: Users },
    { name: 'Friends', path: '/friends', icon: UserPlus },
    { name: 'Add Expense', path: '/add-expense', icon: PlusCircle },
    { name: 'Settle Up', path: '/settle-up', icon: HandCoins },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-dvh min-h-0 bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 flex h-dvh w-[min(16rem,85vw)] flex-col bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <img src="/splitease-logo.svg" alt="" className="h-10 w-10 object-contain" />
            SplitEase
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto w-full shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
              {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userInfo?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{userInfo?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
            aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="lg:hidden absolute left-1/2 -translate-x-1/2 text-lg font-bold text-primary">SplitEase</Link>

          <div className="relative ml-auto flex items-center justify-end gap-2">
            <VisitorCount compact />
            <button
              type="button"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={isNotificationsOpen}
              onClick={() => setIsNotificationsOpen((open) => !open)}
              className="relative p-2 text-gray-400 hover:text-gray-600"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white"></span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h2 className="font-semibold text-gray-900">Notifications</h2>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length ? notifications.map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => {
                        if (!notification.isRead) markNotificationAsRead(notification._id);
                      }}
                      className={`block w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${notification.isRead ? 'text-gray-500' : 'bg-emerald-50/60 text-gray-900'}`}
                    >
                      <span className="block text-sm">{notification.message}</span>
                      <span className="mt-1 block text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</span>
                    </button>
                  )) : (
                    <p className="px-4 py-6 text-center text-sm text-gray-500">You're all caught up.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-4 pb-24 sm:p-6 sm:pb-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
