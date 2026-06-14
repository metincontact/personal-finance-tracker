import { renderHook, act } from '@testing-library/react';
import { useToast } from '../hooks/useToast';

describe('useToast hook', () => {
  it('starts with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('adds a toast when showToast is called', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Transaction added');
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]!.message).toBe('Transaction added');
    expect(result.current.toasts[0]!.type).toBe('success');
  });

  it('adds error toast with correct type', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.showToast('Something failed', 'error');
    });
    expect(result.current.toasts[0]!.type).toBe('error');
  });
});
