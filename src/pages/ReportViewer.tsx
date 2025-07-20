import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface Report {
  station_id: string;
  type: string;
  html: string;
}

export default function ReportViewer() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch(`https://smartcharge-backend-wg0m.onrender.com/reports/view/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setReport)
      .catch(() => setError("❌ Failed to load report"));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!report) return <p>🔄 Loading...</p>;

return (
  <div style={{ padding: "2rem" }}>
    <h2>
      📄 Report: {report.station_id}{" "}
      {report.type === "drift" ? "🧪 Drift" : "🧾 Expectation"}
    </h2>
    {report.type === 'drift' ? (
      <iframe
        src={`https://smartcharge-backend-wg0m.onrender.com/reports/raw/${id}`}
        title="Drift Report"
        width="100%"
        height="800"
        style={{ border: 'none' }}
      />
    ) : (
      <div dangerouslySetInnerHTML={{ __html: report.html }} />
    )}
  </div>
);

}
