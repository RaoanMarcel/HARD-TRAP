import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/register", { name, email, password });
      setLoading(false);
      navigate("/login");
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || "Erro ao registrar usuário");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <h2 style={{ fontWeight: 700, fontSize: "2rem", color: "#fff", textAlign: "center", letterSpacing: "2px", marginBottom: "8px" }}>Cadastro</h2>
        <form className="login-form" onSubmit={handleRegister}>
          <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required style={{ fontWeight: 500, fontSize: "1rem" }} />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ fontWeight: 500, fontSize: "1rem" }} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required style={{ fontWeight: 500, fontSize: "1rem" }} />
          <button type="submit" disabled={loading} style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "1px" }}>{loading ? "Registrando..." : "Registrar"}</button>
        </form>
        <Link className="login-link" to="/login">Já tem conta? Entrar</Link>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
