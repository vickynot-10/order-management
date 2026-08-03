"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/axios";
import { toast } from "sonner";

const QUERY_KEY = ["pinned-projects"];

export function useGetPinnedProjects() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await api.get("/projects/pinned-projects");
      return res.data?.data ?? []
    },
    staleTime: Infinity,
  });
}

