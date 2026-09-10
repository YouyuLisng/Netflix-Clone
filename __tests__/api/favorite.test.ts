// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

import prismadb from '@/lib/prismadb';
import serverAuth from '@/lib/serverAuth';
import handler from '@/pages/api/favorite';

vi.mock('@/lib/serverAuth');
vi.mock('@/lib/prismadb', () => ({
    default: {
        movie: { findUnique: vi.fn() },
        user: { update: vi.fn() },
    },
}));

const mockServerAuth = serverAuth as unknown as ReturnType<typeof vi.fn>;
const mockFindUnique = prismadb.movie.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockUpdate = prismadb.user.update as unknown as ReturnType<typeof vi.fn>;

describe('/api/favorite', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockServerAuth.mockResolvedValue({
            currentUser: { email: 'user@example.com', favoriteIds: ['movie-1'] },
        });
        mockFindUnique.mockResolvedValue({ id: 'movie-2' });
        mockUpdate.mockResolvedValue({ favoriteIds: ['movie-1', 'movie-2'] });
    });

    it('rejects methods other than POST/DELETE with 405', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(405);
    });

    it('POST appends the movie id to favoriteIds', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { movieId: 'movie-2' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { email: 'user@example.com' },
            data: { favoriteIds: { push: 'movie-2' } },
        });
    });

    it('POST returns 500 when the movie id does not exist', async () => {
        mockFindUnique.mockResolvedValue(null);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { movieId: 'nope' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('DELETE removes the movie id from favoriteIds without touching the others', async () => {
        mockServerAuth.mockResolvedValue({
            currentUser: { email: 'user@example.com', favoriteIds: ['movie-1', 'movie-2', 'movie-3'] },
        });
        mockFindUnique.mockResolvedValue({ id: 'movie-2' });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'DELETE',
            body: { movieId: 'movie-2' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { email: 'user@example.com' },
            data: { favoriteIds: ['movie-1', 'movie-3'] },
        });
    });

    it('returns 500 when the user is not authenticated', async () => {
        mockServerAuth.mockRejectedValue(new Error('Not signed in'));

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: { movieId: 'movie-2' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});
