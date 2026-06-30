import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { FormAlert } from '../components/States';
import { useAuth } from '../lib/auth';
import { getFriendlyErrorMessage } from '../lib/errors';

export function SignupPage() {
  const { isAuthenticated, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Passwords must match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({ name, email, password, passwordConfirm });
      navigate('/tours');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Could not create your account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated) return <Navigate to="/profile" replace />;

  return (
    <main className="auth-page page-animate">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Create account</p>
        <h1>Sign up</h1>

        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="First name Last name"
            required
          />
        </label>

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
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </label>

        <label>
          Repeat password
          <input
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="Repeat password"
            minLength={8}
            required
          />
        </label>

        {error ? <FormAlert title="Signup failed" message={error} /> : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="form-note">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
