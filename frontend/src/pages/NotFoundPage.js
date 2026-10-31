import { Link } from 'react-router-dom';
import { LogoMark } from '../components/ui/Logo';

function NotFoundPage() {
  return (
    <div className="splash">
      <LogoMark size={52} />
      <h1 className="splash__title">Page not found</h1>
      <p className="splash__text">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn--primary">
        Go to home
      </Link>
    </div>
  );
}

export default NotFoundPage;
