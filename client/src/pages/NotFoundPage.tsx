import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="page page-narrow page-animate">
      <div className="info-panel">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The route does not exist in the React client.</p>
        <Link className="button" to="/tours">
          Back to tours
        </Link>
      </div>
    </main>
  );
}
