// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

import prismadb from '@/lib/prismadb';
import handler from '@/pages/api/register';

vi.mock('@/lib/prismadb', () => ({
    default: {
        user: { findUnique: vi.fn(), create: vi.fn() },
    },
}));

vi.mock('bcrypt', () => ({
    default: { hash: vi.fn() },
}));

const mockFindUnique = prismadb.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockCreate = prismadb.user.create as unknown as ReturnType<typeof vi.fn>;
const mockHash = bcrypt.hash as unknown as ReturnType<typeof vi.fn>;

describe('/api/register', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFindUnique.mockResolvedValue(null);
        mockHash.mockResolvedValue('hashed-password');
        mockCreate.mockResolvedValue({ id: 'user-1', email: 'user@example.com' });
    });

    it('rejects non-POST methods with 405', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
    });

    it('rejects with 422 when the email is already registered', async () => {
        mockFindUnique.mockResolvedValue({ id: 'existing-user' });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { email: 'taken@example.com', name: 'A', password: 'pw' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(422);
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('creates a user with a hashed password on success', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { email: 'new@example.com', name: 'New', password: 'pw' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockHash).toHaveBeenCalledWith('pw', 12);
        expect(mockCreate).toHaveBeenCalledWith({
            data: expect.objectContaining({
                email: 'new@example.com',
                name: 'New',
                hashedPassword: 'hashed-password',
            }),
        });
    });

    // Regression test: the catch handler used to interpolate the raw
    // error object straight into the JSON response
    // (`Something went wrong: ${error}`), leaking internal error details
    // to the client.
    it('does not leak internal error details when something goes wrong', async () => {
        mockCreate.mockRejectedValue(new Error('P2002: unique constraint failed on the fields: (email)'));

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { email: 'new@example.com', name: 'New', password: 'pw' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        const body = res._getJSONData() as { error: string };
        expect(body.error).toBe('Something went wrong');
        expect(body.error).not.toContain('P2002');
        expect(body.error).not.toContain('unique constraint');
    });
});
