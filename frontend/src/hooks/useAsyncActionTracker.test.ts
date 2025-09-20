import { renderHook, act } from '@testing-library/react';
import { useAsyncActionTracker, AsyncAction } from './useAsyncActionTracker';

// Mock timers for delay testing
jest.useFakeTimers();

describe('useAsyncActionTracker', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const mockAction: AsyncAction<void, string> = jest.fn().mockResolvedValue('result');
      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.executeWithoutLoadingState).toBe('function');
    });

    it('should initialize with provided initial state', () => {
      const mockAction: AsyncAction<void, string> = jest.fn().mockResolvedValue('result');
      const initialData = 'initial';
      const { result } = renderHook(() => 
        useAsyncActionTracker(mockAction, initialData, false, true)
      );

      expect(result.current.data).toBe('initial');
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('successful execution', () => {
    it('should handle successful action execution', async () => {
      const mockAction: AsyncAction<void, string> = jest.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      await act(async () => {
        const returnValue = await result.current.execute();
        expect(returnValue).toBe('success');
      });

      expect(result.current.data).toBe('success');
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should handle successful action execution with parameters', async () => {
      const mockAction: AsyncAction<{ id: number }, string> = jest.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      const params = { id: 123 };
      await act(async () => {
        await result.current.execute(params);
      });

      expect(result.current.data).toBe('success');
      expect(mockAction).toHaveBeenCalledWith(params);
    });

    it('should set loading state during execution', async () => {
      let resolveAction: (value: string) => void;
      const mockAction: AsyncAction<void, string> = jest.fn(() => 
        new Promise((resolve) => {
          resolveAction = resolve;
        })
      );

      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      let executePromise: Promise<string | undefined>;
      act(() => {
        executePromise = result.current.execute();
      });

      // Should be loading now
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();

      // Resolve the action
      await act(async () => {
        resolveAction!('success');
        await executePromise!;
      });

      // Should no longer be loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe('success');
    });
  });

  describe('error handling', () => {
    it('should handle Error instances', async () => {
      const testError = new Error('Test error message');
      const mockAction: AsyncAction<void, string> = jest.fn().mockRejectedValue(testError);
      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      await act(async () => {
        const returnValue = await result.current.execute();
        expect(returnValue).toBeUndefined();
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe('Test error message');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle Response instances', async () => {
      const mockResponse = new Response('Error response', { status: 500 });
      const mockAction: AsyncAction<void, string> = jest.fn().mockRejectedValue(mockResponse);
      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe('oops'); // From getErrorMessageFromApiResponse
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous data on error', async () => {
      const mockAction: AsyncAction<void, string> = jest.fn()
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('fail'));

      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      // First successful call
      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data).toBe('success');

      // Second failing call should clear data
      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe('fail');
    });
  });

  describe('executeWithoutLoadingState', () => {
    it('should execute without affecting loading state', async () => {
      const mockAction: AsyncAction<void, string> = jest.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.executeWithoutLoadingState();
      });

      expect(result.current.data).toBe('success');
      expect(result.current.isLoading).toBe(false); // Should remain false
      expect(result.current.error).toBeUndefined();
    });

    it('should handle errors without affecting loading state', async () => {
      const testError = new Error('Test error');
      const mockAction: AsyncAction<void, string> = jest.fn().mockRejectedValue(testError);
      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      await act(async () => {
        await result.current.executeWithoutLoadingState();
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBe('Test error');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('suppress loading indicator', () => {
    it('should suppress loading indicator when flag is true', async () => {
      let resolveAction: (value: string) => void;
      const mockAction: AsyncAction<void, string> = jest.fn(() => 
        new Promise((resolve) => {
          resolveAction = resolve;
        })
      );

      const { result } = renderHook(() => 
        useAsyncActionTracker(mockAction, undefined, true) // suppress loading
      );

      let executePromise: Promise<string | undefined>;
      act(() => {
        executePromise = result.current.execute();
      });

      // Should NOT be loading due to suppression
      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        resolveAction!('success');
        await executePromise!;
      });

      expect(result.current.data).toBe('success');
    });

    it('should show loading when suppress is true but there was a previous error', async () => {
      const mockAction: AsyncAction<void, string> = jest.fn()
        .mockRejectedValueOnce(new Error('first error'))
        .mockImplementationOnce(() => 
          new Promise(() => {}) // Never resolves for loading test
        );

      const { result } = renderHook(() => 
        useAsyncActionTracker(mockAction, undefined, true) // suppress loading
      );

      // First call to set error state
      await act(async () => {
        await result.current.execute();
      });
      expect(result.current.error).toBe('first error');

      // Second call should show loading despite suppress flag due to previous error
      act(() => {
        result.current.execute();
      });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('delay functionality', () => {
    it('should respect delay parameter', async () => {
      const mockAction: AsyncAction<void, string> = jest.fn().mockResolvedValue('delayed success');
      const { result } = renderHook(() => 
        useAsyncActionTracker(mockAction, undefined, false, false, 1000) // 1 second delay
      );

      let executePromise: Promise<string | undefined>;
      act(() => {
        executePromise = result.current.execute();
      });

      // Should be loading immediately
      expect(result.current.isLoading).toBe(true);

      // Fast-forward time by 500ms (not enough)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Action shouldn't be called yet
      expect(mockAction).not.toHaveBeenCalled();

      // Fast-forward the remaining time
      await act(async () => {
        jest.advanceTimersByTime(500);
        await executePromise!;
      });

      // Now action should have been called
      expect(mockAction).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('delayed success');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('state transitions', () => {
    it('should properly transition through loading states', async () => {
      const states: Array<{ isLoading: boolean; data?: string; error?: string }> = [];
      
      let resolveAction: (value: string) => void;
      const mockAction: AsyncAction<void, string> = jest.fn(() => 
        new Promise((resolve) => {
          resolveAction = resolve;
        })
      );

      const { result } = renderHook(() => useAsyncActionTracker(mockAction));

      // Capture initial state
      states.push({
        isLoading: result.current.isLoading,
        data: result.current.data,
        error: result.current.error,
      });

      // Start execution
      let executePromise: Promise<string | undefined>;
      act(() => {
        executePromise = result.current.execute();
      });

      // Capture loading state
      states.push({
        isLoading: result.current.isLoading,
        data: result.current.data,
        error: result.current.error,
      });

      // Resolve action and wait for completion
      await act(async () => {
        resolveAction!('final result');
        await executePromise!;
      });

      // Capture final state
      states.push({
        isLoading: result.current.isLoading,
        data: result.current.data,
        error: result.current.error,
      });

      expect(states).toEqual([
        { isLoading: false, data: undefined, error: undefined }, // Initial
        { isLoading: true, data: undefined, error: undefined },  // Loading
        { isLoading: false, data: 'final result', error: undefined }, // Success
      ]);
    });
  });
});