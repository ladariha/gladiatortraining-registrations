import React from 'react';
import { render } from '@testing-library/react';
import { EventHeader } from './EventHeader';
import { BasePageObject } from '../testutils/BasePageObject';
import { RegistrationEvent, UserRole } from '../types';
import { UserContext } from '../context/UserContext';
import { ToastContext } from '../context/ToastContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the complex child components
jest.mock('./EventAdminActions', () => ({
  EventAdminActions: () => <div data-testid="event-admin-actions" />,
}));

jest.mock('./RegisterSidebar', () => ({
  RegisterSidebar: () => <div data-testid="register-sidebar" />,
}));

// Mock PrimeReact components
jest.mock('primereact/button', () => ({
  Button: ({ label, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="register-button" {...props}>
      {label}
    </button>
  ),
}));

jest.mock('primereact/tag', () => ({
  Tag: ({ value, severity }: any) => (
    <span data-testid="visibility-tag" className={`tag-${severity}`}>
      {value}
    </span>
  ),
}));

jest.mock('primereact/menu', () => ({
  Menu: () => <div data-testid="menu" />,
}));

// Create test wrapper with all required contexts
const createWrapper = (userRole: UserRole = UserRole.Visitor) => {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <UserContext.Provider value={{ role: userRole, setRole: jest.fn() }}>
        <ToastContext.Provider value={{ show: jest.fn() }}>
          {children}
        </ToastContext.Provider>
      </UserContext.Provider>
    </BrowserRouter>
  );
};

// Create a mock event object
const createMockEvent = (overrides: Partial<RegistrationEvent> = {}): RegistrationEvent => ({
  id: 1,
  name: 'Test Event',
  short_description: 'Test Description',
  description: 'Long description',
  max_people: 10,
  time: Date.now() + 86400000, // 24 hours from now
  registration_end: Date.now() + 43200000, // 12 hours from now
  people: 5,
  image: 'test-image.jpg',
  visible: 1,
  registrations: 'Individual,Group',
  bank_code: '1234',
  account_number: '567890',
  prefix: '123',
  swift: 'TEST',
  iban: 'TEST123456789',
  ...overrides,
});

// Page Object for EventHeader
class EventHeaderPageObject extends BasePageObject {
  async findEventName() {
    // In detail view, it's an h1, in list view it's clickable
    return this.queryByText('Test Event') || this.queryByRole('heading', { name: 'Test Event' });
  }

  async findRegisterButton() {
    return this.queryByTestId('register-button');
  }

  async findVisibilityTag() {
    return this.queryByTestId('visibility-tag');
  }

  async findBackLink() {
    return this.queryByText(/back/i);
  }

  async findEventTime() {
    return this.queryByRole('generic', { name: /\d{1,2}\.\d{1,2}\.\d{4}/ });
  }

  async findEventDescription() {
    return this.queryByText('Test Description');
  }

  async findAdminActions() {
    return this.queryByTestId('event-admin-actions');
  }
}

describe('EventHeader', () => {
  let pageObject: EventHeaderPageObject;
  const mockRefresh = jest.fn();

  beforeEach(() => {
    pageObject = new EventHeaderPageObject();
    mockRefresh.mockClear();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      const event = createMockEvent();
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} refresh={mockRefresh} />,
        { wrapper }
      );
    });

    it('should display event name', () => {
      const event = createMockEvent();
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findEventName()).toBeInTheDocument();
    });

    it('should display event description in list view', () => {
      const event = createMockEvent();
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} isDetailView={false} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findEventDescription()).toBeInTheDocument();
    });

    it('should not display event description in detail view', () => {
      const event = createMockEvent();
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} isDetailView={true} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findEventDescription()).not.toBeInTheDocument();
    });
  });

  describe('registration button', () => {
    it('should show register button when registration is open', () => {
      const event = createMockEvent({
        visible: 1,
        people: 5,
        max_people: 10,
        registration_end: Date.now() + 86400000, // future date
      });
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} refresh={mockRefresh} />,
        { wrapper }
      );

      const button = pageObject.findRegisterButton();
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('should show disabled button when event is full', () => {
      const event = createMockEvent({
        visible: 1,
        people: 10,
        max_people: 10,
        registration_end: Date.now() + 86400000,
      });
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} refresh={mockRefresh} />,
        { wrapper }
      );

      const button = pageObject.findRegisterButton();
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should show disabled button when registration ended', () => {
      const event = createMockEvent({
        visible: 1,
        people: 5,
        max_people: 10,
        registration_end: Date.now() - 86400000, // past date
      });
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} refresh={mockRefresh} />,
        { wrapper }
      );

      const button = pageObject.findRegisterButton();
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('admin features', () => {
    it('should show visibility tag for admin users', () => {
      const event = createMockEvent({ visible: 1 });
      const wrapper = createWrapper(UserRole.Admin);
      
      render(
        <EventHeader event={event} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findVisibilityTag()).toBeInTheDocument();
    });

    it('should not show visibility tag for regular users', () => {
      const event = createMockEvent({ visible: 1 });
      const wrapper = createWrapper(UserRole.Visitor);
      
      render(
        <EventHeader event={event} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findVisibilityTag()).not.toBeInTheDocument();
    });

    it('should show admin actions for admin users in detail view', () => {
      const event = createMockEvent();
      const wrapper = createWrapper(UserRole.Admin);
      
      render(
        <EventHeader event={event} isDetailView={true} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findAdminActions()).toBeInTheDocument();
    });

    it('should not show admin actions for regular users', () => {
      const event = createMockEvent();
      const wrapper = createWrapper(UserRole.Visitor);
      
      render(
        <EventHeader event={event} isDetailView={true} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findAdminActions()).not.toBeInTheDocument();
    });
  });

  describe('detail view features', () => {
    it('should show back link in detail view', () => {
      const event = createMockEvent();
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} isDetailView={true} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findBackLink()).toBeInTheDocument();
    });

    it('should not show back link in list view', () => {
      const event = createMockEvent();
      const wrapper = createWrapper();
      
      render(
        <EventHeader event={event} isDetailView={false} refresh={mockRefresh} />,
        { wrapper }
      );

      expect(pageObject.findBackLink()).not.toBeInTheDocument();
    });
  });
});