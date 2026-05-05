import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNews, getPublicMembers } from "../utils/api";
import type { NewsItem, PublicMember } from "../types";
import "../css/index.css";
import "../css/PublicPage.css";

export default function PublicPage() {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [tab, setTab] = useState("news");

  useEffect(() => {
    getNews()
      .then((r) => {
        setNews(r.data);
      })
      .catch(() => {});
    getPublicMembers()
      .then((r) => setMembers(r.data))
      .catch(() => {});
  }, []); // useEffect with empty array to only use the API one time at the start of the page

  const filteredNews = news.filter(
    (news: NewsItem) =>
      (!search || // if search is empty
        news.title.toLowerCase().includes(search.toLowerCase()) || // check if string of title is contained in the search
        news.content.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCat || //checks is empty
        news.category === filterCat),
  );

  const categories = [...new Set(news.map((n) => n.category))]; // set is used to not have doubloons

  return (
    <div className="hero">
      {/* HERO */}
      <div className="hero-body">
        <div className="hero-badge">🏠 Maison Intelligente · IoT Platform</div>
        <h1 className="hero-title">
          Votre maison,
          <br />
          <span>intelligente</span>
        </h1>
        <p className="hero-subtitle">
          Gérez tous vos appareils connectés depuis une plateforme unique.
          Thermostat, caméras, éclairage, électroménager — tout sous contrôle.
        </p>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/login")}
          >
            Accéder à la plateforme →
          </button>
          <button
            className="btn btn-lg"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
            onClick={() =>
              document
                .getElementById("info-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explorer
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginTop: 64,
            maxWidth: 720,
            width: "100%",
          }}
        >
          {[
            {
              icon: "🌡️",
              title: "Thermostats",
              desc: "Contrôle précis de la température pièce par pièce",
            },
            {
              icon: "📷",
              title: "Caméras",
              desc: "Surveillance en temps réel de votre domicile",
            },
            {
              icon: "⚡",
              title: "Énergie",
              desc: "Suivi et optimisation de la consommation",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 20,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 6,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        id="info-section"
        style={{ background: "var(--bg)", padding: "60px 40px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Explorer la plateforme
          </h2>
          <p className="text-muted" style={{ marginBottom: 32 }}>
            Actualités et membres de la communauté SmartHome
          </p>

          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 24,
              background: "white",
              borderRadius: 10,
              padding: 4,
              border: "1px solid var(--border)",
              width: "fit-content",
            }}
          >
            {[
              ["news", "📰 Actualités"],
              ["members", "👥 Membres"],
            ].map(([id, label]) => (
              <button
                className="btn btn-lg"
                key={id}
                onClick={() => setTab(id)}
                style={{
                  transition: "all 0.2s",
                  background: tab === id ? "var(--primary)" : "transparent",
                  color: tab === id ? "white" : "var(--text-secondary)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "news" && ( // reactive display based on choice of user to display news or people
            <>
              <div className="search-bar" style={{ gap: 32 }}>
                <div className="search-field">
                  <label>Rechercher</label>
                  <input
                    className="form-input"
                    placeholder="Mot-clé..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="search-field">
                  <label>Catégorie</label>
                  <select
                    className="form-select"
                    style={{ minWidth: 160 }}
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                  >
                    <option value="">Toutes</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
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
              <div className="news-grid">
                {filteredNews.length === 0 && (
                  <div className="empty-state">
                    <div className="icon">📭</div>
                    <h3>Aucun résultat</h3>
                  </div>
                )}
                {filteredNews.map((n) => (
                  <div className="news-card" key={n.id}>
                    <div
                      className="news-card-top"
                      style={{
                        background:
                          n.category === "énergie"
                            ? "var(--accent)"
                            : n.category === "appareil"
                              ? "var(--secondary)"
                              : "var(--primary)",
                      }}
                    />
                    <div className="news-card-body">
                      <span className="news-card-cat">{n.category}</span>
                      <div className="news-card-title">{n.title}</div>
                      <div className="news-card-content">{n.content}</div>
                      <div className="news-card-date">
                        Par {n.author} · {n.createdAt}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "members" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {members.map((m) => (
                <div
                  key={m.id}
                  className="card"
                  style={{ textAlign: "center" }}
                >
                  <div
                    className="user-avatar"
                    style={{
                      width: 56,
                      height: 56,
                      fontSize: 24,
                      margin: "0 auto 12px",
                    }}
                  >
                    {m.username?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    {m.username}
                  </div>
                  <div
                    className="text-muted text-small"
                    style={{ marginBottom: 8 }}
                  >
                    {m.memberType}
                  </div>
                  <span
                    className={`badge ${m.level === "expert" ? "badge-amber" : m.level === "avancé" ? "badge-purple" : m.level === "intermédiaire" ? "badge-green" : "badge-gray"}`}
                  >
                    {m.level}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 60 }}>
            <div
              style={{
                background: "var(--night)",
                borderRadius: 16,
                padding: "40px 60px",
                display: "inline-block",
                maxWidth: 500,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>🔑</div>
              <div
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Rejoindre la plateforme
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                Créez votre compte pour accéder à tous les services
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                S'inscrire maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
