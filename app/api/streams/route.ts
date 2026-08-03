// app/api/orders/stream/route.ts
import db from "@/config/mongodb";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10; // Hobby hard limit

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get("device_id");
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller already closed, ignore
        }
      };

      const collection = db.collection("orders");
      const pipeline = deviceId
        ? [{ $match: { "fullDocument.device_id": deviceId, operationType: "update" } }]
        : [{ $match: { operationType: "update" } }];

      const changeStream = collection.watch(pipeline, { fullDocument: "updateLookup" });

      changeStream.on("change", (change: any) => {
        send({ order: change.fullDocument });
      });

      changeStream.on("error", (err) => console.error("change stream error", err));

      const cleanup = () => {
        if (closed) return;
        closed = true;
        changeStream.close().catch(() => {});
        try {
          controller.close();
        } catch {}
      };

      // Close ourselves at ~7s, well before Vercel's 10s hard kill,
      // so the client gets a clean end (not an aborted connection) and
      // EventSource's onerror -> reconnect kicks in smoothly.
      const selfCloseTimer = setTimeout(cleanup, 7000);

      req.signal.addEventListener("abort", () => {
        clearTimeout(selfCloseTimer);
        cleanup();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // stops any intermediate proxy from buffering
    },
  });
}