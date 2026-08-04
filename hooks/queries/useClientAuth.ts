"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/utils/axios";
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/sign-in", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.msg ?? "Logged in successfully");
        router.push("/admin");
      }
    },
  });
}



export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/sign-up", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.msg ?? "Signup successfully");
        router.push("/admin");
      }
    },
  });
}


