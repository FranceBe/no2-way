import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { AQI_LEVELS } from '../AirQualityWidget/aqi'
import { readTokens, useResolvedTheme } from './theme'

// Live view of theme/tokens.css: values are read from the page, so they always
// match the current theme (switch it with the toolbar or the ThemeToggle)

const meta = {
    title: 'Design System/Tokens',
    parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Section = ({
    title,
    note,
    children,
}: {
    title: string
    note?: string
    children: ReactNode
}) => (
    <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>{title}</h2>
        {note && (
            <p
                style={{
                    fontSize: 14,
                    color: 'var(--color-muted)',
                    marginBottom: 12,
                }}
            >
                {note}
            </p>
        )}
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: 12,
            }}
        >
            {children}
        </div>
    </section>
)

const Swatch = ({ token, label }: { token: string; label: string }) => {
    useResolvedTheme() // re-render (and re-read the value) on theme change
    const value = readTokens([token])[token]
    return (
        <figure style={{ margin: 0 }}>
            <div
                style={{
                    height: 64,
                    borderRadius: 'var(--radius-md)',
                    background: `var(--${token})`,
                    border: '1px solid var(--color-border)',
                }}
            />
            <figcaption style={{ marginTop: 6, fontSize: 13 }}>
                <strong style={{ color: 'var(--color-text)' }}>{label}</strong>
                <br />
                <code style={{ fontSize: 12 }}>--{token}</code>
                <br />
                <code style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    {value}
                </code>
            </figcaption>
        </figure>
    )
}

export const Colours: Story = {
    render: () => (
        <div
            style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-2)',
            }}
        >
            <Section
                title="Brand"
                note="Navy carries the identity. Red is a brand touch only (top bar), never a UI state."
            >
                <Swatch token="brand-navy" label="Navy" />
                <Swatch token="brand-red" label="London red" />
            </Section>
            <Section
                title="Surfaces & ink"
                note="All text colours pass WCAG AA (4.5:1) on bg and surface."
            >
                <Swatch token="color-bg" label="Background" />
                <Swatch token="color-surface" label="Surface" />
                <Swatch token="color-surface-2" label="Surface 2" />
                <Swatch token="color-text" label="Text" />
                <Swatch token="color-text-2" label="Text secondary" />
                <Swatch token="color-muted" label="Muted" />
            </Section>
            <Section
                title="Accent"
                note="Deep teal for UI only (buttons, links, focus). Never used for data."
            >
                <Swatch token="color-accent" label="Accent" />
                <Swatch token="color-accent-hover" label="Accent hover" />
                <Swatch token="color-accent-soft" label="Accent soft" />
            </Section>
            <Section title="Data viz">
                <Swatch token="viz-series" label="Main series" />
                <Swatch token="viz-axis" label="Axis" />
                <Swatch token="viz-label" label="Axis labels" />
            </Section>
            <Section
                title="European AQI (adjusted EEA)"
                note="Lighter = better. Validated for colour-blind separation; always shown with its label."
            >
                {AQI_LEVELS.map((level) => (
                    <Swatch
                        key={level.id}
                        token={`aqi-${level.id}`}
                        label={level.label}
                    />
                ))}
            </Section>
        </div>
    ),
}

export const Typography: Story = {
    render: () => (
        <div
            style={{
                display: 'grid',
                gap: 24,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-2)',
            }}
        >
            <div>
                <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    Headings · Space Grotesk (OFL 1.1)
                </p>
                <h1 style={{ fontSize: 40 }}>Air quality in Camden</h1>
                <h2 style={{ fontSize: 22 }}>European AQI, hourly</h2>
                <p
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 34,
                        fontWeight: 600,
                        color: 'var(--color-text)',
                    }}
                >
                    18°C · AQI 42
                </p>
            </div>
            <div>
                <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                    Body & numbers · Inter (OFL 1.1)
                </p>
                <p style={{ maxWidth: 560 }}>
                    Modelled data from Open-Meteo (~10 km grid), not
                    street-level sensors. NO₂ peaks during rush hours, around
                    8:00 and 18:00.
                </p>
                <p
                    style={{
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--color-text)',
                    }}
                >
                    0123456789 · 61.7 µg/m³ · 13 km/h
                </p>
            </div>
        </div>
    ),
}
