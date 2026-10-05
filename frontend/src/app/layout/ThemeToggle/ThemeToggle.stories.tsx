import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeToggle } from './ThemeToggle'

const meta = {
    title: 'Design System/ThemeToggle',
    component: ThemeToggle,
    parameters: { layout: 'centered' },
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

// Clicking it switches the theme of the whole Storybook preview
export const Default: Story = {}
