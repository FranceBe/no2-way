import { useId } from 'react'
import type { Arrival } from '@no2-way/shared'
import { lineColor } from '../../lineColors'
import { byPlatform, formatDue } from './board'
import { destinationOf, splitPlatform } from './departureView'
import './Departures.css'

type DeparturesBoardProps = {
    arrivals: Arrival[]
}

// One platform board per platform, next three trains on each, like the
// dot-matrix boards on the Underground
export const DeparturesBoard = ({ arrivals }: DeparturesBoardProps) => {
    const platforms = byPlatform(arrivals)

    if (platforms.length === 0) {
        return (
            <p className="departure-screen departure-screen--empty">
                No trains due at this stop
            </p>
        )
    }

    return (
        <div className="departure-boards">
            {platforms.map(({ platform, departures }) => (
                <PlatformBoard
                    key={platform}
                    platform={platform}
                    departures={departures}
                />
            ))}
        </div>
    )
}

type PlatformBoardProps = {
    platform: string
    departures: Arrival[] // soonest first, non-empty
}

const PlatformBoard = ({ platform, departures }: PlatformBoardProps) => {
    const titleId = useId()
    const { name, heading } = splitPlatform(platform)

    return (
        <section className="departure-board" aria-labelledby={titleId}>
            <h3 id={titleId} className="departure-board__platform">
                <span
                    className="departure-board__line"
                    style={{ background: lineColor(departures[0].line) }}
                    aria-hidden
                />
                {name}
                {heading && (
                    <span className="departure-board__heading">{heading}</span>
                )}
            </h3>
            <ol className="departure-screen">
                {departures.map((departure, i) => {
                    const destination = destinationOf(departure)
                    return (
                        <li
                            key={`${i}-${departure.expected}`}
                            className="departure-screen__row"
                        >
                            <span
                                className="departure-screen__index"
                                aria-hidden
                            >
                                {i + 1}
                            </span>
                            <span className="departure-screen__destination">
                                {destination.name}
                                {destination.via && (
                                    <span className="departure-screen__via">
                                        {' '}
                                        via {destination.via}
                                    </span>
                                )}
                            </span>
                            <span className="departure-screen__due">
                                {formatDue(departure.minutes)}
                            </span>
                        </li>
                    )
                })}
            </ol>
        </section>
    )
}
