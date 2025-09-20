import { RestRoutes, getDefaultHeaders } from './rest';

describe('rest', () => {
  describe('RestRoutes', () => {
    beforeEach(() => {
      // Set up mock window object
      Object.defineProperty(window, 'GladiatortrainingRegistrations', {
        writable: true,
        value: {
          baseUrl: 'http://localhost',
          nonce: 'test-nonce'
        }
      });
    });

    it('should construct correct API routes', () => {
      expect(RestRoutes.whoAmI).toBe('http://localhost/?rest_route=/gtevents/v1/user');
      expect(RestRoutes.registeredUser).toBe('http://localhost/?rest_route=/gtevents/v1/registeredUser');
      expect(RestRoutes.keys).toBe('http://localhost/?rest_route=/gtevents/v1/keys');
      expect(RestRoutes.mail).toBe('http://localhost/?rest_route=/gtevents/v1/mail');
      expect(RestRoutes.events).toBe('http://localhost/?rest_route=/gtevents/v1/events');
      expect(RestRoutes.registrations).toBe('http://localhost/?rest_route=/gtevents/v1/registrations');
      expect(RestRoutes.registrationGroup).toBe('http://localhost/?rest_route=/gtevents/v1/registrationGroup');
      expect(RestRoutes.event).toBe('http://localhost/?rest_route=/gtevents/v1/event');
      expect(RestRoutes.logs).toBe('http://localhost/?rest_route=/gtevents/v1/errors');
    });
  });

  describe('getDefaultHeaders', () => {
    it('should return headers with nonce when settings exist', () => {
      Object.defineProperty(window, 'GladiatortrainingRegistrations', {
        writable: true,
        value: {
          baseUrl: 'http://localhost',
          nonce: 'test-nonce-123'
        }
      });

      const headers = getDefaultHeaders();

      expect(headers).toEqual({
        'X-WP-Nonce': 'test-nonce-123'
      });
    });

    it('should return headers with empty nonce when nonce is missing', () => {
      Object.defineProperty(window, 'GladiatortrainingRegistrations', {
        writable: true,
        value: {
          baseUrl: 'http://localhost'
        }
      });

      const headers = getDefaultHeaders();

      expect(headers).toEqual({
        'X-WP-Nonce': ''
      });
    });

    it('should return empty object when settings dont exist', () => {
      Object.defineProperty(window, 'GladiatortrainingRegistrations', {
        writable: true,
        value: undefined
      });

      const headers = getDefaultHeaders();

      expect(headers).toEqual({});
    });
  });
});