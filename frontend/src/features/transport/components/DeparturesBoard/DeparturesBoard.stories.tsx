import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Arrival } from '@no2-way/shared'
import { DeparturesBoard } from './DeparturesBoard'

// Northern line at Camden Town: two platforms, branches via Bank and Charing Cross
const arrival = (
    platform: string,
    towards: string,
    minutes: number
): Arrival => ({
    line: 'northern',
    lineName: 'Northern',
    platform,
    direction: platform.startsWith('North') ? 'inbound' : 'outbound',
    destination: `${towards.split(' via ')[0]} Underground Station`,
    towards,
    minutes,
    expected: '2026-10-05T12:00:00Z',
})

const NORTH = 'Northbound - Platform 1'
const SOUTH = 'Southbound - Platform 3'

const meta = {
    title: 'Transport/DeparturesBoard',
    component: DeparturesBoard,
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 560 }}>
                <Story />
            </div>
        ),
    ],
    args: {
        arrivals: [
            arrival(NORTH, 'Edgware via Bank', 0),
            arrival(SOUTH, 'Morden via Charing Cross', 1),
            arrival(NORTH, 'High Barnet via Charing Cross', 3),
            arrival(SOUTH, 'Kennington via Charing Cross', 4),
            arrival(SOUTH, 'Morden via Bank', 6),
            arrival(NORTH, 'Mill Hill East via Bank', 8),
            arrival(NORTH, 'Edgware via Bank', 11),
        ],
    },
} satisfies Meta<typeof DeparturesBoard>

export default meta
type Story = StoryObj<typeof meta>

export const BothPlatforms: Story = {}

export const OnePlatform: Story = {
    args: {
        arrivals: [
            arrival(SOUTH, 'Morden', 2),
            arrival(SOUTH, 'Morden', 5),
            arrival(SOUTH, 'Morden', 9),
        ],
    },
}

export const UnknownDestination: Story = {
    args: {
        arrivals: [
            {
                ...arrival(SOUTH, 'Morden', 2),
                destination: null,
                towards: null,
            },
            arrival(SOUTH, 'Morden via Bank', 7),
        ],
    },
}

export const NoTrain: Story = {
    args: { arrivals: [] },
}
