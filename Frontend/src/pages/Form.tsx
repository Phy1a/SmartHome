import { useState, type JSX } from "react";

import "../css/Form.css";
import { useNavigate } from "react-router-dom";

export default function Form(): JSX.Element {
  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Missing name";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Missing name";
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
    } else if (formData.password.length < 6) {
      newErrors.password = "6 caracters minimum";
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

    const response = await fetch("http://localhost:7000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    console.log(data.message);

    /*
    This code uses React Router's navigation hook to programmatically 
    redirect users to a different route in a Single Page Application (SPA).
    The first line calls the `useNavigate()` hook, which is provided by React 
    Router (typically version 6). This hook returns a function that can be 
    used to navigate between routes programmatically — that is, in response 
    to user actions or application logic rather than clicking a link. 
    The result is stored in a constant named `navigateToHome`, 
    though the variable name here is somewhat misleading since it's actually a function,
    not the navigation result.

    The second line invokes that function with `"/home"` as an argument, 
    which tells React Router to change the current URL to `/home` and update
    the displayed component accordingly. This is equivalent to the user clicking
    a `<Link to="/home">` component, but gives you more control over when navigation
    occurs — for example, after a form submission succeeds, after validating user 
    input, or in response to a button click.
    */

    navigate("/"); //home
  }

  return (
    <div className="form-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-element">
          <input
            name="firstName"
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <div className="error">{errors.firstName}</div>}
        </div>

        <div className="form-element">
          <input
            name="lastName"
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <div className="error">{errors.lastName}</div>}
        </div>

        <div className="form-element">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {/* display the error if the key exists */}
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className="form-element">
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>

        <div className="form-element">
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.passwordConfirm && (
            <div className="error">{errors.passwordConfirm}</div>
          )}
        </div>

        <div style={{ width: "100%" }}>
          <button type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
