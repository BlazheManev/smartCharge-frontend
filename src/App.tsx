import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MapView from "./pages/MapView";
import AdminPanel from "./pages/AdminPanel";

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
      </nav>

      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
