import React from 'react';
import { BsFillPlayFill } from 'react-icons/bs';
import { useRouter } from 'next/router';

interface PlatButtonProps {
    movieId: string
}

const PlatButton: React.FC<PlatButtonProps> = ({ movieId }) => {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push(`/watch/${movieId}`)}
            className="
                bg-white
                rounded-md
                py-1 md:py-2
                px-2 md:px-4
                w-auto
                text-xs lg:text-lg
                font-semibold
                flex
                items-center
                hovers:bg-neutral-300
                transitiion
            "
        >
            <BsFillPlayFill size={25} className="mr-1" />
            Play
        </button>
    )
}

export default PlatButton;