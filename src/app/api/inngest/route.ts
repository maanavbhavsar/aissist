import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { meetingsProcessing, endMeetingOnTimeLimit } from "@/inngest/functions";
import { NextRequest } from "next/server";

// 🩹 FIX: manually declare the type Next.js expects
type RouteContext = {
  params: Record<string, string | string[]>;
};

// Create Inngest handlers
const handlers = serve({
  client: inngest,
  functions: [meetingsProcessing, endMeetingOnTimeLimit],
});

export const GET = handlers.GET;
export const POST = handlers.POST;

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const contentLength = req.headers.get("content-length");
    const contentType = req.headers.get("content-type");

    if (!contentLength || contentLength === "0") {
      return new Response(null, { status: 200 });
    }

    const clonedReq = req.clone();
    const body = await clonedReq.text();

    if (!body.trim()) return new Response(null, { status: 200 });

    if (contentType?.includes("application/json")) {
      try {
        JSON.parse(body);
      } catch {
        return new Response(null, { status: 200 });
      }
    }

    return handlers.PUT(req, context);
  } catch (error) {
    console.error("[Inngest] PUT handler error:", error);
    return new Response(null, { status: 200 });
  }
}
