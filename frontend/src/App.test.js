import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Seettu LK heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /seettu lk/i })).toBeInTheDocument();
});
