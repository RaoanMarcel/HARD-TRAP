import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token } = res.data;
      // Decode token to get role
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("token", token);
      localStorage.setItem("role", payload.role);
      if (payload.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao fazer login");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <h2>Entrar</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Entrar</button>
        </form>
  <Link className="login-link" to="/register">Não tem conta? Cadastre-se</Link>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
