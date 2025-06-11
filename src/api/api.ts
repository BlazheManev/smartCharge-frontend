import type { Station } from "../types/Station";
import stationsData from "./ljubljana_ev_availability_combined.json";

export const fetchStations = async (): Promise<Station[]> => {
  return stationsData.results;
};
