import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findAuthenticatedUserById } from '../../../src/repositories/users.repository';
import { getAuthenticatedUser } from '../../../src/services/auth.service';
import type { AuthenticatedUser } from '../../../src/dtos/auth.dto';
import { AppError } from '../../../src/utils/app-error';

vi.mock('../../../src/repositories/users.repository');

describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns the id and current role from the repository', async () => {
    const user: AuthenticatedUser = { id: 7, role: 'ADMIN' };
    vi.mocked(findAuthenticatedUserById).mockResolvedValue(user);

    await expect(getAuthenticatedUser(7)).resolves.toEqual(user);
    expect(findAuthenticatedUserById).toHaveBeenCalledWith(7);
  });

  it('throws a generic 401 when the user no longer exists', async () => {
    vi.mocked(findAuthenticatedUserById).mockResolvedValue(null);

    const result = getAuthenticatedUser(7);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  });

  it('does not turn a database failure into a 401', async () => {
    const databaseError = new Error('database unavailable');
    vi.mocked(findAuthenticatedUserById).mockRejectedValue(databaseError);

    const result = getAuthenticatedUser(7);

    await expect(result).rejects.toBe(databaseError);
    await expect(result).rejects.not.toBeInstanceOf(AppError);
  });
});
