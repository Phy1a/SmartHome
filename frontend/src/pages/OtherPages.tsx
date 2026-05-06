import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getDeviceStats,
  getAlerts,
  getNews,
  getPublicMembers,
  addNews,
} from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import { useToast, ToastContainer } from "../hooks/useToast";
import { formatDate } from "../utils/helpers";
import type { DeviceStats, Alert, NewsItem, PublicMember } from "../types";

const COLORS = [
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
];

// ===== EXPORT UTILITIES =====
function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(","),
    ...data.map((row: Record<string, any>) =>
      keys
        .map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportButtons({ stats }: { stats: DeviceStats }) {
  const [open, setOpen] = useState(false);

  const exports = [
    {
      label: "📊 Appareils par type (CSV)",
      action: () => exportCSV(stats.byType, "appareils_par_type.csv"),
    },
    {
      label: "🏠 Appareils par pièce (CSV)",
      action: () => exportCSV(stats.byRoom, "appareils_par_piece.csv"),
    },
    {
      label: "⚡ Consommation 7 jours (CSV)",
      action: () => exportCSV(stats.energyTrend, "consommation_energie.csv"),
    },
    {
      label: "📦 Rapport complet (JSON)",
      action: () => exportJSON(stats, "rapport_smarthome.json"),
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(!open)}>
        ⬇️ Exporter
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 6,
              zIndex: 100,
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 10,
              boxShadow: "var(--shadow-lg)",
              minWidth: 260,
              overflow: "hidden",
            }}
          >
            {exports.map((e, i) => (
              <button
                key={i}
                onClick={() => {
                  e.action();
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 16px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "var(--font)",
                  borderBottom:
                    i < exports.length - 1
                      ? "1px solid var(--border-light)"
                      : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                {e.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ===== STATS PAGE =====
export function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeviceStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span>Chargement...</span>
      </div>
    );
  if (!stats) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            📊 Statistiques & Rapports
          </h2>
          <p className="text-muted">
            Surveillance et optimisation des ressources
          </p>
        </div>
        <ExportButtons stats={stats} />
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon purple">🔌</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Appareils enregistrés</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value" style={{ color: "var(--secondary)" }}>
              {stats.active}
            </div>
            <div className="stat-label">Actifs en ce moment</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⚡</div>
          <div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>
              {stats.totalEnergy} kWh
            </div>
            <div className="stat-label">Consommation totale</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⛔</div>
          <div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>
              {stats.inactive}
            </div>
            <div className="stat-label">Inactifs</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-container">
          <div className="card-title" style={{ marginBottom: 16 }}>
            Répartition par type
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={stats.byType}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ type, percent }) =>
                  `${type} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {stats.byType.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="card-title" style={{ marginBottom: 16 }}>
            Appareils par pièce
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.byRoom} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="room"
                type="category"
                tick={{ fontSize: 11 }}
                width={90}
              />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="count"
                fill="var(--primary)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.energyTrend?.length > 0 && (
        <div className="chart-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div className="card-title">
              ⚡ Consommation énergétique — 7 derniers jours
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => exportCSV(stats.energyTrend, "energie_7jours.csv")}
            >
              ⬇️ CSV
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.energyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(v) => [`${v} kWh`, "Consommation"]}
              />
              <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ===== ALERTS PAGE =====
export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getAlerts()
      .then((r) => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? alerts.filter((a) => a.severity === filter)
    : alerts;
  const severityIcon = { info: "ℹ️", warning: "⚠️", critical: "🚨" };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            🔔 Alertes système
          </h2>
          <p className="text-muted">
            {alerts.filter((a) => !a.isRead).length} alerte(s) non lue(s)
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["", "info", "warning", "critical"].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(s)}
            >
              {s === ""
                ? "Toutes"
                : s === "info"
                  ? "ℹ️ Info"
                  : s === "warning"
                    ? "⚠️ Attention"
                    : "🚨 Critique"}
            </button>
          ))}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => exportCSV(alerts, "alertes.csv")}
          >
            ⬇️ CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : (
        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon">✅</div>
              <h3>Aucune alerte</h3>
            </div>
          ) : (
            filtered.map((a) => (
              <div
                key={a.id}
                className={`alert-item ${a.severity}`}
                style={{ marginBottom: 8 }}
              >
                <span style={{ fontSize: 20 }}>
                  {severityIcon[a.severity] || "ℹ️"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {a.deviceName || "Système"}
                    </div>
                    <span
                      className={`badge ${a.severity === "critical" ? "badge-red" : a.severity === "warning" ? "badge-amber" : "badge-purple"}`}
                    >
                      {a.type}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {a.message}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 4,
                    }}
                  >
                    {formatDate(a.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ===== NEWS PAGE =====
export function NewsPage() {
  const { canAccess } = useAuth();
  const { toasts, toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "général",
  });
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  const load = () =>
    getNews()
      .then((r) => setNews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.title || !form.content) {
      toast.error("Titre et contenu requis");
      return;
    }
    try {
      await addNews(form);
      toast.success("Actualité publiée !");
      setShowForm(false);
      setForm({ title: "", content: "", category: "général" });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erreur");
    }
  };

  const categories = [...new Set(news.map((n) => n.category))];
  const filtered = news.filter(
    (n) =>
      (!search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCat || n.category === filterCat),
  );

  const catColor: Record<string, string> = {
    général: "var(--primary)",
    appareil: "var(--secondary)",
    énergie: "var(--accent)",
    automatisation: "#3B82F6",
  };

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            📰 Actualités
          </h2>
          <p className="text-muted">Informations et annonces de la maison</p>
        </div>
        {canAccess("expert") && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Annuler" : "➕ Publier"}
          </button>
        )}
      </div>

      {showForm && (
        <div
          className="card"
          style={{ marginBottom: 20, borderLeft: "4px solid var(--primary)" }}
        >
          <div className="card-title" style={{ marginBottom: 16 }}>
            Nouvelle actualité
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Titre</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {[
                  "général",
                  "appareil",
                  "énergie",
                  "automatisation",
                  "sécurité",
                  "maintenance",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contenu</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 100 }}
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={submit}>
              Publier
            </button>
          </div>
        </div>
      )}

      <div
        style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          className="form-input"
          style={{ maxWidth: 280 }}
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || filterCat) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearch("");
              setFilterCat("");
            }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : (
        <div className="news-grid">
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3>Aucune actualité</h3>
            </div>
          )}
          {filtered.map((n) => (
            <div className="news-card" key={n.id}>
              <div
                className="news-card-top"
                style={{ background: catColor[n.category] || "var(--primary)" }}
              />
              <div className="news-card-body">
                <span
                  className="news-card-cat"
                  style={{ color: catColor[n.category] || "var(--primary)" }}
                >
                  {n.category}
                </span>
                <div className="news-card-title">{n.title}</div>
                <div className="news-card-content">{n.content}</div>
                <div className="news-card-date">
                  Par {n.author} · {formatDate(n.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== MEMBERS PAGE =====
export function MembersPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  useEffect(() => {
    getPublicMembers()
      .then((r) => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = members.filter(
    (m) =>
      (!search ||
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.memberType?.toLowerCase().includes(search.toLowerCase())) &&
      (!filterLevel || m.level === filterLevel),
  );

  const levelColor = {
    débutant: "badge-gray",
    intermédiaire: "badge-green",
    avancé: "badge-purple",
    expert: "badge-amber",
  };
  const levelBg = {
    débutant: "#9ca3af",
    intermédiaire: "var(--secondary)",
    avancé: "var(--primary)",
    expert: "var(--accent)",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          👥 Membres de la maison
        </h2>
        <p className="text-muted">
          {members.length} membre(s) actif(s) — Cliquez sur un profil pour le
          consulter
        </p>
      </div>

      <div
        style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          className="form-input"
          style={{ maxWidth: 260 }}
          placeholder="🔍 Nom, rôle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">Tous les niveaux</option>
          {["débutant", "intermédiaire", "avancé", "expert"].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((m) => (
            <div
              key={m.id}
              className="card"
              style={{
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => navigate(`/members/${m.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  background: levelBg[m.level] || "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "white",
                  boxShadow: `0 4px 12px ${levelBg[m.level]}44`,
                }}
              >
                {m.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                {m.username}
              </div>
              <div
                className="text-muted text-small"
                style={{ marginBottom: 8 }}
              >
                {m.memberType}
                {m.age ? ` · ${m.age} ans` : ""}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <span
                  className={`badge ${levelColor[m.level] || "badge-gray"}`}
                >
                  {m.level}
                </span>
                <span
                  className="badge badge-purple"
                  style={{ fontFamily: "var(--mono)" }}
                >
                  {m.points?.toFixed(1)} pts
                </span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
              >
                Voir le profil →
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
              <div className="icon">👤</div>
              <h3>Aucun membre trouvé</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
