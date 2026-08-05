"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/axios";
import { toast } from "sonner";

export function useGetAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/admin/orders");
      return res.data?.orders ?? [];
    },
    refetchOnMount: true,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      order_id: string;
      status: string;
      fk_user_id: string;
    }) => {
      const res = await api.patch("/admin/orders", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.msg ?? "Order status updated");
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      }
    },
  });
}
