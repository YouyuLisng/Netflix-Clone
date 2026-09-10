import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

import FavoriteButton from './FavoriteButton';

const mutate = vi.fn();
const mutateFavorites = vi.fn();
let currentUser: { favoriteIds: string[] } | null = { favoriteIds: [] };

vi.mock('axios');

vi.mock('@/hooks/useCurrentUser', () => ({
    default: () => ({ data: currentUser, mutate }),
}));

vi.mock('@/hooks/useFavorites', () => ({
    default: () => ({ mutate: mutateFavorites }),
}));

describe('FavoriteButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        currentUser = { favoriteIds: [] };
    });

    it('POSTs to add a favorite when not already favorited, then mutates both caches', async () => {
        (axios.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            data: { favoriteIds: ['movie-1'] },
        });

        render(<FavoriteButton movieId="movie-1" />);
        fireEvent.click(screen.getByTestId('favorite-button'));

        await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/favorite', { movieId: 'movie-1' }));

        expect(mutate).toHaveBeenCalledWith({ favoriteIds: ['movie-1'] });
        expect(mutateFavorites).toHaveBeenCalled();
    });

    it('DELETEs to remove a favorite when already favorited', async () => {
        currentUser = { favoriteIds: ['movie-1'] };
        (axios.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            data: { favoriteIds: [] },
        });

        render(<FavoriteButton movieId="movie-1" />);
        fireEvent.click(screen.getByTestId('favorite-button'));

        await waitFor(() => expect(axios.delete).toHaveBeenCalledWith('/api/favorite', {
            data: { movieId: 'movie-1' },
        }));
    });

    it('does not throw and clears the in-flight guard when the request fails', async () => {
        (axios.post as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<FavoriteButton movieId="movie-1" />);
        const button = screen.getByTestId('favorite-button');

        fireEvent.click(button);
        await waitFor(() => expect(consoleError).toHaveBeenCalled());

        expect(mutate).not.toHaveBeenCalled();

        // A second click after the failure should be able to fire a new
        // request -- proves isSubmitting was reset in the finally branch.
        fireEvent.click(button);
        await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));

        consoleError.mockRestore();
    });

    it('ignores a second click while a request is already in flight', async () => {
        let resolveRequest: (value: unknown) => void = () => {};
        (axios.post as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
            new Promise((resolve) => { resolveRequest = resolve; })
        );

        render(<FavoriteButton movieId="movie-1" />);
        const button = screen.getByTestId('favorite-button');

        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);

        expect(axios.post).toHaveBeenCalledTimes(1);

        resolveRequest({ data: { favoriteIds: ['movie-1'] } });
        await waitFor(() => expect(mutate).toHaveBeenCalled());
    });
});
