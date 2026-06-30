import { useEffect, useMemo, useState } from 'react';

import { EmptyState, ErrorState, TourGridSkeleton } from '../components/States';
import { TourCard } from '../components/TourCard';
import { getTours } from '../lib/api';
import type { Difficulty, Tour } from '../types';

type SortMode = 'rating' | 'price-asc' | 'price-desc' | 'duration';

export function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortMode>('rating');
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

  const filteredTours = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const priceLimit = maxPrice ? Number(maxPrice) : null;

    return tours
      .filter((tour) => {
        const matchesSearch =
          !normalizedSearch ||
          tour.name.toLowerCase().includes(normalizedSearch) ||
          tour.summary.toLowerCase().includes(normalizedSearch);
        const matchesDifficulty = !difficulty || tour.difficulty === difficulty;
        const matchesPrice = priceLimit === null || tour.price <= priceLimit;
        return matchesSearch && matchesDifficulty && matchesPrice;
      })
      .sort((first, second) => {
        if (sort === 'price-asc') return first.price - second.price;
        if (sort === 'price-desc') return second.price - first.price;
        if (sort === 'duration') return first.duration - second.duration;
        return second.ratingsAverage - first.ratingsAverage;
      });
  }, [difficulty, maxPrice, search, sort, tours]);

  if (isLoading) return <TourGridSkeleton />;
  if (error) return <ErrorState message={error} />;

  return (
    <main className="page page-animate">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Tours</p>
          <h1>Explore all tours</h1>
        </div>
        <span className="result-count">{filteredTours.length} results</span>
      </div>

      <section className="filter-panel" aria-label="Tour filters">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tour name or summary"
          />
        </label>

        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Difficulty | '')}
          >
            <option value="">Any</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="difficult">Difficult</option>
          </select>
        </label>

        <label>
          Max price
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="1200"
          />
        </label>

        <label>
          Sort
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="rating">Best rating</option>
            <option value="price-asc">Price low to high</option>
            <option value="price-desc">Price high to low</option>
            <option value="duration">Shortest first</option>
          </select>
        </label>
      </section>

      {filteredTours.length > 0 ? (
        <div className="tour-grid">
          {filteredTours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tours found"
          body="Try changing the filters. The original API returns the full collection, so filtering happens in the React client for now."
        />
      )}
    </main>
  );
}
