import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../components/ui/SplashScreen';

/** Only signed-in users can see the child routes. Others go to /login. */
function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <SplashScreen />;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export default ProtectedRoute;
