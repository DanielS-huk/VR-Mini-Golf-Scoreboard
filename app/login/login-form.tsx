"use client";

import { useActionState } from "react";
import type { LoginActionState } from "./actions";

type LoginFormProps = {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
  nextPath?: string;
};

const initialState: LoginActionState = {
  error: null,
};

export function LoginForm({ action, nextPath = "/" }: LoginFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="round-form">
      <div className="form-header">
        <div>
          <p className="eyebrow">Admin Access</p>
          <h1>Sign In</h1>
          <p className="hero-copy">Only the admin account can add, edit, or delete rounds.</p>
        </div>
        <a className="text-link" href="/">
          Back home
        </a>
      </div>

      <section className="login-shell">
        <div className="login-card">
          <input type="hidden" name="next" value={nextPath} />

          <label className="field">
            <span>Username</span>
            <input name="username" type="text" autoComplete="username" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          {state.error ? <p className="form-error">{state.error}</p> : null}

          <div className="form-actions">
            <button className="primary-button" type="submit">
              Sign in
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
