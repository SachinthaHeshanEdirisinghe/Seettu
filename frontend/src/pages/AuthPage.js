import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, Lock, Mail, Moon, Phone, Sun, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Field from '../components/ui/Field';
import Logo from '../components/ui/Logo';
import { getErrorMessage } from '../utils';

const EMPTY_FORM = { name: '', phone: '', email: '', password: '' };

const POINTS = [
  'Pick a product and start a circle in a minute.',
  'Add members by name and phone number.',
  'Everyone pays the total ÷ 10 each month.',
];

function Rings() {
  return (
    <svg className="rings" viewBox="0 0 400 400" aria-hidden focusable="false">
      <circle cx="200" cy="200" r="60" />
      <circle cx="200" cy="200" r="110" />
      <circle cx="200" cy="200" r="160" />
      <circle cx="200" cy="200" r="210" />
      <circle cx="200" cy="140" r="7" className="rings__dot" />
      <circle cx="252" cy="230" r="7" className="rings__dot" />
      <circle cx="148" cy="230" r="7" className="rings__dot" />
      <circle cx="200" cy="40" r="6" className="rings__dot rings__dot--soft" />
      <circle cx="338" cy="280" r="6" className="rings__dot rings__dot--soft" />
      <circle cx="62" cy="280" r="6" className="rings__dot rings__dot--soft" />
    </svg>
  );
}

/** One component for both /login and /signup. */
function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { signIn, signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const notify = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!email || !password || (isSignup && (!name || !phone))) {
      setError('Please fill all required fields.');
      return;
    }
    if (isSignup && password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) await signUp({ name, phone, email, password });
      else await signIn({ email, password });
      notify.success(isSignup ? 'Account created. Welcome!' : 'Signed in successfully.');
      // PublicOnlyRoute redirects to the home page once the session is set.
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth__brand">
        <Rings />
        <div className="auth__brand-inner">
          <Logo size={40} />
          <h2 className="auth__headline">Buy together.<br />Pay a little each month.</h2>
          <ul className="auth__points">
            {POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth__main">
        <button
          type="button"
          className="icon-btn auth__theme"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
        </button>

        <section className="auth__panel">
          <div className="auth__mobile-logo">
            <Logo size={34} />
          </div>

          <h1 className="auth__title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="auth__subtitle">
            {isSignup
              ? 'Join Seettu LK to start or join a buying circle.'
              : 'Sign in to manage your buying circles.'}
          </p>

          <nav className="tabs" aria-label="Account">
            <Link to="/login" className={`tabs__item ${!isSignup ? 'is-active' : ''}`} aria-current={!isSignup ? 'page' : undefined}>
              Sign in
            </Link>
            <Link to="/signup" className={`tabs__item ${isSignup ? 'is-active' : ''}`} aria-current={isSignup ? 'page' : undefined}>
              Sign up
            </Link>
          </nav>

          {error && (
            <div className="alert alert--error" role="alert">
              <CircleAlert size={18} aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth__form" noValidate>
            {isSignup && (
              <>
                <Field
                  id="auth-name"
                  name="name"
                  label="Name"
                  icon={User}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  autoComplete="name"
                />
                <Field
                  id="auth-phone"
                  name="phone"
                  label="Phone number"
                  icon={Phone}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0771234567"
                  autoComplete="tel"
                />
              </>
            )}
            <Field
              id="auth-email"
              name="email"
              type="email"
              label="Email"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              id="auth-password"
              name="password"
              type="password"
              label="Password"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              placeholder={isSignup ? 'At least 6 characters' : 'Enter your password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
            <button
              type="submit"
              id="submit"
              className="btn btn--primary btn--lg btn--block"
              disabled={submitting}
            >
              {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="auth__switch">
            {isSignup ? 'Already have an account?' : 'New to Seettu LK?'}{' '}
            <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Create an account'}</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default AuthPage;
