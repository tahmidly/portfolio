import { useState } from "react";

const MESSAGES = {
  wrong: "Wrong password.",
  config: "Login is not configured on the server.",
  origin: "Please sign in from this site.",
};

export default function LoginForm({ error }) {
  const [submitting, setSubmitting] = useState(false);
  const message = MESSAGES[error];

  return (
    <form
      method="post"
      action="/api/auth/login"
      className="admin-login-card"
      onSubmit={() => setSubmitting(true)}
    >
      <a href="/" className="admin-brand-link">
        ← Meer Tahmid
      </a>
      <p className="admin-eyebrow">Content studio</p>
      <h1>Sign in</h1>

      <label className="admin-field">
        <span>Password</span>
        <input
          className="admin-input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          autoFocus
        />
      </label>

      {message && !submitting ? (
        <p className="admin-login-error" role="alert">
          {message}
        </p>
      ) : null}

      <button type="submit" className="admin-primary" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
