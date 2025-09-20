import '@testing-library/jest-dom';

// Mock window.GladiatortrainingRegistrations
Object.defineProperty(window, 'GladiatortrainingRegistrations', {
  writable: true,
  value: {
    nonce: 'test-nonce',
    baseUrl: 'http://localhost'
  }
});

// Mock DOM methods that are not available in jsdom
global.URL.createObjectURL = jest.fn(() => 'blob:test');
global.URL.revokeObjectURL = jest.fn();

// Mock document methods for download functionality
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();