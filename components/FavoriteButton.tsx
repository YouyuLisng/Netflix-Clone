import axios from 'axios';
import React, { useCallback, useMemo, useState } from 'react';
import { AiOutlinePlus, AiOutlineCheck } from 'react-icons/ai'
import useCurrentUser from '@/hooks/useCurrentUser';
import useFavorites from '@/hooks/useFavorites';

interface FavoriteButtonProps {
    movieId: string
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ movieId }) => {
    const { mutate: mutateFavorites } = useFavorites();
    const { data: currentUser, mutate } = useCurrentUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFavorite = useMemo(() => {
        const list = currentUser?.favoriteIds || [];

        return list.includes(movieId);
    }, [currentUser, movieId]);

    const toggleFavorites = useCallback(async () => {
        // Guards against a request already in flight (e.g. a rapid
        // double-click racing two opposite toggles) and against an
        // unhandled promise rejection when the request fails.
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = isFavorite
                ? await axios.delete('/api/favorite', { data: { movieId } })
                : await axios.post('/api/favorite', { movieId });

            const updatedFavoriteIds = response?.data?.favoriteIds;

            mutate({
                ...currentUser,
                favoriteIds: updatedFavoriteIds,
            });
            mutateFavorites();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }, [movieId, isFavorite, isSubmitting, currentUser, mutate, mutateFavorites]);

    const Icon = isFavorite ? AiOutlineCheck : AiOutlinePlus;

    return (
        <div onClick={toggleFavorites} className="cursor-pointer group/item w-6 h-6 lg:w-10 lg:h-10 border-white border-2 rounded-full flex justify-center items-center transition hover:border-neutral-300">
            <Icon className="text-white" size={25} />
        </div>
    )

}

export default FavoriteButton;