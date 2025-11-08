import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { meetingsProcessing, endMeetingOnTimeLimit } from "@/inngest/functions";
import { NextRequest } from "next/server";

// Create an API that serves the functions
const handlers = serve({
  client: inngest,
  functions: [
    meetingsProcessing,
    endMeetingOnTimeLimit,
  ],
});

export const GET = handlers.GET;
export const POST = handlers.POST;

// Wrap PUT handler to handle empty bodies gracefully
export async function PUT(req: NextRequest, context?: { params?: Promise<Record<string, string>> }) {
  try {
    const contentLength = req.headers.get("content-length");
    const contentType = req.headers.get("content-type");
    
    // If content-length is 0 or missing, return early
    if (!contentLength || contentLength === "0") {
      return new Response(null, { status: 200 });
    }
    
    // Clone request to read body without consuming the stream
    const clonedReq = req.clone();
    
    try {
      const body = await clonedReq.text();
      
      // If body is empty, return early
      if (!body || body.trim() === "") {
        return new Response(null, { status: 200 });
      }
      
      // If content-type is JSON, validate JSON parsing
      if (contentType?.includes("application/json")) {
        try {
          JSON.parse(body);
        } catch {
          // Invalid JSON - return early
          return new Response(null, { status: 200 });
        }
      }
      
      // If we get here, body is valid - pass original request to Inngest
      return handlers.PUT(req, context);
    } catch (parseError) {
      // If reading body fails, return empty response
      console.warn("[Inngest] PUT request with invalid body, skipping:", parseError);
      return new Response(null, { status: 200 });
    }
  } catch (error) {
    // Handle any other errors gracefully
    console.error("[Inngest] PUT handler error:", error);
    return new Response(null, { status: 200 });
  }
}