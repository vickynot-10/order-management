import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/axios";

interface User {
  user_id: string;
  email: string;
}

export const useMe = () => {
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me");
      return res.data?.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};