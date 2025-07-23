import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { type LatLngTuple, Map as LeafletMap } from "leaflet";
import type { Station } from "../types/Station";
import { fetchStations } from "../api/api";
import chargingStationIcon from "../assets/charging-station.png";

const customIcon = new L.Icon({
  iconUrl: chargingStationIcon,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export default function MapView() {
  const [stations, setStations] = useState<Station[]>([]);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [confidence, setConfidence] = useState<string>("");
  const [statusText, setStatusText] = useState<string>("");

  const ljubljana: LatLngTuple = [46.05, 14.5];

  useEffect(() => {
    fetchStations()
      .then(setStations)
      .catch(console.error);
  }, []);

  const flyToStation = (station: Station) => {
    if (mapRef.current) {
      const { lat, lon } = station.position;
      mapRef.current.flyTo([lat, lon], 17, { duration: 1.2 });
      const marker = markerRefs.current[station.id];
      if (marker) marker.openPopup();
    }
  };

  const handlePredict = async () => {
    if (!selectedStation || !selectedDate) return;

    const stationId = selectedStation.id;
    const windowSize = 24; // or make this dynamic if needed

    try {
      const res = await fetch(
        `https://smartcharge-backend-wg0m.onrender.com/api/predict?stationId=${stationId}&windowSize=${windowSize}`
      );

      const data = await res.json();

      if (res.ok && data.input) {
        setConfidence(data.input);
        setStatusText("✅ Napoved uspešna.");
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Prediction failed:", err);
      setConfidence("");
      setStatusText("❌ Napaka pri napovedi.");
    }
  };


  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={ljubljana}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.position.lat, station.position.lon]}
            icon={customIcon}
            ref={(ref) => {
              if (ref) markerRefs.current[station.id] = ref;
            }}
            eventHandlers={{
              click: () => {
                setSelectedStation(station);
                setConfidence("");
                setStatusText("");
              },
            }}
          >
            <Popup autoClose={false} closeOnClick={false}>
              <div style={{ maxWidth: "250px", fontSize: "0.9rem", lineHeight: 1.4 }}>
                <strong>{station.name}</strong><br />
                {station.address}
                <hr style={{ margin: "0.5rem 0" }} />
                {station.availability.map((a, idx) => {
                  const current = a.availability.current;
                  return (
                    <div key={idx} style={{ marginBottom: "0.5rem" }}>
                      <b>{a.type}</b><br />
                      🟢 {current.available} available<br />
                      🔴 {current.occupied} occupied<br />
                      📦 {a.total} total
                    </div>
                  );
                })}

                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: "1rem", fontSize: "0.85rem" }}
                >
                  <b>📅 Izberi datum in čas:</b><br />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <input
                      type="date"
                      value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        if (selectedDate) {
                          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                        }
                        setSelectedDate(newDate);
                      }}
                      style={{
                        padding: "0.3rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        flex: 1,
                      }}
                    />

                    <input
                      type="time"
                      value={
                        selectedDate
                          ? selectedDate.toTimeString().slice(0, 5)
                          : ""
                      }
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":").map(Number);
                        const newDate = selectedDate ? new Date(selectedDate) : new Date();
                        newDate.setHours(hours);
                        newDate.setMinutes(minutes);
                        setSelectedDate(newDate);
                      }}
                      style={{
                        padding: "0.3rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        flex: 1,
                      }}
                    />
                  </div>

                  <button
                    onClick={handlePredict}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.4rem 0.6rem",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    🔮 Napovej
                  </button>

                  {confidence && (
                    <div style={{ marginTop: "0.5rem", color: "#444" }}>
                      <b>📊 Napoved:</b><br />
                      🔢 Verjetnost: <span style={{ fontWeight: 600 }}>{confidence}</span><br />
                      📍 Status: <span style={{ fontStyle: "italic" }}>{statusText}</span>
                    </div>
                  )}
                </div>
                <small><i>Fetched: {new Date(station.fetched_at).toLocaleString()}</i></small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 1001,
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          style={{
            position: "absolute",
            top: "4rem",
            right: "1rem",
            backgroundColor: "white",
            padding: "1rem",
            borderRadius: "8px",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            width: "250px",
            zIndex: 1000,
          }}
        >
          <h3 style={{ marginTop: 0 }}>📋 Polnilnice</h3>
          {stations.map((station) => {
            const current = station.availability[0]?.availability?.current;
            return (
              <div
                key={station.id}
                onClick={() => {
                  flyToStation(station);
                  setSidebarOpen(false);
                }}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <strong>{station.name}</strong><br />
                <small>{station.address}</small><br />
                <span>🟢 {current?.available ?? 0} / 📦 {station.availability[0]?.total ?? "?"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
