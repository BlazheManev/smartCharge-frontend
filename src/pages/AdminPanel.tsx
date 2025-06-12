import { useEffect, useState } from "react";
import type { ModelMeta } from "../types/Model";
import type { Station } from "../types/Station";
import rawModelsData from "../../public/ml_models.json";
import { fetchStations } from "../api/api";

type GroupedModels = {
  [date: string]: {
    [station: string]: ModelMeta[];
  };
};

function formatDate(ms: number) {
  return new Date(ms).toISOString().split("T")[0];
}

export default function AdminPanel() {
  const [grouped, setGrouped] = useState<GroupedModels>({});
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stationsInfo, setStationsInfo] = useState<Record<string, Station>>({});

  useEffect(() => {
    fetchStations()
      .then((stations) => {
        const info: Record<string, Station> = {};
        for (const s of stations) {
          info[s.id] = s;
        }
        setStationsInfo(info);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized: ModelMeta[] = rawModelsData.map((entry: any) => ({
        run_id: entry.run_id,
        station: entry["params.station"],
        window_size: Number(entry["params.window_size"]),
        rmse: entry["metrics.rmse"] ?? 0,
        mae: entry["metrics.mae"] ?? 0,
        start_time: entry.start_time,
      }));

      const groupedData: GroupedModels = {};

      for (const model of normalized) {
        const date = formatDate(model.start_time);
        if (!groupedData[date]) groupedData[date] = {};
        if (!groupedData[date][model.station]) groupedData[date][model.station] = [];
        groupedData[date][model.station].push(model);
      }

      setGrouped(groupedData);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredData = Object.entries(grouped)
    .filter(([date]) => !selectedDate || date === selectedDate)
    .reduce<GroupedModels>((acc, [date, stations]) => {
      const filteredStations = Object.entries(stations)
        .filter(([station]) => !selectedStation || station === selectedStation)
        .reduce((obj, [station, models]) => {
          obj[station] = models;
          return obj;
        }, {} as { [station: string]: ModelMeta[] });

      if (Object.keys(filteredStations).length > 0) {
        acc[date] = filteredStations;
      }

      return acc;
    }, {});

  const validDates = Object.keys(grouped).sort();
  const validStations = selectedDate
    ? Object.keys(grouped[selectedDate] || {})
    : Array.from(new Set(Object.values(grouped).flatMap((s) => Object.keys(s)))).sort();

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>🧠 Pregled Napovednih Modelov</h2>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label>
          📅 Datum:
          <select
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedStation("");
            }}
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value="">Vsi</option>
            {validDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </label>

        <label>
          🏷️ Postaja:
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            style={{ marginLeft: "0.5rem", padding: "0.4rem" }}
          >
            <option value="">Vse</option>
            {validStations.map((id) => {
              const station = stationsInfo[id];
              const label = station ? `${station.name} (${id})` : id;
              return <option key={id} value={id}>{label}</option>;
            })}
          </select>
        </label>

        <button
          onClick={() => {
            setSelectedDate("");
            setSelectedStation("");
          }}
          style={{
            padding: "0.4rem 0.8rem",
            backgroundColor: "#eee",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔄 Ponastavi
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <p style={{ fontStyle: "italic", color: "#777" }}>🔄 Nalaganje modelov...</p>
      ) : Object.keys(filteredData).length === 0 ? (
        <p style={{ color: "#666" }}>Ni zadetkov za izbrane filtre.</p>
      ) : (
        Object.entries(filteredData).map(([date, stations]) => (
          <div key={date} style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📅 {date}</h3>
            {Object.entries(stations).map(([stationId, models]) => {
              const station = stationsInfo[stationId];
              return (
                <div key={stationId} style={{ marginBottom: "1rem", marginLeft: "1rem" }}>
                  <h4 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                    🏷️ {station ? `${station.name} (${stationId})` : stationId}
                    {station?.position && (
                      <span style={{ color: "#555", marginLeft: "0.5rem" }}>
                        📍 {station.position.lat.toFixed(4)}, {station.position.lon.toFixed(4)}
                      </span>
                    )}
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gap: "1rem",
                      marginLeft: "1rem",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    }}
                  >
                    {models.map((model) => (
                      <div
                        key={model.run_id}
                        style={{
                          border: "1px solid #ddd",
                          padding: "1rem",
                          borderRadius: "12px",
                          background: "#fefefe",
                          boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
                        }}
                      >
                        <b>🧪 Run ID:</b>
                        <div style={{ wordBreak: "break-all", marginBottom: "0.5rem" }}>
                          <a
                            href={`https://dagshub.com/BlazheManev/smartcharge-ai.mlflow/#/experiments/0/runs/${model.run_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#007bff", textDecoration: "underline" }}
                          >
                            {model.run_id}
                          </a>
                        </div>
                        <b>🪟 Window Size:</b> {model.window_size}<br />
                        <b>📉 RMSE:</b> {model.rmse.toFixed(4)}<br />
                        <b>📈 MAE:</b> {model.mae.toFixed(4)}<br />
                        <b>🕒 Trained:</b> {new Date(model.start_time).toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
