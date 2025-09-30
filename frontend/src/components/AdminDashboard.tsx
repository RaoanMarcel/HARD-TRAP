import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "/api/admin/products"; // Adjust to your backend route

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState<{ name: string; description: string; price: string; stock: string; image: File | null }>({ name: "", description: "", price: "", stock: "", image: null });
  const [token, setToken] = useState(""); // Get from login/auth context

  // Fetch active products
  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/active`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProducts(res.data));
  }, [token]);

  // Add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value as any);
    });
    await axios.post(API, data, { headers: { Authorization: `Bearer ${token}` } });
    // Refresh products
    const res = await axios.get(`${API}/active`, { headers: { Authorization: `Bearer ${token}` } });
    setProducts(res.data);
  };

  // Update stock
  const handleUpdateStock = async (id: number, stock: number) => {
    await axios.put(`${API}/${id}/stock`, { stock }, { headers: { Authorization: `Bearer ${token}` } });
    // Refresh products
    const res = await axios.get(`${API}/active`, { headers: { Authorization: `Bearer ${token}` } });
    setProducts(res.data);
  };

  return (
    <div>
      <h2>Adicionar Produto</h2>
      <form onSubmit={handleAddProduct}>
        <input type="text" placeholder="Nome" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <textarea placeholder="Descrição" onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <input type="number" placeholder="Preço" onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
        <input type="number" placeholder="Estoque" onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
  <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files?.[0] ?? null }))} />
        <button type="submit">Adicionar</button>
      </form>

      <h2>Produtos Ativos</h2>
      <ul>
        {products.map((p: any) => (
          <li key={p.id}>
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: 80 }} />}
            <strong>{p.name}</strong> - Estoque: {p.stock}
            <input type="number" min={0} defaultValue={p.stock}
              onBlur={e => handleUpdateStock(p.id, Number(e.target.value))} />
          </li>
        ))}
      </ul>
    </div>
  );
}
