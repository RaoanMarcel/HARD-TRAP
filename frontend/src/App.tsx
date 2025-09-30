import React from "react";
import { useLocation } from "react-router-dom";
import "./styles.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCarousel from "./components/ProductCarousel";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import AdminDashboard from "./components/AdminDashboard";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && role !== "ADMIN") return <Navigate to="/" />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;
  // Remove Navbar on login and register pages
  const hideNavbar = path === "/login" || path === "/register";
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<><Hero /><ProductCarousel /></>} />
    <Route path="/login" element={<LoginScreen />} />
    <Route path="/register" element={<RegisterScreen />} />
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
