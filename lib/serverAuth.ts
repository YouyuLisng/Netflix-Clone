import prismadb from '@/lib/prismadb';
import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";

const serverAuth = async (req: NextApiRequest) => {
    const session = await getSession({ req });
    console.log(session, 'serverAuth');
    if(!session?.user?.email) {
        throw Error('Not Signed in')
    }

    const currentUser = await prismadb.user.findUnique({
        where: {
            email: session.user.email,
        }
    });

    if(!currentUser) {
        throw Error('Not Signed in')
    }

    return { currentUser };
}

export default serverAuth;
