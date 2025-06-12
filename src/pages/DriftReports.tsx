import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Report {
  _id: string;
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
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
        📉 Drift & Expectation Reports
      </h2>

      {reports.length === 0 ? (
        <p>🔄 Loading...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {reports.map((r) => (
            <Link
              to={`/report/${r._id}`}
              key={r._id}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "1rem",
                  padding: "1rem",
                  backgroundColor: "#fefefe",
                  transition: "box-shadow 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.1)"))
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0,0,0,0.05)"))
                }
              >
                <h3 style={{ marginBottom: "0.5rem" }}>
                  {r.type === "drift" ? "🧪 Drift Report" : "🧾 Expectation"}
                </h3>
                <p
                  style={{
                    fontWeight: "bold",
                    color: "#007bff",
                    marginBottom: "0.5rem",
                  }}
                >
                  Station: {r.station_id}
                </p>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>
                  File: {r.filename}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
