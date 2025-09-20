import React from "react";
import { renderHook } from "@testing-library/react";
import { usePermissions } from "./usePermissions";
import { UserContext } from "../context/UserContext";
import { UserRole } from "../types";

// Helper function to create wrapper with UserContext
const createWrapper = (role?: UserRole) => {
  return ({ children }: { children: React.ReactNode }) => <UserContext.Provider value={{ role, setRole: jest.fn() }}>{children}</UserContext.Provider>;
};

describe("usePermissions", () => {
  describe("canUserManageEvents", () => {
    it("should return true for admin users", () => {
      const wrapper = createWrapper(UserRole.Admin);
      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.canUserManageEvents()).toBe(true);
    });

    it("should return false for visitor users", () => {
      const wrapper = createWrapper(UserRole.Visitor);
      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.canUserManageEvents()).toBe(false);
    });

    it("should return false when role is undefined", () => {
      const wrapper = createWrapper(undefined);
      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.canUserManageEvents()).toBe(false);
    });

    it("should return false when no context provider is used", () => {
      // This tests the default context value behavior
      const { result } = renderHook(() => usePermissions());

      // The default UserContext has role: UserRole.Visitor
      expect(result.current.canUserManageEvents()).toBe(false);
    });
  });

  describe("hook structure", () => {
    it("should return an object with canUserManageEvents function", () => {
      const wrapper = createWrapper(UserRole.Visitor);
      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(typeof result.current.canUserManageEvents).toBe("function");
      expect(Object.keys(result.current)).toEqual(["canUserManageEvents"]);
    });
  });

  describe("role changes", () => {
    it("should update permissions when role changes", () => {
      let currentRole: UserRole | undefined = UserRole.Visitor;

      const DynamicWrapper = ({ children }: { children: React.ReactNode }) => (
        <UserContext.Provider value={{ role: currentRole, setRole: jest.fn() }}>{children}</UserContext.Provider>
      );

      const { result, rerender } = renderHook(() => usePermissions(), {
        wrapper: DynamicWrapper,
      });

      // Initially visitor
      expect(result.current.canUserManageEvents()).toBe(false);

      // Change to admin
      currentRole = UserRole.Admin;
      rerender();

      expect(result.current.canUserManageEvents()).toBe(true);

      // Change back to visitor
      currentRole = UserRole.Visitor;
      rerender();

      expect(result.current.canUserManageEvents()).toBe(false);
    });
  });
});
