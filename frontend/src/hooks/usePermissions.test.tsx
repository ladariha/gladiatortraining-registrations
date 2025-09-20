import React from 'react';
import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { UserContext } from '../context/UserContext';
import { UserRole } from '../types';

describe('usePermissions', () => {
  const createWrapper = (role: UserRole) => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <UserContext.Provider value={{ role, setRole: jest.fn() }}>
        {children}
      </UserContext.Provider>
    );
    return wrapper;
  };

  it('should return true for canUserManageEvents when user is Admin', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(UserRole.Admin),
    });

    expect(result.current.canUserManageEvents()).toBe(true);
  });

  it('should return false for canUserManageEvents when user is Visitor', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper(UserRole.Visitor),
    });

    expect(result.current.canUserManageEvents()).toBe(false);
  });
});