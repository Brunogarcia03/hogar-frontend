import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [expandido, setExpandido] = useState(null);

  const cargar = async () => {
    const res = await fetch(`${API}/api/historial`);
    setHistorial(await res.json());
  };

  useEffect(() => { cargar(); }, []);

  const limpiar = async () => {
    if (!confirm("¿Borrar todo el historial?")) return;
    await fetch(`${API}/api/historial`, { method: "DELETE" });
    await cargar();
  };

  const formatFecha = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Historial de envíos</h2>
        {historial.length > 0 && (
          <button className="btn-ghost" onClick={limpiar}>Limpiar</button>
        )}
      </div>

      {historial.length === 0 ? (
        <div className="empty">No hay envíos registrados todavía</div>
      ) : (
        <div className="historial-lista">
          {historial.map((envio) => {
            const exitosos = envio.resultados.filter((r) => r.estado === "enviado").length;
            const fallidos = envio.resultados.filter((r) => r.estado === "error").length;
            const abierto = expandido === envio.id;

            return (
              <div className="historial-item" key={envio.id}>
                <div
                  className="historial-header"
                  onClick={() => setExpandido(abierto ? null : envio.id)}
                >
                  <div className="historial-meta">
                    <span className="historial-fecha">{formatFecha(envio.fecha)}</span>
                    <div className="historial-stats">
                      <span className="stat-ok">✓ {exitosos} enviados</span>
                      {fallidos > 0 && (
                        <span className="stat-err">✕ {fallidos} errores</span>
                      )}
                    </div>
                  </div>
                  <span className="chevron">{abierto ? "▲" : "▼"}</span>
                </div>

                {abierto && (
                  <div className="historial-detalle">
                    {envio.resultados.map((r, i) => (
                      <div
                        key={i}
                        className={`detalle-row ${r.estado === "error" ? "detalle-error" : ""}`}
                      >
                        <span className="detalle-icono">
                          {r.estado === "enviado" ? "✓" : "✕"}
                        </span>
                        <span className="detalle-nombre">{r.nombre}</span>
                        <span className="detalle-numero">+{r.numero}</span>
                        {r.error && <span className="detalle-msg">{r.error}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
