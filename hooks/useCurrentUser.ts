import useSWR from "swr";
import fetcher from "@/lib/fetcher";

const userCurrentUser = () => {
    const { data, error, isLoading, mutate } = useSWR('/api/current', fetcher);
    console.log(data, 'userCurrentUser');
    return {
        data,
        error,
        isLoading,
        mutate
    }
}

export default userCurrentUser;