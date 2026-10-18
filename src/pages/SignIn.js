import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

function SignIn({ username: currentUsername, onSignIn }) {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  if (currentUsername) {
    return <Navigate to="/books" replace />;
  }

  const normalizedName = username.trim();
  const isValidUsername = normalizedName.length >= 4 && normalizedName.length <= 16;

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValidUsername) return;
    onSignIn(normalizedName);
    navigate(location.state?.from?.pathname || "/books", { replace: true });
  }

  return (
    <section className="signin-panel" aria-labelledby="signin-title">
      <h1 id="signin-title">Вхід до магазину</h1>
      <img
        className="signin-avatar"
        src={`${process.env.PUBLIC_URL || "."}/assets/avatar.png`}
        alt="Аватар користувача"
      />
      <form className="signin-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          minLength={4}
          maxLength={16}
          placeholder="Введіть ім’я (4–16 символів)"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <button className="button button-primary" type="submit" disabled={!isValidUsername}>
          Sign-In
        </button>
      </form>
    </section>
  );
}

export default SignIn;
