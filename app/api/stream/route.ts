import { orderEvents } from "@/lib/order_events";
import { GetUserDetails } from "@/service/getUserID";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Login Required to Place order !" },
      { status: 401 },
    );
  }
  const user: any = GetUserDetails(token);

  if (!user || !user.user_id) {
    return NextResponse.json(
      { message: "Login Required to Place order !" },
      { status: 401 },
    );
  }
  const userId = user.user_id;

  let keepAlive: ReturnType<typeof setInterval>;
  let onStatusUpdate: (payload: any) => void;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: any) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch (err) {
          console.log("[stream] enqueue failed on send, closing", err);
          closed = true;
          cleanup();
        }
      };

      onStatusUpdate = (payload: any) => {
        if (payload.user_id !== userId) return;
        send(payload);
      };
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
