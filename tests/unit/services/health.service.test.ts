import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getReadiness } from '../../../src/services/health.service';
import { checkDatabaseConnection } from '../../../src/repositories/health.repository';
import { isShutdownInitiated } from '../../../src/lifecycle/shutdown-state';

vi.mock('../../../src/repositories/health.repository');
vi.mock('../../../src/lifecycle/shutdown-state');

describe('getReadiness', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(isShutdownInitiated).mockReturnValue(false);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns not_ready without probing the database when shutdown has started', async () => {
    vi.mocked(isShutdownInitiated).mockReturnValue(true);

    await expect(getReadiness()).resolves.toStrictEqual({ status: 'not_ready' });

    expect(checkDatabaseConnection).not.toHaveBeenCalled();
  });

  it('returns not_ready when shutdown starts while the database probe is pending', async () => {
    let completeProbe: () => void = () => {};

    const probe = new Promise<void>((resolve) => {
      completeProbe = resolve;
    });

    vi.mocked(checkDatabaseConnection).mockReturnValue(probe);

    const readinessPromise = getReadiness();

    vi.mocked(isShutdownInitiated).mockReturnValue(true);
    completeProbe();

    await expect(readinessPromise).resolves.toStrictEqual({ status: 'not_ready' });
    expect(checkDatabaseConnection).toHaveBeenCalledOnce();
  });

  it("returns { status: 'ready' } when the database is ready", async () => {
    vi.mocked(checkDatabaseConnection).mockResolvedValue();

    await expect(getReadiness()).resolves.toStrictEqual({ status: 'ready' });

    expect(checkDatabaseConnection).toHaveBeenCalledOnce();
  });

  it("returns { status: 'not_ready' } when the database probe rejects", async () => {
    vi.mocked(checkDatabaseConnection).mockRejectedValue(new Error('Database unavailable'));

    await expect(getReadiness()).resolves.toStrictEqual({ status: 'not_ready' });

    expect(checkDatabaseConnection).toHaveBeenCalledOnce();
  });
  it('returns not_ready when the database probe exceeds one second', async () => {
    vi.useFakeTimers();

    let completeProbe: () => void = () => {};

    const probe = new Promise<void>((resolve) => {
      completeProbe = resolve;
    });

    vi.mocked(checkDatabaseConnection).mockReturnValue(probe);

    const readinessPromise = getReadiness();

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(readinessPromise).resolves.toStrictEqual({
      status: 'not_ready',
    });
    expect(checkDatabaseConnection).toHaveBeenCalledOnce();

    completeProbe();
    await probe;
  });
  it('recovers when a new database probe succeeds after a failure', async () => {
    vi.mocked(checkDatabaseConnection)
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockResolvedValueOnce();

    await expect(getReadiness()).resolves.toStrictEqual({ status: 'not_ready' });
    await expect(getReadiness()).resolves.toStrictEqual({ status: 'ready' });

    expect(checkDatabaseConnection).toHaveBeenCalledTimes(2);
  });

  it('shares the database probe between concurrent readiness calls', async () => {
    let completeProbe: () => void = () => {};

    const probe = new Promise<void>((resolve) => {
      completeProbe = resolve;
    });

    vi.mocked(checkDatabaseConnection).mockReturnValue(probe);

    const firstReadiness = getReadiness();
    const secondReadiness = getReadiness();

    // Finish the probe before asserting, so cleanup still runs
    // if the call-count assertion would fail.
    completeProbe();

    const results = await Promise.all([firstReadiness, secondReadiness]);

    expect(checkDatabaseConnection).toHaveBeenCalledOnce();
    expect(results).toStrictEqual([{ status: 'ready' }, { status: 'ready' }]);
  });
});
