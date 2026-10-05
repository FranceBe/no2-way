import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

// Every query error is an ApiError: `error.status` is typed in components
declare module '@tanstack/react-query' {
    interface Register {
        defaultError: ApiError
    }
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000, // overridden per endpoint in queries.ts
            // 4xx = bad request: retrying won't help. Network/5xx: retry twice
            retry: (failureCount, error) =>
                !(error.status >= 400 && error.status < 500) &&
                failureCount < 2,
        },
    },
})
