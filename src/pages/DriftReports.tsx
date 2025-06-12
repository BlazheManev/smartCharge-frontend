import { useEffect, useState } from "react";

interface Report {
  _id: string;
  station_id: string;
  type: string;
  filename: string;
}

export default function DriftReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedHtml, setSelectedHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://smartcharge-backend.onrender.com/reports/list")
      .then((res) => res.json())
      .then(setReports)
      .catch(console.error);
  }, []);

  const loadReportHtml = async (id: string) => {
    const res = await fetch(`https://smartcharge-backend.onrender.com/reports/view/${id}`);
    const html = await res.text();
    setSelectedHtml(html);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📉 Drift & Expectation Reports</h2>

      {reports.length === 0 ? (
        <p>🔄 Loading reports...</p>
      ) : (
        <ul>
          {reports.map((r) => (
            <li key={r._id}>
              <b>{r.type === "drift" ? "🧪 Drift" : "🧾 Expectation"}</b> —{" "}
              <button
                style={{ color: "blue", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => loadReportHtml(r._id)}
              >
                {r.station_id}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedHtml && (
        <div style={{ marginTop: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h3>📊 Report Preview</h3>
          <div dangerouslySetInnerHTML={{ __html: selectedHtml }} />
        </div>
      )}
    </div>
  );
}
