import { useMemo } from 'react'
import { readTokens, useResolvedTheme } from '@/shared/theme/theme'
import type { AqiLevelId } from './aqi'

// Recharts sets colours as SVG attributes, where CSS variables don't work:
// the chart reads the design tokens (theme/tokens.css) and re-reads them on theme change

export interface AirPalette {
    levels: Record<AqiLevelId, string>
    series: string
    surface: string
    axis: string
    muted: string
}

const TOKENS = [
    'aqi-good',
    'aqi-fair',
    'aqi-moderate',
    'aqi-poor',
    'aqi-very-poor',
    'aqi-extremely-poor',
    'viz-series',
    'viz-axis',
    'viz-label',
    'color-surface',
] as const

// Background bands get more opaque as the air gets worse
export const BAND_OPACITY: Record<AqiLevelId, number> = {
    good: 0.16,
    fair: 0.16,
    moderate: 0.16,
    poor: 0.18,
    'very-poor': 0.2,
    'extremely-poor': 0.22,
}

export function useAirPalette(): AirPalette {
    const theme = useResolvedTheme()

    return useMemo(() => {
        const t = readTokens(TOKENS)
        return {
            levels: {
                good: t['aqi-good'],
                fair: t['aqi-fair'],
                moderate: t['aqi-moderate'],
                poor: t['aqi-poor'],
                'very-poor': t['aqi-very-poor'],
                'extremely-poor': t['aqi-extremely-poor'],
            },
            series: t['viz-series'],
            surface: t['color-surface'],
            axis: t['viz-axis'],
            muted: t['viz-label'],
        }
        // Tokens change with the theme only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme])
}
