import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../components/ui/SplashScreen';

/** Login / signup are only for guests. Signed-in users are sent back to where they came from, or home. */
function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <SplashScreen />;
  if (status === 'authed') {
    const target = location.state?.from?.pathname || '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

export default PublicOnlyRoute;
