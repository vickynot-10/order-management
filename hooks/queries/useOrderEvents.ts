import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useOrderStatusStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource("/api/stream");

    source.onmessage = (event) => {
      const { order_id, status } = JSON.parse(event.data);

      queryClient.setQueriesData({ queryKey: ["orders"] }, (old: any) => {
        if (!old) return old;
        return old.map((order: any) =>
          order._id === order_id ? { ...order, status } : order,
        );
      });
    };

    return () => source.close();
  }, [queryClient]);
}
