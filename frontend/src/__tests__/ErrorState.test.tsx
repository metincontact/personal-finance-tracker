import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '../components/ErrorState';

describe('ErrorState component', () => {
  it('renders error message', () => {
    render(<ErrorState message="Failed to load data" onRetry={() => {}} />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    const btn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
