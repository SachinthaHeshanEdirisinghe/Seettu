import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';
import ProfileMenu from './ProfileMenu';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Seettu LK home">
          <Logo />
        </Link>
        <div className="navbar__right">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
