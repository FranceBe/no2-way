import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Incident } from './incidents'
import { IncidentOverview } from './IncidentOverview'

// Window: the 7 days up to Monday 5 October, 12:00 UTC
const NOW = Date.parse('2026-10-05T12:00Z')

const incident = (
    start: string,
    end: string | null,
    severity: number,
    description: string,
    ...reasons: string[]
): Incident => ({ start, end, severity, description, reasons })

const WEEK: Incident[] = [
    incident(
        '2026-09-29T08:15',
        '2026-09-29T09:30',
        9,
        'Minor Delays',
        'Northern Line: Minor delays due to a signal failure at Camden Town.'
    ),
    incident(
        '2026-09-30T17:45',
        '2026-09-30T18:00',
        9,
        'Minor Delays',
        'Northern Line: Minor delays due to a customer incident.'
    ),
    incident(
        '2026-10-02T17:30',
        '2026-10-02T21:00',
        6,
        'Severe Delays',
        'Northern Line: Minor delays due to a signal failure.',
        'Northern Line: Severe delays due to a faulty train at Kennington.'
    ),
    incident(
        '2026-10-04T06:00',
        '2026-10-04T13:15',
        5,
        'Part Closure',
        'Northern Line: No service between Kennington and Morden due to planned engineering work.'
    ),
    incident(
        '2026-10-05T10:45',
        null,
        9,
        'Minor Delays',
        'Northern Line: Minor delays due to a train fault.'
    ),
]

const meta = {
    title: 'Transport/IncidentOverview',
    component: IncidentOverview,
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 560 }}>
                <Story />
            </div>
        ),
    ],
    args: { incidents: WEEK, now: NOW },
} satisfies Meta<typeof IncidentOverview>

export default meta
type Story = StoryObj<typeof meta>

export const BusyWeek: Story = {}

export const OneIncident: Story = {
    args: { incidents: WEEK.slice(0, 1) },
}

export const QuietWeek: Story = {
    args: { incidents: [] },
}
