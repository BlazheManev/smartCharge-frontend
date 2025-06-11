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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const ljubljana: LatLngTuple = [46.05, 14.5];

  useEffect(() => {
    fetchStations()
      .then(setStations)
      .catch(console.error);
  }, []);

  const flyToStation = (lat: number, lon: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 17, { duration: 1.2 });
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
          >
            <Popup>
              <strong>{station.name}</strong><br />
              {station.address}<br />
              <hr />
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
              <small><i>Fetched: {new Date(station.fetched_at).toLocaleString()}</i></small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 🍔 Hamburger Menu */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
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

      {/* 📋 Sidebar (toggles) */}
      {sidebarOpen && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
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
                  flyToStation(station.position.lat, station.position.lon);
                  setSidebarOpen(false); // auto close
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
