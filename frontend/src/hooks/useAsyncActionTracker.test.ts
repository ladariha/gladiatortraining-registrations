import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncActionTracker } from './useAsyncActionTracker';

describe('useAsyncActionTracker', () => {
  it('should initialize with correct default state', () => {
    const mockAction = jest.fn().mockResolvedValue('test');
    const { result } = renderHook(() => useAsyncActionTracker(mockAction));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should initialize with provided initial state', () => {
    const mockAction = jest.fn().mockResolvedValue('test');
    const initialData = { value: 'initial' };
    const { result } = renderHook(() =>
      useAsyncActionTracker(mockAction, initialData, false, true)
    );

    expect(result.current.data).toEqual(initialData);
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle successful async action execution', async () => {
    const mockData = { result: 'success' };
    const mockAction = jest.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useAsyncActionTracker(mockAction));

    await act(async () => {
      await result.current.execute(undefined);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error in async action', async () => {
    const mockError = new Error('Test error');
    const mockAction = jest.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsyncActionTracker(mockAction));

    await act(async () => {
      await result.current.execute(undefined);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe('Test error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle Response error', async () => {
    const mockResponse = new Response('', { status: 404 });
    const mockAction = jest.fn().mockRejectedValue(mockResponse);
    const { result } = renderHook(() => useAsyncActionTracker(mockAction));

    await act(async () => {
      await result.current.execute(undefined);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe('oops');
    expect(result.current.isLoading).toBe(false);
  });

  it('should execute without loading state', async () => {
    const mockData = { result: 'success' };
    const mockAction = jest.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useAsyncActionTracker(mockAction));

    await act(async () => {
      await result.current.executeWithoutLoadingState(undefined);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle delay in execution', async () => {
    jest.useFakeTimers();
    const mockData = { result: 'delayed' };
    const mockAction = jest.fn().mockResolvedValue(mockData);
    const delay = 1000;
    const { result } = renderHook(() =>
      useAsyncActionTracker(mockAction, undefined, false, false, delay)
    );

    act(() => {
      result.current.execute(undefined);
    });

    expect(result.current.isLoading).toBe(true);

    jest.advanceTimersByTime(delay);

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
    });

    jest.useRealTimers();
  });

  it('should suppress loading indicator when configured', async () => {
    const mockAction = jest.fn().mockResolvedValue('test');
    const { result } = renderHook(() =>
      useAsyncActionTracker(mockAction, undefined, true)
    );

    act(() => {
      result.current.execute(undefined);
    });

    // Loading should not be set when suppressed
    expect(result.current.isLoading).toBe(false);
  });
});