import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = jest.fn();
});

test('renders the nav and switches tabs', () => {
  render(<App />);
  const nav = screen.getAllByRole('navigation', { name: 'Main' })[0];
  const home = within(nav).getByRole('button', { name: 'Home' });
  expect(home).toHaveAttribute('aria-current', 'page');

  fireEvent.click(within(nav).getByRole('button', { name: 'Library' }));
  expect(within(nav).getByRole('button', { name: 'Library' })).toHaveAttribute('aria-current', 'page');
  expect(home).not.toHaveAttribute('aria-current');
});

test('"Add record" opens the add-album dialog', () => {
  render(<App />);
  fireEvent.click(screen.getAllByRole('button', { name: /add record/i })[0]);
  expect(screen.getByRole('dialog', { name: 'Add a record' })).toBeInTheDocument();
});
