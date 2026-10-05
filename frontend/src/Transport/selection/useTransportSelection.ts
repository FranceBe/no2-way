import { useSearchParams } from 'react-router'
import type { Direction } from '@no2-way/shared'

type Changes = Partial<Record<'line' | 'stop' | 'direction', string>>

// Line, stop and direction picked on the Transport tab. Kept in the URL next
// to ?location=…, so a reload or a shared link shows the same board
export const useTransportSelection = () => {
    const [params, setParams] = useSearchParams()

    const line = params.get('line') ?? undefined
    const stop = params.get('stop') ?? undefined
    const direction: Direction =
        params.get('direction') === 'inbound' ? 'inbound' : 'outbound'

    // Picking in a select is not a navigation: replace the history entry
    const update = (changes: Changes) =>
        setParams(
            (current) => {
                const next = new URLSearchParams(current)
                for (const [key, value] of Object.entries(changes)) {
                    if (value) next.set(key, value)
                    else next.delete(key)
                }
                return next
            },
            { replace: true }
        )

    return {
        line,
        stop,
        direction,
        // A stop belongs to a line: changing line clears it
        setLine: (id: string) => update({ line: id, stop: undefined }),
        setStop: (id: string) => update({ stop: id }),
        setDirection: (value: Direction) => update({ direction: value }),
    }
}
