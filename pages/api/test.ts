import { NextApiRequest, NextApiResponse } from "next";
import serverAuth from "@/lib/serverAuth";

export default async function handler( req: NextApiRequest, res: NextApiResponse ) {
    try {
        if(req.method === 'POST') {
            const { currentUser } = await serverAuth(req);
            console.log(currentUser);
            // const { movieId } = req.body;
        
            // const existingMovie = await prismadb.movie.findUnique({
            //     where: {
            //         id: movieId,
            //     }
            // });
        
            // if (!existingMovie) {
            //     throw new Error('Invalid ID');
            // }
        
            // const user = await prismadb.user.update({
            //     where: {
            //         email: currentUser.email || '',
            //     },
            //     data: {
            //         favoriteIds: {
            //             push: movieId,
            //         }
            //     }
            // });
        
            res.status(200).json({ message: "已登入", user: currentUser });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).end();
    }
}