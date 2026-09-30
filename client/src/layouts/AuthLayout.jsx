import { Outlet, useLocation } from 'react-router-dom';
import FriendsWelcome from '../components/FriendsWelcome';

const AuthLayout = () => {
  const { pathname } = useLocation();
  const isLogin = pathname === '/login';

  return (
    <div className="min-h-dvh bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 sm:p-6">
      {isLogin ? (
        <main className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-14">
          <div className="order-1 mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl lg:order-2">
            <Outlet />
          </div>
          <div className="order-2 lg:order-1">
            <FriendsWelcome />
          </div>
        </main>
      ) : (
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
