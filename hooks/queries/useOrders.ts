"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/utils/axios";
import { toast } from "sonner";

export function usePlaceOrder() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/place-order", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.msg ?? "Order Placed successfully");
        router.push("/");
      }
    },
  });
}

export function useGetOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data?.orders ?? [];
    },
    //  refetchInterval: 8000,
    // refetchIntervalInBackground: false,
  });

}

export function useGetAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/admin/orders" ) ;
      return res.data?.orders ?? [];
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { order_id: string; status: string }) => {
      const res = await api.patch("/orders", data);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.msg ?? "Order status updated");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
    },
  });
}

