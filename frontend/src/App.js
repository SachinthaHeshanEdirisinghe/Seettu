import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import CreateGroupPage from './pages/CreateGroupPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';

function App() {
  return (
    <Routes>
      {/* Guests only */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<AuthPage key="signin" mode="signin" />} />
        <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
      </Route>

      {/* Signed-in users only */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-group/:adId" element={<CreateGroupPage />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
