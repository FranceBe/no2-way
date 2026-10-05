import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { fn } from 'storybook/test'
import { AirQualityPanel } from './AirQualityPanel'
import { makeAirReadings } from '../../fixtures/airReadings'

type PanelProps = ComponentProps<typeof AirQualityPanel>
type FixtureOptions = NonNullable<Parameters<typeof makeAirReadings>[0]>

// Keeps the range in local state so the controls are clickable;
// readings are regenerated for the selected range
const InteractivePanel = ({
    fixture,
    ...props
}: PanelProps & { fixture?: FixtureOptions }) => {
    const [hours, setHours] = useState(props.hours)
    const readings = fixture
        ? makeAirReadings({ ...fixture, hours })
        : props.readings

    return (
        <AirQualityPanel
            {...props}
            hours={hours}
            onHoursChange={(h) => {
                setHours(h)
                props.onHoursChange(h)
            }}
            readings={readings}
        />
    )
}

const meta = {
    title: 'AirQuality/AirQualityPanel',
    component: AirQualityPanel,
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <Story />
            </div>
        ),
    ],
    args: {
        locationName: 'Camden',
        hours: 48,
        onHoursChange: fn(),
    },
    render: (args, { parameters }) => (
        <InteractivePanel
            {...args}
            fixture={parameters.fixture as FixtureOptions | undefined}
        />
    ),
} satisfies Meta<typeof AirQualityPanel>

export default meta
type Story = StoryObj<typeof meta>

// ---------- Data scenarios ----------

export const TypicalDay: Story = {
    parameters: { fixture: {} },
}

export const PollutionEpisode: Story = {
    parameters: {
        fixture: { episode: { hoursAgo: 14, duration: 10, boost: 2.2 } },
    },
}

export const CleanAir: Story = {
    parameters: { fixture: { scale: 0.45 } },
}

export const LastMonth: Story = {
    args: { hours: 30 * 24 },
    parameters: {
        fixture: { episode: { hoursAgo: 200, duration: 30, boost: 1.6 } },
    },
}

export const MissingData: Story = {
    parameters: { fixture: { gapEvery: 7 } },
}

// ---------- Non-success states ----------

export const Loading: Story = {
    args: { isLoading: true },
}

export const Refreshing: Story = {
    args: { isRefreshing: true },
    parameters: { fixture: {} },
}

export const ErrorState: Story = {
    name: 'Error',
    args: { error: 'Unknown or missing location' },
}

export const Empty: Story = {
    args: { readings: [] },
}
