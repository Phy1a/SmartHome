import { useState, type JSX } from "react";
import "./css/Form.css";

export function Form(): JSX.Element {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isPasswordValid = password === confirmPassword;
    console.log({ firstName, lastName, email, isPasswordValid });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="First name"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="Last name"
          placeholder="Last name"
          value={firstName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password comfirmation"
          placeholder="Mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div style={{ width: "100%" }}>
          <button type="submit">S'inscrire</button>
        </div>
      </form>
    </div>
  );
}
