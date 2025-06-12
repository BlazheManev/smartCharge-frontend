import { useEffect, useState } from "react";

interface Report {
  station_id: string;
  type: string;
  filename: string;
}

export default function DriftReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("https://smartcharge-backend.onrender.com/reports/list")
      .then((res) => res.json())
      .then(setReports)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📉 Drift & Expectation Reports</h2>
      {reports.length === 0 ? (
        <p>🔄 Loading...</p>
      ) : (
        <ul>
          {reports.map((r) => (
            <li key={r.filename}>
              <b>{r.type === "drift" ? "🧪 Drift" : "🧾 Expectation"}</b> —{" "}
              <a
                href={`https://smartcharge-backend.onrender.com/uploads/${r.type === "drift" ? "ev_drift" : "expectations"}/${r.filename}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.station_id}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
