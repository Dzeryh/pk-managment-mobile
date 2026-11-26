import { QueryClient } from '@tanstack/react-query';

/**
 * Client TanStack Query unique de l'application.
 * Les données métier arriveront aux sprints suivants ; la configuration est
 * déjà adaptée au mobile (pas de refetch au focus, peu de tentatives).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
