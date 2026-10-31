import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>
  );

beforeEach(() => sessionStorage.clear());

test('signed-out users are redirected from / to the login page', () => {
  renderAt('/');
  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
});

test('signup page is available on its own url', () => {
  renderAt('/signup');
  expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
});
