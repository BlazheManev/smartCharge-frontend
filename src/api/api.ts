import type { ModelMeta } from "../types/Model";
import type { Station } from "../types/Station";

/**
 * Fetches the latest EV station availability from the backend.
 * @returns A promise resolving to a list of stations.
 */
export const fetchStations = async (): Promise<Station[]> => {
  try {
    const res = await fetch("https://smartcharge-backend.onrender.com/api/ev-data");

    if (!res.ok) {
      throw new Error("Failed to fetch EV station data");
    }

    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Malformed response: missing results array");
    }

    return data.results as Station[];
  } catch (error) {
    console.error("❌ Error fetching stations:", error);
    return []; // Or throw error if you want to crash UI
  }
};

/**
 * Fetches the latest ML model metadata from the backend.
 * @returns A promise resolving to a list of model metadata entries.
 */
export const fetchModelMetadata = async (): Promise<ModelMeta[]> => {
  try {
    const res = await fetch("https://smartcharge-backend.onrender.com/api/ml-models");

    if (!res.ok) {
      throw new Error("Failed to fetch model metadata");
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Malformed response: expected an array of models");
    }

    return data as ModelMeta[];
  } catch (error) {
    console.error("❌ Error fetching model metadata:", error);
    return []; // Return empty array on failure
  }
};