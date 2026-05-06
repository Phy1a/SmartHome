import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { updateProfile, getMe } from "../utils/api";
import { useToast, ToastContainer } from "../hooks/useToast";
import { formatDate } from "../utils/helpers";
import type { ProfileForm } from "../types";

type dictLevel = "débutant" | "intermédiaire" | "avancé" | "expert";

const MEMBER_TYPES = ["père", "mère", "enfant", "membre", "autre"];
const LEVEL_POINTS = {
  débutant: 1,
  intermédiaire: 3,
  avancé: 5,
  expert: 7,
};
const LEVELS = ["débutant", "intermédiaire", "avancé", "expert"];

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const { toasts, toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age || "",
    gender: user?.gender || "",
    birthDate: user?.birthDate || "",
    memberType: user?.memberType || "membre",
    photoUrl: user?.photoUrl || "",
    newPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const userLevelIdx = LEVELS.indexOf(user?.level || "débutant");

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      const res = await getMe();
      setUser(res.data);
      toast.success("Profil mis à jour !");
      setEditing(false);
      setForm((f) => ({ ...f, newPassword: "" }));
    } catch (err) {
      toast.error(
        (err as any).response?.data?.error || "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const pts = user?.points || 0;
  const nextLevel = LEVELS[userLevelIdx + 1];
  let nextPts = null;
  if (nextLevel) {
    if (
      nextLevel === "débutant" ||
      nextLevel === "intermédiaire" ||
      nextLevel === "avancé" ||
      nextLevel === "expert"
    )
      nextPts = LEVEL_POINTS[nextLevel];
  }
  const progress = nextPts ? Math.min((pts / nextPts) * 100, 100) : 100;

  return (
    <div>
      <ToastContainer toasts={toasts} />

      <div
        style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}
      >
        {/* LEFT — Avatar & Level */}
        <div>
          <div
            className="card"
            style={{ textAlign: "center", marginBottom: 16 }}
          >
            <div
              className="user-avatar"
              style={{
                width: 80,
                height: 80,
                fontSize: 36,
                margin: "0 auto 16px",
              }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
              {user?.firstName} {user?.lastName}
            </h3>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              @{user?.username}
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {user?.memberType}
            </div>

            <div
              style={{
                background: "var(--night)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  marginBottom: 4,
                }}
              >
                NIVEAU
              </div>
              <div
                style={{
                  color: "var(--accent)",
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "var(--mono)",
                }}
              >
                {user?.level?.toUpperCase()}
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "var(--mono)",
                }}
              >
                {pts.toFixed(2)} pts
              </div>
              <div
                className="progress-bar"
                style={{ background: "rgba(255,255,255,0.1)", marginTop: 10 }}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%`, background: "var(--accent)" }}
                />
              </div>
              {nextLevel && (
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 11,
                    marginTop: 6,
                  }}
                >
                  Prochain niveau : {nextLevel} ({nextPts} pts)
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 8,
                  padding: "10px 8px",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--primary)",
                  }}
                >
                  {user?.loginCount || 0}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Connexions
                </div>
              </div>
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 8,
                  padding: "10px 8px",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--secondary)",
                  }}
                >
                  {user?.actionCount || 0}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Actions
                </div>
              </div>
            </div>
          </div>

          {/* Level progression */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>
              Progression des niveaux
            </div>
            {LEVELS.map((lvl, i) => (
              <div
                key={lvl}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom:
                    i < LEVELS.length - 1
                      ? "1px solid var(--border-light)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    background:
                      i <= userLevelIdx ? "var(--primary)" : "var(--bg)",
                    color: i <= userLevelIdx ? "white" : "var(--text-muted)",
                  }}
                >
                  {i <= userLevelIdx ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color:
                        i === userLevelIdx
                          ? "var(--primary)"
                          : "var(--text-primary)",
                    }}
                  >
                    {lvl} {i === userLevelIdx && "← vous"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {LEVEL_POINTS[lvl as dictLevel]}
                    point(s) requis
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Profile form */}
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Informations du profil</div>
              {!editing ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Modifier
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditing(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "..." : "💾 Enregistrer"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                Informations publiques
              </div>
              <div className="grid-2">
                {editing ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Prénom</label>
                      <input
                        className="form-input"
                        value={form.firstName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, firstName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom</label>
                      <input
                        className="form-input"
                        value={form.lastName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, lastName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Âge</label>
                      <input
                        className="form-input"
                        type="number"
                        value={form.age}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, age: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Genre</label>
                      <select
                        className="form-select"
                        value={form.gender}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, gender: e.target.value }))
                        }
                      >
                        <option value="">Non précisé</option>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date de naissance</label>
                      <input
                        className="form-input"
                        type="date"
                        value={form.birthDate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, birthDate: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type de membre</label>
                      <select
                        className="form-select"
                        value={form.memberType}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, memberType: e.target.value }))
                        }
                      >
                        {MEMBER_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      className="form-group"
                      style={{ gridColumn: "span 2" }}
                    >
                      <label className="form-label">URL Photo de profil</label>
                      <input
                        className="form-input"
                        placeholder="https://..."
                        value={form.photoUrl}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, photoUrl: e.target.value }))
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      ["Prénom", user?.firstName],
                      ["Nom", user?.lastName],
                      ["Âge", user?.age ? `${user.age} ans` : "N/A"],
                      ["Genre", user?.gender || "Non précisé"],
                      ["Date de naissance", user?.birthDate || "N/A"],
                      ["Type de membre", user?.memberType],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          background: "var(--bg)",
                          borderRadius: 8,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {value || "N/A"}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--danger)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                🔒 Informations privées
              </div>
              {editing ? (
                <div className="grid-2">
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 2,
                      }}
                    >
                      Email
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {user?.email}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Nouveau mot de passe (laisser vide = inchangé)
                    </label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="••••••••"
                      value={form.newPassword}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, newPassword: e.target.value }))
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="grid-2">
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 2,
                      }}
                    >
                      Email
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {user?.email}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 2,
                      }}
                    >
                      Mot de passe
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      ••••••••
                    </div>
                  </div>
                  <button
                    className="btn btn-sm"
                    onClick={logout}
                    title="Déconnexion"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: 4,
                      transition: "color 0.2s",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--danger)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
