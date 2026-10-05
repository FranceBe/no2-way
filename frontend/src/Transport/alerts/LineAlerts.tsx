import type { Line } from '@no2-way/shared'
import { useLines } from '../../api/queries'
import { lineColor } from '../../lineColors'
import { disruptedLines } from '../incidents/incidents'
import '../Transport.css'

// Warning banner over the Transport tab: every line disrupted right now
export const LineAlerts = () => {
    const { data } = useLines()
    // Nothing to warn about until the snapshot is there
    if (!data) return null
    return <LineAlertsView lines={disruptedLines(data.lines)} />
}

type LineAlertsViewProps = {
    lines: Line[] // disrupted lines, already sorted
}

export const LineAlertsView = ({ lines }: LineAlertsViewProps) => {
    if (lines.length === 0) {
        return (
            <p className="line-alerts line-alerts--ok" role="status">
                Good service on all lines
            </p>
        )
    }

    return (
        <section className="line-alerts" role="alert">
            <h2 className="line-alerts__title">
                {lines.length === 1
                    ? '1 line disrupted'
                    : `${lines.length} lines disrupted`}
            </h2>
            <ul className="line-alerts__list">
                {lines.map((line) => (
                    <li key={line.id}>
                        <span
                            className="line-alerts__swatch"
                            style={{ background: lineColor(line.id) }}
                            aria-hidden
                        />
                        <strong>{line.name}</strong>{' '}
                        {line.statuses.map((s) => s.description).join(', ')}
                    </li>
                ))}
            </ul>
        </section>
    )
}
