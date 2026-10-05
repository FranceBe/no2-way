import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Schedule } from '@no2-way/shared'
import { FirstLastTrainsView } from './FirstLastTrains'

// What the Northern line returns at Camden Town
const SCHEDULES: Schedule[] = [
    { name: 'Monday - Thursday', first: '05:42', last: '00:31' },
    { name: 'Friday', first: '05:42', last: '00:34' },
    { name: 'Saturday (also Good Friday)', first: '05:54', last: '00:29' },
    { name: 'Sunday', first: '07:01', last: '23:48' },
]

const meta = {
    title: 'Transport/FirstLastTrains',
    component: FirstLastTrainsView,
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 480 }}>
                <Story />
            </div>
        ),
    ],
    args: { schedules: SCHEDULES, today: SCHEDULES[1] },
} satisfies Meta<typeof FirstLastTrainsView>

export default meta
type Story = StoryObj<typeof meta>

export const Friday: Story = {}

export const NoScheduleToday: Story = {
    args: { today: undefined },
}

export const NoTimetable: Story = {
    args: { schedules: [], today: undefined },
}
