import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

// Mock PrimeReact ProgressSpinner
jest.mock('primereact/progressspinner', () => ({
  ProgressSpinner: () => <div data-testid="progress-spinner">Loading...</div>
}));

describe('Spinner', () => {
  it('should render progress spinner', () => {
    render(<Spinner />);

    const spinner = screen.getByTestId('progress-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with centered styling', () => {
    const { container } = render(<Spinner />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('w-full');
    expect(wrapper).toHaveClass('text-center');
  });
});