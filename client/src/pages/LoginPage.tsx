import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { FormAlert } from '../components/States';
import { useAuth } from '../lib/auth';
import { getFriendlyErrorMessage } from '../lib/errors';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(state?.from?.pathname ?? '/tours', { replace: true });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Login failed. Please check your details.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated) return <Navigate to="/profile" replace />;

  return (
    <main className="auth-page page-animate">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            minLength={8}
            required
          />
        </label>

        {error ? <FormAlert title="Login failed" message={error} /> : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <p className="form-note">
          No account yet? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </main>
  );
}
