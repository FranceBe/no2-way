import { Navigate, useLocation } from 'react-router'

// "/" and unknown paths land on the first tab, keeping ?location=…
export const ToDefaultTab = () => {
    const { search } = useLocation()
    return <Navigate to={{ pathname: '/air-quality', search }} replace />
}
