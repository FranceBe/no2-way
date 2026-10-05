import type { Meta, StoryObj } from '@storybook/react-vite'
import type { BikePoint } from '@no2-way/shared'
import { BikeList } from './NearbyBikes'

const dock = (name: string, distance: number, bikes: number): BikePoint => ({
    id: `BikePoints_${name}`,
    name,
    lat: 51.539,
    lon: -0.142,
    bikes,
    emptyDocks: 24 - bikes,
    docks: 24,
    distance,
})

const meta = {
    title: 'Transport/BikeList',
    component: BikeList,
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 420 }}>
                <Story />
            </div>
        ),
    ],
    args: {
        bikes: [
            dock('Camden Road, Camden Town', 120, 7),
            dock('Bayham Street, Camden Town', 260, 0),
            dock('Pratt Street, Camden Town', 340, 15),
            dock('Arlington Road, Camden Town', 470, 3),
        ],
    },
} satisfies Meta<typeof BikeList>

export default meta
type Story = StoryObj<typeof meta>

export const SeveralDocks: Story = {}

export const OneDock: Story = {
    args: { bikes: [dock('Camden Road, Camden Town', 120, 1)] },
}

export const NoDock: Story = {
    args: { bikes: [] },
}
