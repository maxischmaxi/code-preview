import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useQueryGetAllSessions() {
  return useQuery({
    queryKey: ["getAllSessions"],
    async queryFn() {
      return await api.session.getAllSessions();
    },
  });
}
