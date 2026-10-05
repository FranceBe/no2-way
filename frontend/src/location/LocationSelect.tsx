import { useId } from 'react'
import type { Location } from '../api/types'
import './LocationSelect.css'

type LocationSelectProps = {
    locations: Location[]
    value?: string
    onChange: (id: string) => void
}

export const LocationSelect = ({
    locations,
    value,
    onChange,
}: LocationSelectProps) => {
    const selectId = useId()

    return (
        <div className="location-select">
            <label htmlFor={selectId} className="visually-hidden">
                Neighbourhood
            </label>
            <select
                id={selectId}
                className="location-select__input"
                value={value ?? ''}
                disabled={locations.length === 0}
                onChange={(e) => onChange(e.target.value)}
            >
                {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                        {l.name}
                    </option>
                ))}
            </select>
        </div>
    )
}
