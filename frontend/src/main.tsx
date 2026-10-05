import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { queryClient } from './shared/api/queryClient'
import { routes } from './app/routes/routes'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './shared/theme/global.css'

const router = createBrowserRouter(routes)

// Starts MSW only when VITE_USE_MOCKS=true (never in production builds)
async function enableMocking() {
    if (import.meta.env.VITE_USE_MOCKS !== 'true') return
    const { worker } = await import('./shared/api/mocks/browser')
    await worker.start()
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                {/* Devtools are dropped automatically from production builds */}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </StrictMode>
    )
})
