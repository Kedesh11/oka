import { useState, useEffect } from 'react';

export function useApiUrl() {
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    // Utiliser window.location.origin seulement côté client
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const getApiUrl = (endpoint: string) => {
    // En développement, utiliser l'URL complète si disponible
    if (baseUrl && process.env.NODE_ENV === 'development') {
      return `${baseUrl}${endpoint}`;
    }
    // Sinon, utiliser l'URL relative (fonctionne en production)
    return endpoint;
  };

  return { getApiUrl, baseUrl };
}
