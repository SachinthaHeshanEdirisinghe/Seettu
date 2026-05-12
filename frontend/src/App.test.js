import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MobiCircle heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /mobicircle/i })).toBeInTheDocument();
});
