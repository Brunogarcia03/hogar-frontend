import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "";

export default function Mensaje() {
  const [texto, setTexto] = useState("");
  const [diaEnvio, setDiaEnvio] = useState(1);
  const [horaEnvio, setHoraEnvio] = useState("10:00");
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/mensaje`)
      .then((r) => r.json())
      .then((d) => {
        setTexto(d.texto);
        setDiaEnvio(d.diaEnvio);
        setHoraEnvio(d.horaEnvio);
      });
  }, []);

  const guardar = async () => {
    await fetch(`${API}/api/mensaje`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, diaEnvio, horaEnvio }),
    });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const enviarAhora = async () => {
    if (!confirm("¿Enviar el mensaje ahora a todos los contactos?")) return;
    setEnviando(true);
    setResultadoEnvio(null);
    try {
      const res = await fetch(`${API}/api/enviar`, { method: "POST" });
      const data = await res.json();
      setResultadoEnvio(data);
    } catch (err) {
      setResultadoEnvio({ error: "Error de red" });
    }
    setEnviando(false);
  };

  const preview = texto.replace("{{fecha}}", new Date().toLocaleDateString("es-AR"));

  return (
    <div className="page">
      <div className="page-header">
        <h2>Mensaje</h2>
      </div>

      <div className="mensaje-grid">
        <div className="card">
          <h3>Configurar mensaje</h3>

          <div className="field">
            <label>Texto del mensaje</label>
            <p className="hint">Usá <code>{"{{fecha}}"}</code> para insertar la fecha automáticamente</p>
            <textarea
              rows={8}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label>Día del mes (1–28)</label>
              <input
                type="number"
                min={1}
                max={28}
                value={diaEnvio}
                onChange={(e) => setDiaEnvio(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Hora de envío</label>
              <input
                type="time"
                value={horaEnvio}
                onChange={(e) => setHoraEnvio(e.target.value)}
              />
            </div>
          </div>

          <div className="btn-row">
            <button className="btn-primary" onClick={guardar}>
              {guardado ? "✓ Guardado" : "Guardar cambios"}
            </button>
            <button
              className="btn-secondary"
              onClick={enviarAhora}
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "⚡ Enviar ahora"}
            </button>
          </div>

          {resultadoEnvio && (
            <div className={`resultado ${resultadoEnvio.error ? "error" : "success"}`}>
              {resultadoEnvio.error
                ? `Error: ${resultadoEnvio.error}`
                : `✓ Enviado a ${resultadoEnvio.resultados?.length} contactos`}
            </div>
          )}
        </div>

        <div className="card preview-card">
          <h3>Vista previa</h3>
          <div className="whatsapp-bubble">
            <pre>{preview}</pre>
            <span className="bubble-time">
              {new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="schedule-info">
            📅 Envío automático: día <strong>{diaEnvio}</strong> de cada mes a las <strong>{horaEnvio}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
