import type { Direction, Schedule } from '@no2-way/shared'
import { useTimetable } from '@/shared/api/queries'
import { TransportCard } from '../TransportCard/TransportCard'
import { scheduleForDate } from '../../utils/timetable'
import './FirstLastTrains.css'

type FirstLastTrainsProps = {
    line?: string
    stop?: string
    direction: Direction
}

// First and last trains of the selected line at the selected stop
export const FirstLastTrains = ({
    line,
    stop,
    direction,
}: FirstLastTrainsProps) => {
    const query = useTimetable(line, stop, direction)

    return (
        <TransportCard
            title="First & last trains"
            query={query}
            idle="Pick a line and a stop to see the timetable."
        >
            {({ schedules }) => (
                <FirstLastTrainsView
                    schedules={schedules}
                    today={scheduleForDate(schedules, new Date())}
                />
            )}
        </TransportCard>
    )
}

type FirstLastTrainsViewProps = {
    schedules: Schedule[]
    today?: Schedule // highlighted, when one applies
}

export const FirstLastTrainsView = ({
    schedules,
    today,
}: FirstLastTrainsViewProps) => {
    if (schedules.length === 0) {
        return (
            <p className="transport-card__message">
                No timetable for this stop in this direction.
            </p>
        )
    }

    return (
        <table className="transport-table">
            <thead>
                <tr>
                    <th scope="col">Days</th>
                    <th scope="col">First</th>
                    <th scope="col">Last</th>
                </tr>
            </thead>
            <tbody>
                {schedules.map((s) => (
                    <tr
                        key={s.name}
                        aria-current={s === today ? 'date' : undefined}
                    >
                        <th scope="row">{s.name}</th>
                        <td>{s.first ?? '—'}</td>
                        <td>{s.last ?? '—'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
