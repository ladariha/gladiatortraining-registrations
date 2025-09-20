import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Base Page Object class providing common selectors and actions for component testing
 * Follows the Page Object pattern to encapsulate selectors and reduce duplication in tests
 */
export class BasePageObject {
  // Common selectors
  async findByTestId(testId: string) {
    return screen.findByTestId(testId);
  }

  getByTestId(testId: string) {
    return screen.getByTestId(testId);
  }

  queryByTestId(testId: string) {
    return screen.queryByTestId(testId);
  }

  async findByText(text: string | RegExp) {
    return screen.findByText(text);
  }

  getByText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryByText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  async findByLabelText(label: string | RegExp) {
    return screen.findByLabelText(label);
  }

  getByLabelText(label: string | RegExp) {
    return screen.getByLabelText(label);
  }

  async findByRole(role: string, options?: any) {
    return screen.findByRole(role, options);
  }

  getByRole(role: string, options?: any) {
    return screen.getByRole(role, options);
  }

  queryByRole(role: string, options?: any) {
    return screen.queryByRole(role, options);
  }

  // Common actions (using older userEvent API)
  async click(element: HTMLElement) {
    await userEvent.click(element);
  }

  async type(element: HTMLElement, text: string) {
    await userEvent.type(element, text);
  }

  async clear(element: HTMLElement) {
    await userEvent.clear(element);
  }

  async hover(element: HTMLElement) {
    await userEvent.hover(element);
  }

  async selectOptions(element: HTMLElement, values: string | string[]) {
    await userEvent.selectOptions(element, values);
  }

  // Wait for async operations
  async waitFor(callback: () => void | Promise<void>, options?: { timeout?: number }) {
    return waitFor(callback, options);
  }

  async waitForElementToBeRemoved(element: HTMLElement | (() => HTMLElement | null)) {
    return waitFor(() => {
      const el = typeof element === "function" ? element() : element;
      expect(el).not.toBeInTheDocument();
    });
  }
}
