"use client";
import { useMutation } from "@tanstack/react-query";
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

