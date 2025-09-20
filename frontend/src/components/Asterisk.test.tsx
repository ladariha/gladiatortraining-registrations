import { render, screen } from '@testing-library/react';
import { Asterisk } from './Asterisk';

describe('Asterisk', () => {
  it('should render asterisk with correct styling', () => {
    render(<Asterisk />);

    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-red-600');
    expect(asterisk).toHaveClass('ml-1');
  });
});