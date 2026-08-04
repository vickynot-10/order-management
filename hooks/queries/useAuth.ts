"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/utils/axios";
import { toast } from "sonner";

export function useAdminLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/admin/login", data);
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

export function useGetAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/admin/orders");
      return res.data?.orders ?? [];
    },
  });
}

export function useAdminLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/admin/logout");
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.msg ?? "Logged out successfully");
        router.push("/admin");
      }
    },
  });
}
