import type { ReactNode } from 'react'
import type { IconProps } from '../components/icons/Svg'
import { CloudIcon } from '../components/icons/CloudIcon'
import { CloudMoonIcon } from '../components/icons/CloudMoonIcon'
import { CloudSunIcon } from '../components/icons/CloudSunIcon'
import { DrizzleIcon } from '../components/icons/DrizzleIcon'
import { FogIcon } from '../components/icons/FogIcon'
import { MoonIcon } from '../components/icons/MoonIcon'
import { RainIcon } from '../components/icons/RainIcon'
import { SnowIcon } from '../components/icons/SnowIcon'
import { SunIcon } from '../components/icons/SunIcon'
import { ThunderstormIcon } from '../components/icons/ThunderstormIcon'

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
