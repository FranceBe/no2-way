import type { AirReading } from '@no2-way/shared'
import { parseTs } from '@/shared/time'

// One point per hour, x = epoch ms so the time axis is linear (gaps stay gaps)
export interface ChartPoint {
    time: number
    aqi: number | null
    pm2_5: number | null
    pm10: number | null
    nitrogen_dioxide: number | null
    ozone: number | null
}

export const toChartPoints = (readings: AirReading[]): ChartPoint[] =>
    readings.map((r) => ({
        time: parseTs(r.ts),
        aqi: r.european_aqi,
        pm2_5: r.pm2_5,
        pm10: r.pm10,
        nitrogen_dioxide: r.nitrogen_dioxide,
        ozone: r.ozone,
    }))

// All the charts of the widget share it, so hovering one moves the crosshair on all
export const SYNC_ID = 'air-quality'
