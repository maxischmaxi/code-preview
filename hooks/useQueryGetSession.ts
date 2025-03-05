import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useQueryGetSession(id: string) {
    return useQuery({
        queryKey: ["getSession", id],
        async queryFn() {
            return await api.session.getSession(id);
        },
    });
}
