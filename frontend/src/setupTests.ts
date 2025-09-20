// Jest setup file for React Testing Library
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// Polyfills for libraries requiring them in jsdom
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// Mock fetch for API calls in tests
global.fetch = jest.fn();

// Mock PrimeReact components that might cause issues in tests
jest.mock("primereact/message", () => ({
  Message: jest.fn(({ text }) => `Message: ${text}`),
}));

jest.mock("primereact/button", () => ({
  Button: jest.fn(({ label, children }) => `Button: ${label || children}`),
}));

jest.mock("primereact/tag", () => ({
  Tag: jest.fn(({ value }) => `Tag: ${value}`),
}));

jest.mock("primereact/progressspinner", () => ({
  ProgressSpinner: jest.fn(() => `<div data-testid="progress-spinner"></div>`),
}));

// Mock React Router components for route testing
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: "1" }),
}));
