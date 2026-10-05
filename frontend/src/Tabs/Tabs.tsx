import { NavLink, useSearchParams } from 'react-router'
import { LOCATION_PARAM } from '../location/useSelectedLocation'
import './Tabs.css'

const TABS = [
    { path: '/air-quality', label: 'Air quality' },
    { path: '/roads', label: 'Roads' },
    { path: '/transport', label: 'Transport' },
] as const

// Links styled as tabs: each one is a URL. Only ?location=… is carried over,
// so a tab's own params don't leak into the others
export const Tabs = () => {
    const [searchParams] = useSearchParams()
    const location = searchParams.get(LOCATION_PARAM)
    const search = location
        ? `?${new URLSearchParams({ [LOCATION_PARAM]: location })}`
        : ''

    return (
        <nav className="tabs" aria-label="Sections">
            {TABS.map(({ path, label }) => (
                <NavLink
                    key={path}
                    to={{ pathname: path, search }}
                    className="tabs__link"
                >
                    {label}
                </NavLink>
            ))}
        </nav>
    )
}
