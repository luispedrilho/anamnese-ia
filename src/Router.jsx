import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Register from "./Register";
import Login from "./Login";
import Historico from "./Historico";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/historico" element={<Historico />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
