import React from 'react';
import { render } from '@testing-library/react';
import { Spinner } from './Spinner';

// Mock the ProgressSpinner component
jest.mock('primereact/progressspinner', () => ({
  ProgressSpinner: () => <div data-testid="progress-spinner" />,
}));

describe('Spinner', () => {
  it('should render without crashing', () => {
    render(<Spinner />);
  });

  it('should render ProgressSpinner component', () => {
    const { getByTestId } = render(<Spinner />);
    
    expect(getByTestId('progress-spinner')).toBeInTheDocument();
  });

  it('should have correct wrapper styling classes', () => {
    const { container } = render(<Spinner />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper).toHaveClass('w-full', 'text-center');
  });

  it('should render as a div container', () => {
    const { container } = render(<Spinner />);
    const wrapper = container.firstChild;
    
    expect(wrapper).toBeInstanceOf(HTMLDivElement);
  });
});