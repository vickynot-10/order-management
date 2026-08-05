import { orderEvents } from "@/lib/order_events";

export const dynamic = "force-dynamic";

export async function GET() {
  let keepAlive: ReturnType<typeof setInterval>;
  let onStatusUpdate: (payload: any) => void;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (err) {
          console.log("[stream] enqueue failed on send, closing", err);
          closed = true;
          cleanup();
        }
      };

      onStatusUpdate = (payload: any) => send(payload);
      orderEvents.on("status-update", onStatusUpdate);

      keepAlive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch (err) {
          console.log("[stream] enqueue failed on ping, closing", err);
          closed = true;
          cleanup();
        }
      }, 15000);

      function cleanup() {
        clearInterval(keepAlive);
        try {
          orderEvents.off("status-update", onStatusUpdate);
        } catch (err) {
          console.log("[stream] error removing listener", err);
        }
      }
    },
    cancel(reason) {
      console.log("[stream] cancel() called", reason);
      closed = true;
      clearInterval(keepAlive);
      try {
        orderEvents.off("status-update", onStatusUpdate);
      } catch (err) {
        console.log("[stream] error removing listener in cancel", err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}