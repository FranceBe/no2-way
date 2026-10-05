import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Line } from '@no2-way/shared'
import { LineAlertsView } from './LineAlerts'

const line = (id: string, name: string, ...descriptions: string[]): Line => ({
    id,
    name,
    mode: 'tube',
    statuses: descriptions.map((description) => ({
        severity: 6,
        description,
        reason: null,
    })),
})

const meta = {
    title: 'Transport/LineAlerts',
    component: LineAlertsView,
    parameters: { layout: 'padded' },
    args: {
        lines: [
            line('district', 'District', 'Part Closure', 'Minor Delays'),
            line('lioness', 'Lioness', 'Severe Delays'),
            line('northern', 'Northern', 'Minor Delays'),
        ],
    },
} satisfies Meta<typeof LineAlertsView>

export default meta
type Story = StoryObj<typeof meta>

export const SeveralLines: Story = {}

export const OneLine: Story = {
    args: { lines: [line('northern', 'Northern', 'Minor Delays')] },
}

export const GoodService: Story = {
    args: { lines: [] },
}
