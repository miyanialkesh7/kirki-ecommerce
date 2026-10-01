import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withMinimumDuration } from '@/features/onboarding/lib/with-minimum-duration';

const track = <T>(promise: Promise<T>) => {
  const state: { settled: boolean; value?: T; error?: unknown } = { settled: false };

  promise.then(
    (value) => Object.assign(state, { settled: true, value }),
    (error: unknown) => Object.assign(state, { settled: true, error }),
  );

  return state;
};

const resolveAfter = <T>(ms: number, value: T) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });

describe('withMinimumDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('holds a fast result until the minimum has passed', async () => {
    const state = track(withMinimumDuration(resolveAfter(1000, 'done'), 5000));

    await vi.advanceTimersByTimeAsync(4999);
    expect(state.settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(state).toEqual({ settled: true, value: 'done' });
  });

  it('follows a result that takes longer than the minimum', async () => {
    const state = track(withMinimumDuration(resolveAfter(8000, 'done'), 5000));

    await vi.advanceTimersByTimeAsync(7999);
    expect(state.settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(state).toEqual({ settled: true, value: 'done' });
  });

  it('passes a failure on without waiting for the minimum', async () => {
    const error = new Error('failed');
    const state = track(withMinimumDuration(Promise.reject(error), 5000));

    await vi.advanceTimersByTimeAsync(0);
    expect(state).toEqual({ settled: true, error });
  });
});
