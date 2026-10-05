import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
// Same fonts and global styles (design tokens) as the app
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import '../src/index.css'
import { applyThemePreference, type ThemePreference } from '../src/theme/theme'

const preview: Preview = {
    // Toolbar switch to preview every story in light or dark
    globalTypes: {
        theme: {
            description: 'Colour theme',
            toolbar: {
                title: 'Theme',
                icon: 'contrast',
                items: [
                    { value: 'system', title: 'Auto (OS)' },
                    { value: 'light', title: 'Light' },
                    { value: 'dark', title: 'Dark' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { theme: 'system' },
    decorators: [
        (Story, { globals }) => {
            const theme = (globals.theme ?? 'system') as ThemePreference
            useEffect(() => applyThemePreference(theme), [theme])
            return <Story />
        },
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },

        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: 'todo',
        },
    },
}

export default preview
