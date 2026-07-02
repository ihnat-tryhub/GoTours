import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { hash, pathname, search } = useLocation();

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [hash, pathname, search]);

  return null;
}
