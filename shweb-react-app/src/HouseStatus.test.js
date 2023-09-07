import { render, screen } from '@testing-library/react';
import HouseStatus from './HouseStatus';

test('renders learn react link', () => {
  render(<HouseStatus />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
