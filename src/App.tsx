import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MapView from "./pages/MapView";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", backgroundColor: "#eee", display: "flex", gap: "1rem" }}>
        <Link to="/">Mapa</Link>
      </nav>
      <Routes>
        <Route path="/" element={<MapView />} />
      </Routes>
    </Router>
  );
}

export default App;
