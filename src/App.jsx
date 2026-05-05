import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/NavBar";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductViewer from "./pages/ProductViewer";
import Login from "./pages/Login";
import SavedConfigs from "./pages/SavedConfigs";
import AdminDash from "./pages/AdminDash";

export default function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductViewer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/saved-configs" element={<SavedConfigs />} />
        <Route path="/admin" element={<AdminDash />} />
      </Routes>
    </div>
  );
}