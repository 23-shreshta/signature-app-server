import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Sign In heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Sign In/i);
  expect(headingElement).toBeInTheDocument();
});
