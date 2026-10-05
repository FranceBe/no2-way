import type { AqiLevel } from '../../utils/aqi'
import { useAirPalette } from '../../utils/palette'
import './AqiBadge.css'

// Level = coloured dot + text label, so the colour never carries the meaning alone
export const AqiBadge = ({ level }: { level: AqiLevel }) => {
    const palette = useAirPalette()
    return (
        <span className="aq-badge" data-level={level.id}>
            <span
                className="aq-badge__dot"
                style={{ background: palette.levels[level.id] }}
                aria-hidden
            />
            {level.label}
        </span>
    )
}
