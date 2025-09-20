import { render, screen } from '@testing-library/react';
import { EmptyMessage } from './EmptyMessage';

describe('EmptyMessage', () => {
  it('should render message with provided text', () => {
    const testMessage = 'No data available';
    render(<EmptyMessage msg={testMessage} />);

    const message = screen.getByText(testMessage);
    expect(message).toBeInTheDocument();
  });

  it('should render with info severity styling', () => {
    render(<EmptyMessage msg="Test message" />);

    const container = screen.getByText('Test message').closest('.emptyMessage');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('text-center');
  });
});