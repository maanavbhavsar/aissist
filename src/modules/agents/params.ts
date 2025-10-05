import { parseAsInteger, parseAsString, createLoader } from "nuqs/server";
import { DEFAULT_PAGE } from "@/constants";

export const filtersSearchParams = {
  search: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
};

export const loadSearchParams = createLoader(filtersSearchParams);
