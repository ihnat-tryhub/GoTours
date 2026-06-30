import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ErrorState, FeaturedToursSkeleton } from '../components/States';
import { TourCard } from '../components/TourCard';
import { getTours } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Tour } from '../types';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTours() {
      try {
        const data = await getTours();
        setTours(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load tours.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadTours();
  }, []);

  const featuredTours = useMemo(
    () =>
      [...tours]
        .sort((first, second) => second.ratingsAverage - first.ratingsAverage)
        .slice(0, 3),
    [tours],
  );

  if (error) return <ErrorState message={error} />;

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Original GoTours backend - New React client</p>
          <h1>Find outdoor tours and book your next adventure.</h1>
          <p>
            A modern client built around the existing Express and MongoDB API, with clean
            routing, typed data models, and a frontend-ready booking entry point.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/tours">
              Browse tours
            </Link>
            {isAuthenticated ? (
              <Link className="button button-secondary" to="/my-bookings">
                My bookings
              </Link>
            ) : (
              <Link className="button button-secondary" to="/signup">
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>

      {isLoading ? (
        <FeaturedToursSkeleton />
      ) : (
        <section className="page section-block page-animate">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured</p>
              <h2>Top rated tours</h2>
            </div>
            <Link to="/tours">View all</Link>
          </div>

          <div className="tour-grid">
            {featuredTours.map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
