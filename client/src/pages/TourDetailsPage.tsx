import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { EmptyState, ErrorState, FormAlert, TourDetailsSkeleton } from '../components/States';
import { TourMap } from '../components/TourMap';
import { assetUrl, createCheckoutSession, getTourBySlugOrId } from '../lib/api';
import { useAuth } from '../lib/auth';
import { getFriendlyErrorMessage } from '../lib/errors';
import type { Review, Tour } from '../types';

function formatMonth(value?: string): string {
  if (!value) return 'Date coming soon';
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function displayReviewUser(review: Review): string {
  return review.user?.name ?? 'GoTours guest';
}

function reviewAvatarUrl(review: Review): string {
  return assetUrl(`/img/users/${review.user?.photo ?? 'default.jpg'}`);
}

function StarRating({ rating }: { rating: number }) {
  const filledStars = Math.round(rating);

  return (
    <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < filledStars ? 'star-filled' : 'star-empty'}>
          {index < filledStars ? '\u2605' : '\u2606'}
        </span>
      ))}
    </div>
  );
}

export function TourDetailsPage() {
  const { tourKey } = useParams();
  const { isAuthenticated } = useAuth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadTour() {
      if (!tourKey) return;

      setIsLoading(true);
      setError(null);
      setCheckoutError(null);
      setTour(null);

      try {
        const data = await getTourBySlugOrId(tourKey);
        setTour(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load tour.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadTour();
  }, [tourKey]);

  const tourId = useMemo(() => tour?.id ?? tour?._id, [tour]);

  async function handleCheckout() {
    if (!tourId) return;

    setCheckoutError(null);
    setIsCheckoutLoading(true);

    try {
      const response = await createCheckoutSession(tourId);
      if (response.session.url) {
        window.location.href = response.session.url;
        return;
      }
      setCheckoutError('The backend created a session, but Stripe did not return a redirect URL.');
    } catch (err) {
      setCheckoutError(getFriendlyErrorMessage(err, 'Could not start checkout. Please try again.'));
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  if (isLoading) return <TourDetailsSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!tour) return <ErrorState message="Tour not found." />;

  return (
    <main className="page-animate">
      <section className="details-hero">
        <img src={assetUrl(`/img/tours/${tour.imageCover}`)} alt={tour.name} />
        <div className="details-hero-content">
          <p className="eyebrow">
            {tour.duration} days - {tour.startLocation?.description ?? 'Outdoor adventure'}
          </p>
          <h1>{tour.name}</h1>
        </div>
      </section>

      <section className="page details-layout">
        <aside className="facts-panel">
          <h2>Quick facts</h2>
          <dl>
            <div>
              <dt>Next date</dt>
              <dd>{formatMonth(tour.startDates?.[0])}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{tour.difficulty}</dd>
            </div>
            <div>
              <dt>Participants</dt>
              <dd>{tour.maxGroupSize} people</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>
                {tour.ratingsAverage} from {tour.ratingsQuantity} reviews
              </dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>${tour.price}</dd>
            </div>
          </dl>
        </aside>

        <article className="details-content">
          <p className="eyebrow">About this tour</p>
          <h2>{tour.summary}</h2>
          {(tour.description ?? tour.summary)
            .split('\n')
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

          {tour.locations && tour.locations.length > 0 ? (
            <div className="locations-list">
              <h3>Route</h3>
              {tour.locations.map((location) => (
                <div key={`${location.day}-${location.description}`} className="location-item">
                  <span>Day {location.day}</span>
                  <strong>{location.description ?? location.address}</strong>
                  {location.address ? <small>{location.address}</small> : null}
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      {tour.images?.length ? (
        <section className="image-strip" aria-label="Tour gallery">
          {tour.images.slice(0, 3).map((image) => (
            <img key={image} src={assetUrl(`/img/tours/${image}`)} alt={`${tour.name} tour`} />
          ))}
        </section>
      ) : null}

      <TourMap locations={tour.locations} />

      <section className="reviews-section">
        <div className="page reviews-inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Reviews</p>
              <h2>What guests say</h2>
            </div>
          </div>

          {tour.reviews && tour.reviews.length > 0 ? (
            <div className="reviews-grid">
              {tour.reviews.map((review) => (
                <article className="review-card" key={review._id}>
                  <header className="review-card-header">
                    <img
                      className="review-avatar"
                      src={reviewAvatarUrl(review)}
                      alt={displayReviewUser(review)}
                    />
                    <strong>{displayReviewUser(review)}</strong>
                  </header>
                  <p>{review.review}</p>
                  <StarRating rating={review.rating} />
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reviews yet"
              body="The old backend returns populated reviews when they exist."
            />
          )}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <p className="eyebrow">Ready?</p>
          <h2>Book {tour.name}</h2>
          <p>{tour.duration} days. One tour. A checkout session from the old backend.</p>
        </div>

        {isAuthenticated ? (
          <button className="button" type="button" onClick={handleCheckout} disabled={isCheckoutLoading}>
            {isCheckoutLoading ? 'Starting checkout...' : 'Book tour now'}
          </button>
        ) : (
          <Link className="button" to="/login">
            Login to book
          </Link>
        )}

        {checkoutError ? <FormAlert title="Checkout unavailable" message={checkoutError} /> : null}
      </section>
    </main>
  );
}
