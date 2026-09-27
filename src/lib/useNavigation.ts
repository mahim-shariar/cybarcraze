import { useState, useEffect, useCallback } from 'react';

export interface RouteState {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export function useNavigation() {
  const getInitialRoute = (): RouteState => {
    if (typeof window === 'undefined') {
      return { path: '/', params: {}, query: {} };
    }

    let fullPath = window.location.pathname;
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      fullPath = window.location.hash.slice(1);
    }

    const [cleanPath, queryString] = fullPath.split('?');
    const query: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        query[key] = val;
      });
    }

    const params: Record<string, string> = {};
    if (cleanPath.startsWith('/booking/') && cleanPath !== '/booking/manage') {
      params.id = cleanPath.replace('/booking/', '');
    }

    return { path: cleanPath || '/', params, query };
  };

  const [route, setRoute] = useState<RouteState>(getInitialRoute);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const navigate = useCallback((targetUrl: string) => {
    if (typeof window === 'undefined') return;

    const [cleanPath, queryString] = targetUrl.split('?');
    const query: Record<string, string> = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        query[key] = val;
      });
    }

    const params: Record<string, string> = {};
    if (cleanPath.startsWith('/booking/') && cleanPath !== '/booking/manage') {
      params.id = cleanPath.replace('/booking/', '');
    }

    // Trigger smooth luxury page transition
    setIsNavigating(true);
    window.history.pushState({}, '', targetUrl);

    setTimeout(() => {
      setRoute({ path: cleanPath || '/', params, query });
      setIsNavigating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 240);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setIsNavigating(true);
      setTimeout(() => {
        setRoute(getInitialRoute());
        setIsNavigating(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { route, navigate, isNavigating };
}
