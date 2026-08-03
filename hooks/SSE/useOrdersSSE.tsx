// hooks/queries/useOrdersSSE.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useOrdersSSE(deviceId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!deviceId) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const connect = () => {
        console.log(stopped , "stopped")
      if (stopped) return;

      es = new EventSource(`/api/orders/stream?device_id=${deviceId}`);

      es.onmessage = (event) => {
        const { order } = JSON.parse(event.data);
        console.log("prder fromaprse" , order)
        queryClient.setQueryData(["orders", deviceId], (old: any) =>
          old ? old.map((o: any) => (o._id === order._id ? order : o)) : old
        );
      };

      es.onerror = () => {
        es?.close();
        console.log("closde")
        if (!stopped) {
          reconnectTimer = setTimeout(connect, 1000);
        }
      };
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [deviceId, queryClient]);
}