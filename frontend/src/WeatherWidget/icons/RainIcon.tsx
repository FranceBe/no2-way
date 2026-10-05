import { Svg, type IconProps } from './Svg'

export const RainIcon = (props: IconProps) => (
    <Svg {...props}>
        <path
            className="wx-cloud wx-cloud--wet"
            d="M7 15h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.1A3.5 3.5 0 0 0 7 15z"
        />
        <path
            className="wx-rain"
            d="M9 17.5l-1.5 4M13 17.5l-1.5 4M17 17.5l-1.5 4"
        />
    </Svg>
)
