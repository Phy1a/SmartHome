import { useState, type JSX } from "react";
import "../css/AuthPages.css";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, register as registerApi } from "../utils/api";

function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}): JSX.Element {
  return (
    <div className="auth-layout">
      <div className="auth-content">
        <div className="auth-header">
          <div className="auth-emoji">🏠</div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        <div className="auth-form-container">{children}</div>
      </div>
    </div>
  );
}

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    memberType: "membre",
    age: "",
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // refresh the form data value
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev, // spread operator, useful to not overide the other values
      [name]: value, //dictionary, name is the key
    }));
  }

  function validate() {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = "Missing username";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Missing email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      // text@text.text
      newErrors.email = "Invalid email format";
    } else if (/[<>()[\]\\,;:\s"']/.test(formData.email)) {
      newErrors.email = "Email contains forbidden characters";
    }

    // Password
    if (!formData.password.trim()) {
      newErrors.password = "Missing password";
    } else if (formData.password.length < 8) {
      newErrors.password = "8 caracters minimum";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.passwordConfirm = "Both password must be the same";
    }

    return newErrors;
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate();

    // Errors exist, display them and stop the submission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // everything is valid
    setErrors({});

    try {
      await registerApi(formData);
      setSuccess(
        "Inscription réussie ! Un administrateur doit valider votre compte avant votre première connexion."
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur d'inscription");
    }
  }

  if (success) {
    return (
      <AuthLayout title="Inscription" subtitle="Rejoignez SmartHome">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>
            Inscription réussie !
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            {success}
          </p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Retourner à la page d'accueil
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez la maison connectée"
    >
      {error && <div className="error">❌ {error}</div>}
      <h2>Rejoindre le foyer</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-element">
              <label className="form-label">Prénom</label>
              <input
                name="firstName"
                type="text"
                placeholder="Michel"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <div className="error">{errors.firstName}</div>
              )}
            </div>

            <div className="form-element">
              <label className="form-label">Nom</label>
              <input
                name="lastName"
                type="text"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <div className="error">{errors.lastName}</div>
              )}
            </div>
          </div>

          <div className="form-element">
            <label className="form-label">Nom d'utilisateur *</label>
            <input
              name="username"
              type="text"
              placeholder="michel_dupont"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="error">{errors.username}</div>}
          </div>

          <div className="form-element">
            <label className="form-label">Email *</label>
            <input
              name="email"
              type="email"
              placeholder="michel.dupont@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {/* display the error if the key exists */}
            {errors.email && <div className="error">{errors.email}</div>}
          </div>

          <div className="form-element">
            <label className="form-label">
              Mot de passe (8 caractères minimum) *
            </label>
            <input
              name="password"
              type="password"
              placeholder="MonMotDePasse123!"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error">{errors.password}</div>}
          </div>

          <div className="form-element">
            <label className="form-label">Confirmer le mot de passe *</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="MonMotDePasse123!"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.passwordConfirm && (
              <div className="error">{errors.passwordConfirm}</div>
            )}
          </div>

          <div className="grid-2">
            <div className="form-element">
              <label className="form-label">Type</label>
              <select
                value={formData.memberType}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, memberType: e.target.value }))
                }
              >
                <option value="père">Père</option>
                <option value="mère">Mère</option>
                <option value="enfant">Enfant</option>
                <option value="membre">Autre</option>
              </select>
            </div>
            <div className="form-element">
              <label className="form-label">Âge</label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="18"
                value={formData.age}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, age: e.target.value }))
                }
              />
            </div>
          </div>

          <button type="submit">S'inscrire</button>
        </form>
      </div>
    </AuthLayout>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginApi(formData);
      loginUser(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Connexion" subtitle="Bienvenue sur SmartHome">
      {error && <div className="error">❌ {error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-container">
          <div className="form-element">
            <label className="form-label">Identifiant ou Email</label>
            <input
              className="form-input"
              placeholder="admin"
              value={formData.username}
              onChange={(e) =>
                setFormData((f) => ({ ...f, username: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-element">
            <label className="form-label">Mot de passe</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>
          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "..." : "Se connecter"}
          </button>
        </div>
      </form>
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 13,
          color: "var(--text-secondary)",
        }}
      >
        Pas encore de compte ?{" "}
        <Link
          to="/inscription"
          style={{ color: "var(--primary)", fontWeight: 600 }}
        >
          S'inscrire
        </Link>
      </div>
      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: "var(--bg)",
          borderRadius: 8,
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        <strong>Comptes de test :</strong>
        <br />
        admin / Admin123! (expert)
        <br />
        marie / Password123! (avancé)
        <br />
        lucas / Password123! (intermédiaire)
      </div>
    </AuthLayout>
  );
}
