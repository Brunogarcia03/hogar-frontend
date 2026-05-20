import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

export default function Contactos() {
  const [contactos, setContactos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    const res = await fetch(`${API}/api/contactos`);
    setContactos(await res.json());
  };

  useEffect(() => { cargar(); }, []);

  const agregar = async () => {
    if (!nombre.trim() || !numero.trim()) {
      setError("Completá nombre y número");
      return;
    }
    setError("");
    setLoading(true);
    await fetch(`${API}/api/contactos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, numero }),
    });
    setNombre("");
    setNumero("");
    await cargar();
    setLoading(false);
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este contacto?")) return;
    await fetch(`${API}/api/contactos/${id}`, { method: "DELETE" });
    await cargar();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Contactos</h2>
        <span className="badge">{contactos.length}</span>
      </div>

      <div className="card form-card">
        <h3>Agregar contacto</h3>
        <div className="form-row">
          <div className="field">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Ej: María García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Número (sin +, con código de área)</label>
            <input
              type="text"
              placeholder="Ej: 5492346567607"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn-primary" onClick={agregar} disabled={loading}>
          {loading ? "Agregando..." : "+ Agregar"}
        </button>
      </div>

      <div className="lista">
        {contactos.length === 0 ? (
          <div className="empty">No hay contactos todavía</div>
        ) : (
          contactos.map((c) => (
            <div className="contacto-item" key={c.id}>
              <div className="contacto-avatar">
                {c.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="contacto-info">
                <span className="contacto-nombre">{c.nombre}</span>
                <span className="contacto-numero">+{c.numero}</span>
              </div>
              <button
                className="btn-delete"
                onClick={() => eliminar(c.id)}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
