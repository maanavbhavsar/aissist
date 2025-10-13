import { parseAsInteger, parseAsString, parseAsStringEnum, createLoader } from "nuqs/server";
import { DEFAULT_PAGE } from "@/constants";
import { MeetingStatus } from "./types";

export const filtersSearchParams = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  status: parseAsStringEnum(Object.values(MeetingStatus)),
  agentId: parseAsString.withDefault(""),
};

export const loadSearchParams = createLoader(filtersSearchParams);
