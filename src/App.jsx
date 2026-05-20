import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

const fetcher = (url, opts) =>
  fetch(`${API}${url}`, opts).then((r) => r.json());

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);
const IconUsers = () => (
  <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
);
const IconMsg = () => (
  <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
);
const IconHistory = () => <Icon d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3" />;
const IconSend = () => <Icon d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />;
const IconPlus = () => <Icon d="M12 5v14M5 12h14" />;
const IconTrash = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const IconCheck = () => <Icon d="M20 6 9 17l-5-5" />;
const IconWifi = () => (
  <Icon d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
);

export default function App() {
  const [tab, setTab] = useState("contactos");
  const [status, setStatus] = useState("desconectado");
  const [contactos, setContactos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [mensajeEdit, setMensajeEdit] = useState("");
  const [editando, setEditando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoNumero, setNuevoNumero] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [qrImg, setQrImg] = useState(null);

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargarDatos = useCallback(async () => {
    try {
      const [s, c, m, h] = await Promise.all([
        fetcher("/api/status")
          .then((s) => {
            setStatus(s.status);
            setQrImg(s.qr);
          })
          .catch(() => {}),
        fetcher("/api/contactos"),
        fetcher("/api/mensaje"),
        fetcher("/api/historial"),
      ]);
      setStatus(s.status);
      setContactos(c);
      setMensaje(m.texto);
      setMensajeEdit(m.texto);
      setHistorial(h);
    } catch {}
  }, []);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(() => {
      fetcher("/api/status")
        .then((s) => setStatus(s.status))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const agregarContacto = async () => {
    if (!nuevoNombre.trim() || !nuevoNumero.trim()) return;
    const nuevo = await fetcher("/api/contactos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nuevoNombre.trim(),
        numero: nuevoNumero.trim(),
      }),
    });
    setContactos((prev) => [...prev, nuevo]);
    setNuevoNombre("");
    setNuevoNumero("");
    showToast("Contacto agregado");
  };

  const eliminarContacto = async (id) => {
    await fetcher(`/api/contactos/${id}`, { method: "DELETE" });
    setContactos((prev) => prev.filter((c) => c.id !== id));
    showToast("Contacto eliminado");
  };

  const guardarMensaje = async () => {
    setGuardando(true);
    await fetcher("/api/mensaje", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: mensajeEdit }),
    });
    setMensaje(mensajeEdit);
    setEditando(false);
    setGuardando(false);
    showToast("Mensaje guardado");
  };

  const enviarAhora = async () => {
    if (status !== "listo")
      return showToast("El bot no está conectado", "error");
    setEnviando(true);
    const res = await fetcher("/api/enviar", { method: "POST" });
    setEnviando(false);
    if (res.ok) {
      showToast("Envío iniciado 🚀");
      setTimeout(cargarDatos, 5000);
    } else {
      showToast(res.error || "Error al enviar", "error");
    }
  };

  const statusColor =
    { listo: "#22c55e", esperando_qr: "#f59e0b", desconectado: "#ef4444" }[
      status
    ] || "#ef4444";
  const statusLabel =
    {
      listo: "Conectado",
      esperando_qr: "Esperando QR",
      desconectado: "Desconectado",
    }[status] || status;

  return (
    <div style={styles.root}>
      {/* TOAST */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.tipo === "error" ? "#ef4444" : "#166534",
          }}
        >
          {toast.tipo === "ok" ? <IconCheck /> : "⚠"} {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>💚</div>
          <div>
            <div style={styles.logoTitle}>Hogar de Ancianos</div>
            <div style={styles.logoSub}>Panel de recordatorios</div>
          </div>
        </div>
        <div style={styles.statusBadge}>
          <div style={{ ...styles.statusDot, background: statusColor }} />
          <span style={{ color: statusColor, fontSize: 13, fontWeight: 600 }}>
            {statusLabel}
          </span>
        </div>
        {status === "esperando_qr" && qrImg && (
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 12,
              display: "inline-block",
              margin: "16px 24px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#111",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Escaneá con WhatsApp → Dispositivos vinculados
            </div>
            <img
              src={qrImg}
              alt="QR WhatsApp"
              style={{ width: 220, height: 220, display: "block" }}
            />
          </div>
        )}
      </header>

      {/* TABS */}
      <nav style={styles.nav}>
        {[
          { id: "contactos", label: "Contactos", icon: <IconUsers /> },
          { id: "mensaje", label: "Mensaje", icon: <IconMsg /> },
          { id: "historial", label: "Historial", icon: <IconHistory /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main style={styles.main}>
        {/* ── CONTACTOS ── */}
        {tab === "contactos" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Contactos <span style={styles.badge}>{contactos.length}</span>
              </h2>
            </div>

            {/* Agregar */}
            <div style={styles.addBox}>
              <input
                style={styles.input}
                placeholder="Nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="Número (ej: 5492346567607)"
                value={nuevoNumero}
                onChange={(e) => setNuevoNumero(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarContacto()}
              />
              <button style={styles.btnGreen} onClick={agregarContacto}>
                <IconPlus /> Agregar
              </button>
            </div>

            <div style={styles.hint}>
              Formato: código país + código área sin 0 + número. Ejemplo:{" "}
              <code style={styles.code}>5492346123456</code>
            </div>

            {/* Lista */}
            <div style={styles.list}>
              {contactos.length === 0 && (
                <div style={styles.empty}>
                  Sin contactos. Agregá el primero arriba.
                </div>
              )}
              {contactos.map((c) => (
                <div key={c.id} style={styles.listItem}>
                  <div style={styles.avatar}>{c.nombre[0].toUpperCase()}</div>
                  <div style={styles.listInfo}>
                    <div style={styles.listName}>{c.nombre}</div>
                    <div style={styles.listNum}>+{c.numero}</div>
                  </div>
                  <button
                    style={styles.btnDanger}
                    onClick={() => eliminarContacto(c.id)}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MENSAJE ── */}
        {tab === "mensaje" && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Mensaje</h2>
              {!editando && (
                <button
                  style={styles.btnOutline}
                  onClick={() => setEditando(true)}
                >
                  ✏️ Editar
                </button>
              )}
            </div>

            {editando ? (
              <>
                <textarea
                  style={styles.textarea}
                  value={mensajeEdit}
                  onChange={(e) => setMensajeEdit(e.target.value)}
                  rows={10}
                />
                <div style={styles.hint}>
                  Usá <code style={styles.code}>{"{{fecha}}"}</code> y se
                  reemplazará automáticamente con la fecha del envío.
                </div>
                <div style={styles.btnRow}>
                  <button
                    style={styles.btnGhost}
                    onClick={() => {
                      setEditando(false);
                      setMensajeEdit(mensaje);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    style={styles.btnGreen}
                    onClick={guardarMensaje}
                    disabled={guardando}
                  >
                    <IconCheck /> {guardando ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.msgPreview}>
                {mensaje.split("\n").map((l, i) => (
                  <div key={i}>{l || <br />}</div>
                ))}
              </div>
            )}

            {/* Enviar ahora */}
            <div style={styles.sendBox}>
              <div>
                <div style={styles.sendTitle}>Envío manual</div>
                <div style={styles.sendSub}>
                  El envío automático ocurre el día 27 de cada mes a las 10:00
                  hs.
                </div>
              </div>
              <button
                style={{
                  ...styles.btnSend,
                  opacity: status !== "listo" || enviando ? 0.5 : 1,
                  cursor:
                    status !== "listo" || enviando ? "not-allowed" : "pointer",
                }}
                onClick={enviarAhora}
                disabled={status !== "listo" || enviando}
              >
                <IconSend /> {enviando ? "Enviando..." : "Enviar ahora"}
              </button>
            </div>
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === "historial" && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Historial de envíos</h2>
            {historial.length === 0 && (
              <div style={styles.empty}>Todavía no hay envíos registrados.</div>
            )}
            {historial.map((h) => (
              <div key={h.id} style={styles.histCard}>
                <div style={styles.histHeader}>
                  <div style={styles.histDate}>
                    {new Date(h.fecha).toLocaleString("es-AR")}
                  </div>
                  <div style={styles.histStats}>
                    <span style={{ color: "#22c55e" }}>
                      ✓ {h.enviados.length}
                    </span>
                    {h.fallidos.length > 0 && (
                      <span style={{ color: "#ef4444", marginLeft: 8 }}>
                        ✗ {h.fallidos.length}
                      </span>
                    )}
                  </div>
                </div>
                {h.enviados.length > 0 && (
                  <div style={styles.histGroup}>
                    <div style={styles.histGroupLabel}>Enviados</div>
                    {h.enviados.map((e, i) => (
                      <div key={i} style={styles.histRow}>
                        <span style={{ color: "#22c55e" }}>✓</span> {e.nombre}{" "}
                        <span style={styles.histNum}>+{e.numero}</span>
                      </div>
                    ))}
                  </div>
                )}
                {h.fallidos.length > 0 && (
                  <div style={styles.histGroup}>
                    <div style={{ ...styles.histGroupLabel, color: "#ef4444" }}>
                      Fallidos
                    </div>
                    {h.fallidos.map((f, i) => (
                      <div key={i} style={styles.histRow}>
                        <span style={{ color: "#ef4444" }}>✗</span> {f.nombre} —{" "}
                        <span style={styles.histNum}>{f.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0f1117",
    color: "#e2e8f0",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 0 60px",
  },
  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 999,
    padding: "10px 18px",
    borderRadius: 10,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 4px 20px rgba(0,0,0,.4)",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #1e2535",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logo: { fontSize: 32 },
  logoTitle: { fontWeight: 700, fontSize: 17, color: "#f1f5f9" },
  logoSub: { fontSize: 12, color: "#64748b" },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#1e2535",
    padding: "6px 12px",
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: "50%" },
  nav: {
    display: "flex",
    borderBottom: "1px solid #1e2535",
    padding: "0 16px",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "14px 18px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    borderBottom: "2px solid transparent",
    transition: "all .2s",
  },
  tabActive: {
    color: "#22c55e",
    borderBottomColor: "#22c55e",
  },
  main: { padding: "24px 24px 0" },
  section: { display: "flex", flexDirection: "column", gap: 16 },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    background: "#1e2535",
    color: "#94a3b8",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 12,
  },
  addBox: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: 140,
    padding: "10px 14px",
    background: "#1e2535",
    border: "1px solid #2d3748",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
  },
  hint: { fontSize: 12, color: "#64748b" },
  code: {
    background: "#1e2535",
    padding: "1px 6px",
    borderRadius: 4,
    fontFamily: "monospace",
  },
  list: { display: "flex", flexDirection: "column", gap: 8 },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1e2535",
    padding: "12px 16px",
    borderRadius: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#16423c",
    color: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  listInfo: { flex: 1 },
  listName: { fontWeight: 600, fontSize: 15, color: "#f1f5f9" },
  listNum: { fontSize: 12, color: "#64748b", marginTop: 2 },
  empty: {
    color: "#64748b",
    textAlign: "center",
    padding: "30px 0",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    padding: "14px",
    background: "#1e2535",
    border: "1px solid #2d3748",
    borderRadius: 10,
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    lineHeight: 1.6,
  },
  msgPreview: {
    background: "#1e2535",
    padding: "16px",
    borderRadius: 10,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#cbd5e1",
    borderLeft: "3px solid #22c55e",
  },
  btnRow: { display: "flex", gap: 8, justifyContent: "flex-end" },
  btnGreen: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 18px",
    background: "#16a34a",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  btnGhost: {
    padding: "10px 18px",
    background: "transparent",
    border: "1px solid #2d3748",
    borderRadius: 8,
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 14,
  },
  btnOutline: {
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid #2d3748",
    borderRadius: 8,
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
  },
  btnDanger: {
    padding: "8px",
    background: "transparent",
    border: "1px solid #2d3748",
    borderRadius: 8,
    color: "#ef4444",
    cursor: "pointer",
    display: "flex",
  },
  sendBox: {
    marginTop: 8,
    background: "#1e2535",
    padding: "18px",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    borderTop: "1px solid #2d3748",
  },
  sendTitle: { fontWeight: 600, fontSize: 15, color: "#f1f5f9" },
  sendSub: { fontSize: 12, color: "#64748b", marginTop: 3 },
  btnSend: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 22px",
    background: "#15803d",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    transition: "all .2s",
  },
  histCard: {
    background: "#1e2535",
    borderRadius: 12,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  histHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  histDate: { fontWeight: 600, fontSize: 14, color: "#f1f5f9" },
  histStats: { fontSize: 14, fontWeight: 600 },
  histGroup: { display: "flex", flexDirection: "column", gap: 4 },
  histGroupLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  histRow: {
    fontSize: 13,
    color: "#94a3b8",
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  histNum: { color: "#475569" },
};
