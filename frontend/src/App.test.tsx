import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';
import { UserRole } from './types';

// Mock hooks
jest.mock('./hooks/useWhoAmI', () => ({
  useWhoAmI: jest.fn(),
}));

// Mock routes
jest.mock('./routes/EventsListRoute', () => ({
  EventsListRoute: () => <div data-testid="events-list">Events List</div>,
}));

jest.mock('./routes/EventRoute', () => ({
  EventRoute: () => <div data-testid="event-route">Event Route</div>,
}));

jest.mock('./routes/NewEventRoute', () => ({
  NewEventRoute: () => <div data-testid="new-event">New Event</div>,
}));

jest.mock('./routes/EditEventRoute', () => ({
  EditEventRoute: () => <div data-testid="edit-event">Edit Event</div>,
}));

// Mock PrimeReact components
jest.mock('primereact/toast', () => ({
  Toast: React.forwardRef((props: any, ref: any) => (
    <div ref={ref} data-testid="toast">Toast</div>
  )),
  ToastMessage: {},
}));

describe('App', () => {
  const { useWhoAmI } = require('./hooks/useWhoAmI');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner when fetching user role', () => {
    useWhoAmI.mockReturnValue({
      role: undefined,
      isLoading: true,
      error: undefined,
    });

    render(<App />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error message when whoAmI fails', () => {
    useWhoAmI.mockReturnValue({
      role: undefined,
      isLoading: false,
      error: 'Error fetching user',
    });

    render(<App />);

    expect(screen.getByText('Nepodařilo se načíst obsah')).toBeInTheDocument();
  });

  it('should render routes when user role is loaded', async () => {
    useWhoAmI.mockReturnValue({
      role: UserRole.Admin,
      isLoading: false,
      error: undefined,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('events-list')).toBeInTheDocument();
    });
  });

  it('should set default role as Visitor', () => {
    useWhoAmI.mockReturnValue({
      role: undefined,
      isLoading: false,
      error: undefined,
    });

    const { container } = render(<App />);

    // App should render with Visitor role by default
    expect(container.querySelector('[data-testid="events-list"]')).toBeInTheDocument();
  });

  it('should update role when whoAmI returns role', async () => {
    const { rerender } = render(<App />);

    // Initial render with no role
    useWhoAmI.mockReturnValue({
      role: undefined,
      isLoading: true,
      error: undefined,
    });

    rerender(<App />);

    // Update with Admin role
    useWhoAmI.mockReturnValue({
      role: UserRole.Admin,
      isLoading: false,
      error: undefined,
    });

    rerender(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('events-list')).toBeInTheDocument();
    });
  });

  it('should provide toast context', () => {
    useWhoAmI.mockReturnValue({
      role: UserRole.Visitor,
      isLoading: false,
      error: undefined,
    });

    render(<App />);

    expect(screen.getByTestId('toast')).toBeInTheDocument();
  });

  it('should handle navigation to different routes', () => {
    useWhoAmI.mockReturnValue({
      role: UserRole.Admin,
      isLoading: false,
      error: undefined,
    });

    render(<App />);

    // Check that base route renders EventsListRoute
    expect(screen.getByTestId('events-list')).toBeInTheDocument();
  });
});