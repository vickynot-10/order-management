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
    refetchOnMount : true
  });

}



