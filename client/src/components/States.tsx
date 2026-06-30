export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <main className="page page-narrow">
      <div className="state-box state-box-loading">
        <span className="loading-dot" />
        {label}
      </div>
    </main>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <main className="page page-narrow">
      <div className="state-box state-box-error">{message}</div>
    </main>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

export function FormAlert({
  message,
  title = 'Request failed',
}: {
  message: string;
  title?: string;
}) {
  return (
    <div className="form-alert" role="alert" aria-live="polite">
      <span className="form-alert-icon">!</span>
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export function TourCardSkeleton() {
  return (
    <article className="tour-card tour-card-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="tour-card-body">
        <div className="skeleton skeleton-line skeleton-line-short" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line-wide" />
        <div className="skeleton-grid">
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-pill" />
        </div>
      </div>
      <div className="tour-card-footer">
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-button" />
      </div>
    </article>
  );
}

export function TourGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <main className="page page-animate">
      <div className="page-title-row">
        <div>
          <div className="skeleton skeleton-line skeleton-line-short" />
          <div className="skeleton skeleton-heading" />
        </div>
        <div className="skeleton skeleton-count" />
      </div>

      <div className="filter-panel skeleton-filter" aria-hidden="true">
        <div className="skeleton skeleton-control" />
        <div className="skeleton skeleton-control" />
        <div className="skeleton skeleton-control" />
        <div className="skeleton skeleton-control" />
      </div>

      <div className="tour-grid">
        {Array.from({ length: count }, (_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}

export function FeaturedToursSkeleton() {
  return (
    <section className="page page-animate section-block">
      <div className="section-heading">
        <div>
          <div className="skeleton skeleton-line skeleton-line-short" />
          <div className="skeleton skeleton-heading" />
        </div>
        <div className="skeleton skeleton-link" />
      </div>

      <div className="tour-grid">
        {Array.from({ length: 3 }, (_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function TourDetailsSkeleton() {
  return (
    <main className="details-skeleton page-animate" aria-hidden="true">
      <section className="details-hero details-hero-skeleton">
        <div className="details-hero-content">
          <div className="skeleton skeleton-line skeleton-line-short" />
          <div className="skeleton skeleton-hero-title" />
        </div>
      </section>

      <section className="page details-layout">
        <aside className="facts-panel">
          <div className="skeleton skeleton-title" />
          <div className="skeleton-stack">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        </aside>
        <article className="details-content">
          <div className="skeleton skeleton-line skeleton-line-short" />
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-paragraph" />
          <div className="skeleton skeleton-paragraph skeleton-paragraph-short" />
        </article>
      </section>

      <section className="image-strip">
        <div className="skeleton skeleton-gallery" />
        <div className="skeleton skeleton-gallery" />
        <div className="skeleton skeleton-gallery" />
      </section>
      <section className="tour-map-section">
        <div className="skeleton skeleton-map" />
      </section>
    </main>
  );
}

export function ProfileSkeleton() {
  return (
    <main className="page page-narrow page-animate" aria-hidden="true">
      <div className="profile-header">
        <div className="skeleton skeleton-avatar" />
        <div className="profile-skeleton-copy">
          <div className="skeleton skeleton-line skeleton-line-short" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>

      <div className="panel-form">
        <div className="skeleton skeleton-heading" />
        <div className="skeleton skeleton-control" />
        <div className="skeleton skeleton-control" />
        <div className="skeleton skeleton-button skeleton-button-wide" />
      </div>
    </main>
  );
}
