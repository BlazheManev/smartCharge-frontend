import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MapView from "./pages/MapView";
import AdminPanel from "./pages/AdminPanel";
import DriftReports from "./pages/DriftReports";

function App() {
  return (
    <Router>
      <nav
        style={{
          padding: "1rem",
          backgroundColor: "#eee",
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-start",
        }}
      >
        <Link to="/">🗺️ Mapa</Link>
        <Link to="/admin">🧠 Admin</Link>
        <Link to="/drift">📉 Poročila</Link>

      </nav>

      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/drift" element={<DriftReports />} />

      </Routes>
    </Router>
  );
}

export default App;
