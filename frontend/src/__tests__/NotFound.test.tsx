import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../pages/NotFound';

describe('NotFound page', () => {
  it('renders 404 message', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('renders go to dashboard button', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
  });
});
