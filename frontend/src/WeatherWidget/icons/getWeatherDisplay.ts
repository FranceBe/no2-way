import type { ReactNode } from 'react'
import type { IconProps } from './Svg'
import { CloudIcon } from './CloudIcon'
import { CloudMoonIcon } from './CloudMoonIcon'
import { CloudSunIcon } from './CloudSunIcon'
import { DrizzleIcon } from './DrizzleIcon'
import { FogIcon } from './FogIcon'
import { MoonIcon } from './MoonIcon'
import { RainIcon } from './RainIcon'
import { SnowIcon } from './SnowIcon'
import { SunIcon } from './SunIcon'
import { ThunderstormIcon } from './ThunderstormIcon'

// ---------- WMO weather code -> icon and label ----------

type IconComponent = (props: IconProps) => ReactNode

export interface WeatherDisplay {
    Icon: IconComponent
    label: string
}

export function getWeatherDisplay(
    code: number,
    isDay: boolean
): WeatherDisplay {
    if (code === 0)
        return { Icon: isDay ? SunIcon : MoonIcon, label: 'Clear sky' }
    if (code === 1)
        return {
            Icon: isDay ? CloudSunIcon : CloudMoonIcon,
            label: 'Mainly clear',
        }
    if (code === 2)
        return {
            Icon: isDay ? CloudSunIcon : CloudMoonIcon,
            label: 'Partly cloudy',
        }
    if (code === 3) return { Icon: CloudIcon, label: 'Overcast' }
    if (code === 45 || code === 48) return { Icon: FogIcon, label: 'Fog' }
    if (code >= 51 && code <= 57) return { Icon: DrizzleIcon, label: 'Drizzle' }
    if (code === 66 || code === 67)
        return { Icon: RainIcon, label: 'Freezing rain' }
    if (code >= 61 && code <= 65) return { Icon: RainIcon, label: 'Rain' }
    if (code >= 71 && code <= 77) return { Icon: SnowIcon, label: 'Snow' }
    if (code >= 80 && code <= 82)
        return { Icon: RainIcon, label: 'Rain showers' }
    if (code === 85 || code === 86)
        return { Icon: SnowIcon, label: 'Snow showers' }
    if (code >= 95 && code <= 99)
        return { Icon: ThunderstormIcon, label: 'Thunderstorm' }
    return { Icon: CloudIcon, label: 'Unknown' }
}
