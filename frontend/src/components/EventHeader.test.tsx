import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventHeader } from './EventHeader';
import { RegistrationEvent, UserRole } from '../types';
import { UserContext } from '../context/UserContext';
import { ToastContext } from '../context/ToastContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks and components
jest.mock('./EventAdminActions', () => ({
  EventAdminActions: () => <div data-testid="admin-actions">Admin Actions</div>,
}));

jest.mock('./RegisterSidebar', () => ({
  RegisterSidebar: ({ onHide }: any) => (
    <div data-testid="register-sidebar">
      Register Sidebar
      <button onClick={() => onHide(true)}>Close</button>
    </div>
  ),
}));

jest.mock('primereact/menu', () => ({
  Menu: React.forwardRef((props: any, ref: any) => (
    <div data-testid="menu" ref={ref}>
      Menu
    </div>
  )),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EventHeader', () => {
  const mockEvent: RegistrationEvent = {
    id: 1,
    name: 'Test Event',
    short_description: 'Short description',
    description: 'Full description',
    max_people: 100,
    time: new Date(2025, 5, 15).getTime(),
    registration_end: new Date(2025, 5, 1).getTime(),
    people: 50,
    visible: 1,
    registrations: JSON.stringify([
      { id: 1, name: 'Standard', number_of_people: 1, price: 500 },
      { id: 2, name: 'VIP', number_of_people: 2, price: 1000 },
    ]),
    bank_code: '0100',
    account_number: '123456789',
    swift: 'SWIFT123',
    iban: 'CZ123456789',
  };

  const mockRefresh = jest.fn();
  const mockShowMessage = jest.fn();

  const renderComponent = (
    event: RegistrationEvent = mockEvent,
    role: UserRole = UserRole.Visitor,
    isDetailView: boolean = false
  ) => {
    return render(
      <BrowserRouter>
        <UserContext.Provider value={{ role, setRole: jest.fn() }}>
          <ToastContext.Provider value={{ showMessage: mockShowMessage }}>
            <EventHeader event={event} isDetailView={isDetailView} refresh={mockRefresh} />
          </ToastContext.Provider>
        </UserContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render event name and details', () => {
    renderComponent();

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Short description')).toBeInTheDocument();
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('should show admin actions for admin users', () => {
    renderComponent(mockEvent, UserRole.Admin);

    expect(screen.getByTestId('admin-actions')).toBeInTheDocument();
    expect(screen.getByText('Viditelný')).toBeInTheDocument();
  });

  it('should not show admin actions for regular users', () => {
    renderComponent(mockEvent, UserRole.Visitor);

    expect(screen.queryByTestId('admin-actions')).not.toBeInTheDocument();
  });

  it('should navigate to event detail when clicking event name', () => {
    renderComponent();

    const eventName = screen.getByText('Test Event');
    fireEvent.click(eventName);

    expect(mockNavigate).toHaveBeenCalledWith('/events/1');
  });

  it('should show back link in detail view', () => {
    renderComponent(mockEvent, UserRole.Visitor, true);

    expect(screen.getByText('Zpět')).toBeInTheDocument();
  });

  it('should disable registration button when event is full', () => {
    const fullEvent = {
      ...mockEvent,
      people: 100,
    };

    renderComponent(fullEvent);

    const button = screen.getByRole('button', { name: /Plná kapacita/i });
    expect(button).toBeDisabled();
  });

  it('should disable registration button when registration ended', () => {
    const pastEvent = {
      ...mockEvent,
      registration_end: new Date(2020, 1, 1).getTime(),
    };

    renderComponent(pastEvent);

    const button = screen.getByRole('button', { name: /Registrace ukončena/i });
    expect(button).toBeDisabled();
  });

  it('should show registration menu when multiple options available', () => {
    renderComponent();

    // Should have button for multiple registrations
    const button = screen.getByRole('button', { name: /Registrovat/i });
    expect(button).toBeEnabled();
  });

  it('should handle single registration option', () => {
    const singleRegEvent = {
      ...mockEvent,
      registrations: JSON.stringify([
        { id: 1, name: 'Standard', number_of_people: 1, price: 500 },
      ]),
    };

    renderComponent(singleRegEvent);

    const button = screen.getByRole('button', { name: /Registrovat \(500 Kč\)/i });
    expect(button).toBeEnabled();
  });

  it('should handle invisible event', () => {
    const invisibleEvent = {
      ...mockEvent,
      visible: 0,
    };

    renderComponent(invisibleEvent, UserRole.Admin);

    expect(screen.getByText('Neviditelný')).toBeInTheDocument();
  });

  it('should parse registrations correctly', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /Registrovat/i });
    fireEvent.click(button);

    // Menu should be toggled
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  it('should handle invalid registrations JSON', () => {
    const invalidEvent = {
      ...mockEvent,
      registrations: 'invalid json',
    };

    // Should not throw error
    expect(() => renderComponent(invalidEvent)).not.toThrow();
  });
});