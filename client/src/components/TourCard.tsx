import { Link } from 'react-router-dom';

import { assetUrl } from '../lib/api';
import type { Tour } from '../types';

function formatMonth(value?: string): string {
  if (!value) return 'Date coming soon';
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function TourCard({ tour }: { tour: Tour }) {
  const detailKey = tour.slug || tour.id || tour._id;

  return (
    <article className="tour-card">
      <Link to={`/tours/${detailKey}`} className="tour-card-image-link">
        <img
          className="tour-card-image"
          src={assetUrl(`/img/tours/${tour.imageCover}`)}
          alt={tour.name}
        />
      </Link>

      <div className="tour-card-body">
        <div>
          <p className="eyebrow">
            {tour.difficulty} - {tour.duration} days
          </p>
          <h3>{tour.name}</h3>
          <p>{tour.summary}</p>
        </div>

        <dl className="tour-meta-grid">
          <div>
            <dt>Start</dt>
            <dd>{formatMonth(tour.startDates?.[0])}</dd>
          </div>
          <div>
            <dt>Group</dt>
            <dd>{tour.maxGroupSize} people</dd>
          </div>
          <div>
            <dt>Rating</dt>
            <dd>
              {tour.ratingsAverage} ({tour.ratingsQuantity})
            </dd>
          </div>
        </dl>
      </div>

      <div className="tour-card-footer">
        <strong>${tour.price}</strong>
        <span>per person</span>
        <Link className="button button-small" to={`/tours/${detailKey}`}>
          Details
        </Link>
      </div>
    </article>
  );
}


