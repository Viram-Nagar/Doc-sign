import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Sign from "./pages/Sign";
import Audit from "./pages/Audit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/sign/:token" element={<Sign />} />
        <Route path="/audit/:docId" element={<Audit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
