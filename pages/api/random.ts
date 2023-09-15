import prismadb from '@/lib/prismadb';
import { NextApiRequest, NextApiResponse } from "next";
import serverAuth from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'GET') {
        return res.status(405).end();
    }

    try {
        await serverAuth(req);
        // 取得db電影數量
        const moviesCount = await prismadb.movie.count();
        // 產生隨機電影
        const randomIndex = Math.floor(Math.random() * moviesCount);
        // db取電影資料
        const randomMovies = await prismadb.movie.findMany({
            take: 1,
            skip: randomIndex
        });
        return res.status(200).json(randomMovies[0])
    } catch (error) {
        console.log(error);
        return res.status(400).end();
    }
}