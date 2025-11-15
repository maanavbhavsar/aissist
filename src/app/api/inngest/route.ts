import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { meetingsProcessing, endMeetingOnTimeLimit } from "@/inngest/functions";
import { NextRequest } from "next/server";

// Create Inngest handlers
const handlers = serve({
  client: inngest,
  functions: [meetingsProcessing, endMeetingOnTimeLimit],
});

export const GET = handlers.GET;
export const POST = handlers.POST;

export async function PUT(req: NextRequest) {
  try {
    const contentLength = req.headers.get("content-length");
    const contentType = req.headers.get("content-type");

    // Skip empty requests (common with Inngest pings)
    if (!contentLength || contentLength === "0") {
      return new Response(null, { status: 200 });
    }

    const clonedReq = req.clone();
    const body = await clonedReq.text();

    if (!body.trim()) {
      return new Response(null, { status: 200 });
    }

    // Validate JSON payload
    if (contentType?.includes("application/json")) {
      try {
        JSON.parse(body);
      } catch {
        return new Response(null, { status: 200 });
      }
    }

    // Valid body → forward to Inngest
    // Inngest handlers in App Router mode only accept the request
    return (handlers.PUT as (req: NextRequest) => Promise<Response>)(req);
  } catch (error) {
    console.error("[Inngest] PUT handler error:", error);
    return new Response(null, { status: 200 });
  }
}
