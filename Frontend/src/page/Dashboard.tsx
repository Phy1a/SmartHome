// src/pages/Dashboard.tsx
import { useState } from "react";

const C = {
  bg: "#13112b", card: "#1e1b3a", border: "#2a2650",
  purple: "#7c5cfc", text: "#ffffff", muted: "#6e6c95", sub: "#9896c8",
};

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("Tous");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>HomeSync</span>
          <button style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: C.sub }}>☰</button>
        </div>

        {/* Hero */}
        <div style={{ background: C.card, borderRadius: 20, padding: 20, marginBottom: 14, border: `1px solid ${C.border}` }}>
          <p style={{ color: C.sub, fontSize: 12, margin: "0 0 4px" }}>Maison intelligente</p>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 6px", lineHeight: 1.35 }}>
            Bienvenue dans votre maison connectée
          </h2>
          <p style={{ color: C.muted, fontSize: 12, margin: "0 0 14px" }}>
            Gérez, surveillez et optimisez tous vos appareils depuis une seule plateforme.
          </p>

          {/* En temps réel */}
          <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid #252245`, marginBottom: 14 }}>
            <p style={{ color: C.sub, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>En temps réel</p>
            {[["Thermostat Salon", "21°C"], ["Lumière Cuisine", "Allumée"], ["Caméra Entrée", "Active"]].map(([name, val]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span style={{ color: "#c8c6e8", fontSize: 12 }}>• {name}</span>
                <span style={{ color: C.sub, fontSize: 12 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Boutons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            <button style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 12, padding: 12, fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Rejoindre la maison
            </button>
            <button style={{ background: "transparent", color: "#c8c6e8", border: `1px solid #3d3875`, borderRadius: 12, padding: 11, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
              Se connecter
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {[{ val: "15", label: "Objets connectés" }, { val: "5", label: "Membres" }].map(s => (
              <div key={s.label} style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 12px", border: `1px solid #252245` }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{s.val}</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 12px", border: `1px solid #252245` }}>
              <div style={{ color: "#c084fc", fontSize: 15, fontWeight: 700 }}>4.2kW</div>
              <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Conso. actuelle</div>
            </div>
            <div style={{ flex: 1, background: C.bg, borderRadius: 12, padding: "10px 12px", border: `1px solid #252245` }}>
              <div style={{ color: "#4ade80", fontSize: 15, fontWeight: 700 }}>-8%</div>
              <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>vs semaine préc.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, borderRadius: 12, padding: "10px 14px", border: `1px solid ${C.border}` }}>
          <span style={{ color: "#4e4c78" }}>🔍</span>
          <input placeholder="Rechercher un appareil..." style={{ background: "none", border: "none", outline: "none", color: C.sub, fontFamily: "inherit", fontSize: 13, flex: 1 }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {["Tous", "Type", "État"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              background: activeFilter === f ? C.purple : "transparent",
              color: activeFilter === f ? "#fff" : C.muted,
              border: `1px solid ${activeFilter === f ? C.purple : C.border}`
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Catégories */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <p style={{ color: C.sub, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>Catégories</p>
        {[
          { icon: "💡", name: "Éclairage", count: "3 appareils", bg: "#2a2015" },
          { icon: "🌡", name: "Thermostats", count: "3 zones", bg: "#1e2840" },
          { icon: "📷", name: "Sécurité", count: "4 caméras", bg: "#1c1e40" },
        ].map(cat => (
          <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, borderRadius: 14, padding: "13px 14px", border: `1px solid ${C.border}`, marginBottom: 8, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{cat.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#dddcf5", fontSize: 13, fontWeight: 500 }}>{cat.name}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{cat.count}</div>
            </div>
            <span style={{ color: "#3d3875", fontSize: 16 }}>›</span>
          </div>
        ))}
      </div>

      {/* Actualités */}
      <div style={{ padding: "0 20px 100px" }}>
        <p style={{ color: C.sub, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>Dernières actualités</p>
        {[
          { dot: "#f87171", title: "Consommation élevée détectée", time: "Il y a 5 min", badge: "Alerte", bc: "#f87171", bb: "#2d1515" },
          { dot: "#fbbf24", title: "Batterie faible — Thermostat Chambre", time: "Il y a 3 h", badge: "Avert.", bc: "#fbbf24", bb: "#2a2010" },
          { dot: "#818cf8", title: "Thermostat Salon mis à jour", time: "Cette semaine", badge: "Info", bc: "#818cf8", bb: "#1e1d3a" },
        ].map(n => (
          <div key={n.title} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.card, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, flexShrink: 0, marginTop: 4 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#dddcf5", fontSize: 13, fontWeight: 500 }}>{n.title}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{n.time}</div>
            </div>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: n.bb, color: n.bc }}>{n.badge}</span>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "12px 20px 24px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
        {[{ icon: "🏠", label: "Accueil", active: true }, { icon: "📱", label: "Appareils" }, { icon: "📊", label: "Stats" }, { icon: "👤", label: "Profil" }].map(n => (
          <div key={n.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 10, color: n.active ? C.purple : C.muted }}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}