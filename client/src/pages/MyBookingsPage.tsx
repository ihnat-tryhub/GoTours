import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { assetUrl, getMyBookings } from '../lib/api';
import { getFriendlyErrorMessage } from '../lib/errors';
import type { Booking, Tour } from '../types';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function bookingTour(booking: Booking): Tour | null {
  return typeof booking.tour === 'object' ? booking.tour : null;
}

function tourDetailsPath(tour: Tour): string {
  return `/tours/${tour.slug ?? tour.id ?? tour._id}`;
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        const data = await getMyBookings();
        if (isMounted) setBookings(data);
      } catch (err) {
        if (isMounted) {
          setError(getFriendlyErrorMessage(err, 'Could not load your bookings.'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) return <LoadingState label="Loading your bookings..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <main className="page page-animate">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">My bookings</p>
          <h1>Your booked tours</h1>
        </div>
        <span className="result-count">{bookings.length} bookings</span>
      </div>

      {bookings.length === 0 ? (
        <div className="info-panel">
          <EmptyState
            title="No bookings yet"
            body="Once you complete a checkout, your booked tours will appear here."
          />
          <div className="hero-actions">
            <Link className="button" to="/tours">
              Browse tours
            </Link>
          </div>
        </div>
      ) : (
        <section className="bookings-list" aria-label="Booked tours">
          {bookings.map((booking) => {
            const tour = bookingTour(booking);

            return (
              <article className="booking-card" key={booking._id}>
                {tour ? (
                  <img src={assetUrl(`/img/tours/${tour.imageCover}`)} alt={tour.name} />
                ) : (
                  <div className="booking-card-placeholder">GT</div>
                )}

                <div className="booking-card-content">
                  <div>
                    <span className={booking.paid === false ? 'booking-status unpaid' : 'booking-status'}>
                      {booking.paid === false ? 'Payment pending' : 'Paid'}
                    </span>
                    <h2>{tour?.name ?? 'Tour no longer available'}</h2>
                    <p>
                      {tour?.duration ? `${tour.duration} days` : 'Duration unavailable'}
                      {tour?.difficulty ? ` - ${tour.difficulty}` : ''}
                    </p>
                  </div>

                  <dl className="booking-meta">
                    <div>
                      <dt>Booked on</dt>
                      <dd>{formatDate(booking.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>Price</dt>
                      <dd>${booking.price}</dd>
                    </div>
                    <div>
                      <dt>Start date</dt>
                      <dd>{tour?.startDates?.[0] ? formatDate(tour.startDates[0]) : 'Coming soon'}</dd>
                    </div>
                  </dl>

                  <div className="booking-actions">
                    {tour ? (
                      <Link className="button button-secondary" to={tourDetailsPath(tour)}>
                        View tour
                      </Link>
                    ) : (
                      <Link className="button" to="/tours">
                        Browse tours
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
