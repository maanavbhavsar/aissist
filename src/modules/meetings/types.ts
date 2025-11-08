import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export enum MeetingStatus {
  Upcoming = "upcoming",
  Active = "active",
  Completed = "completed",
  Processing = "processing",
  Cancelled = "cancelled",
}

export type MeetingGetOne = inferRouterOutputs<AppRouter>["meetings"]["getOne"];
export type MeetingGetOneOutput = MeetingGetOne;
export type MeetingGetMany = inferRouterOutputs<AppRouter>["meetings"]["getMany"];

export type StreamTranscriptItem = {
  speaker_id: string;
  type: string;
  text: string;
  start_ts: number;
  stop_ts: number;
};

export type TranscriptItemWithSpeaker = StreamTranscriptItem & {
  speaker: {
    id: string;
    name: string;
    image: string;
  };
  meetingStartedAt?: string | null;
};