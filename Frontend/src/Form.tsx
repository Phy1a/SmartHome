import { useState, type JSX } from "react";
import "./css/Form.css";


export function Form(): JSX.Element {

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function handleChange(event) // refresh the form data value
  {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev, // spread operator, useful to not overide the other values
      [name]: value, //dictionary, name is the key
    }));
  }

  function validate() {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
    newErrors.firstName = "Missing name";
    }

    if (!formData.lastName.trim()) {
    newErrors.lastName = "Missing name";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Missing email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) { // text@text.text
      newErrors.email = "Invalid email format";
    } else if (/[<>()[\]\\,;:\s"']/.test(formData.email)) {
      newErrors.email = "Email contains forbidden characters";
    }

    // Password
    if (!formData.password.trim()) {
      newErrors.password = "Missing password";
    } else if (formData.password.length < 6) {
      newErrors.password = "6 caracters minimum";
    }
    else if(formData.password !== formData.confirmPassword){
      newErrors.passwordConfirm = "Both password must be the same"
    }

    return newErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // everything is valid
    setErrors({});
    console.log("Sent data:", formData);

  }

  return (
    <div className="form-container">
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
          {errors.passwordConfirm && <div className="error">{errors.passwordConfirm}</div>}
        </div>
        
        <div style={{ width: "100%" }}>
          <button type="submit">Sign in</button>
        </div>
      </form>
    </div>
  );
}
