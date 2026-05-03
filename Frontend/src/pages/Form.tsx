import { useState, type JSX } from "react";

import "../css/Form.css";
import { useNavigate } from "react-router-dom";

export default function Form(): JSX.Element {
  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    member_type: "membre",
    age: "",
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    console.log(JSON.stringify(formData));
    const data = await response.json();

    console.log("test", data);

    if (!response.ok) {
      alert(data.error);
      return;
    }

    console.log(data.message);

    navigate("/"); //home
  }

  return (
    <div>
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
                className="form-select"
                value={formData.member_type}
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
                className="form-input"
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

          <div style={{ width: "100%" }}>
            <button type="submit">S'inscrire</button>
          </div>
        </form>
      </div>
    </div>
  );
}
